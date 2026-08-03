#!/usr/bin/env python3
"""Guarded, action-oriented PR automation.

This module deliberately keeps the policy engine separate from the GitHub CLI
adapter so the decisions and the write boundary can be tested without a live
repository.  The GitHub action invokes this file in the repository that owns
the PR, so its GITHUB_TOKEN cannot accidentally write another repository.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, asdict
import json
import os
import re
import shlex
import subprocess
from typing import Any, Protocol


DEPENDABOT_AUTHORS = {"dependabot", "dependabot[bot]"}
CODEX_REVIEW_AUTHORS = {
    "chatgpt-codex-connector",
    "chatgpt-codex-connector[bot]",
}

PASS_STATES = {"SUCCESS", "NEUTRAL", "SKIPPED", "COMPLETED"}
FAIL_STATES = {
    "ACTION_REQUIRED",
    "CANCELLED",
    "ERROR",
    "FAILURE",
    "FAILED",
    "STARTUP_FAILURE",
    "STALE",
    "TIMED_OUT",
}
PENDING_STATES = {"EXPECTED", "IN_PROGRESS", "PENDING", "QUEUED", "REQUESTED", "WAITING"}

TRUSTED_AUTHOR_ASSOCIATIONS = {"OWNER", "MEMBER", "COLLABORATOR"}

# These are the transitions an approved event-driven caller must observe.  The
# workflow in this PR is deliberately human-invoked and does not subscribe to
# them yet; keeping the contract in the policy module prevents a future caller
# from forgetting that checks and review state arrive after PR metadata.
EVENT_REEVALUATION_EVENTS = {
    "workflow_run": {"completed"},
    "pull_request_review": {"submitted", "edited", "dismissed"},
    "pull_request_review_comment": {"created", "edited", "deleted"},
}

SAFE_DEPENDENCY_FILES = {
    "package.json",
    "package-lock.json",
    "npm-shrinkwrap.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "poetry.lock",
    "pipfile.lock",
    "requirements.txt",
    "requirements-dev.txt",
    "gemfile.lock",
    "cargo.lock",
    "go.sum",
}

UNSAFE_PATH_RE = re.compile(
    r"(^|/)(\.github|\.claude|\.agents|auth|billing|payments?|secrets?|"
    r"runtime|deploy|production|prod|migrations?|schema|database|guest|"
    r"reservation|webhook|worker|cron)(/|$)|(^|/)(AGENTS|CLAUDE)\.md$|\.env",
    re.IGNORECASE,
)

MARKER = "<!-- pr-steward:v1:{kind}:{head} -->"


@dataclass(frozen=True)
class Policy:
    auto_merge_dependabot_patch_minor: bool = True
    require_protected_required_checks: bool = True
    max_actions: int = 10


@dataclass(frozen=True)
class ActionPlan:
    repo: str
    number: int
    head_oid: str
    kind: str
    summary: str
    reason: str
    message: str = ""


class Client(Protocol):
    def list_prs(self, repo: str) -> list[dict[str, Any]]: ...

    def get_pr(self, repo: str, number: int) -> dict[str, Any]: ...

    def get_detail(self, repo: str, number: int) -> dict[str, Any]: ...

    def has_required_checks(self, repo: str, base: str) -> bool: ...

    def comment(self, repo: str, number: int, body: str) -> None: ...

    def enable_auto_merge(self, repo: str, number: int, head_oid: str) -> None: ...


def event_requires_reevaluation(event_name: str, action: str) -> bool:
    """Return whether an opt-in event caller must re-read the complete PR state."""

    return action.lower() in EVENT_REEVALUATION_EVENTS.get(event_name, set())


def author_login(pr: dict[str, Any]) -> str:
    author = pr.get("author")
    if isinstance(author, dict):
        return str(author.get("login") or "").strip().lower()
    return str(author or "").strip().lower()


def is_dependabot(pr: dict[str, Any]) -> bool:
    return author_login(pr) in DEPENDABOT_AUTHORS


def _repository_name(value: Any) -> str:
    if isinstance(value, dict):
        value = value.get("nameWithOwner") or value.get("full_name") or value.get("name")
    return str(value or "").strip().lower()


def is_forked_pr(pr: dict[str, Any], repo: str) -> bool:
    """Reject cross-repository heads even when the author is otherwise trusted."""

    if pr.get("isCrossRepository") is True or pr.get("is_cross_repository") is True:
        return True
    expected = repo.strip().lower()
    head_repo = _repository_name(pr.get("headRepository") or pr.get("head_repository"))
    base_repo = _repository_name(pr.get("baseRepository") or pr.get("base_repository"))
    if head_repo and head_repo != expected:
        return True
    if base_repo and base_repo != expected:
        return True
    if head_repo and base_repo and head_repo != base_repo:
        return True
    return False


def trusted_pr(pr: dict[str, Any], repo: str) -> bool:
    """Require an owner/member/collaborator same-repository PR before writes."""

    if is_forked_pr(pr, repo):
        return False
    login = author_login(pr)
    if login in DEPENDABOT_AUTHORS:
        # Dependabot is a known automation identity, but a forked Dependabot
        # head was rejected above and never receives a write action.
        return True
    association = str(
        pr.get("authorAssociation")
        or pr.get("author_association")
        or ""
    ).strip().upper()
    return association in TRUSTED_AUTHOR_ASSOCIATIONS


def changed_paths(pr: dict[str, Any]) -> list[str]:
    raw = pr.get("files") or []
    paths: list[str] = []
    for item in raw:
        if isinstance(item, str):
            paths.append(item)
        elif isinstance(item, dict):
            path = item.get("path") or item.get("filename")
            if path:
                paths.append(str(path))
    return paths


def check_state(item: dict[str, Any]) -> str:
    return str(
        item.get("conclusion")
        or item.get("state")
        or item.get("status")
        or ""
    ).upper()


def check_summary(pr: dict[str, Any]) -> tuple[bool, bool, bool]:
    """Return (green, failed, pending); no checks is not green."""

    checks = pr.get("statusCheckRollup") or pr.get("checks") or []
    if not isinstance(checks, list) or not checks:
        return False, False, False
    failed = False
    pending = False
    for item in checks:
        if not isinstance(item, dict):
            return False, True, False
        state = check_state(item)
        if state in FAIL_STATES:
            failed = True
        elif state in PENDING_STATES:
            pending = True
        elif state not in PASS_STATES:
            return False, True, False
    return not failed and not pending, failed, pending


def current_threads(detail: dict[str, Any]) -> list[dict[str, Any]]:
    raw = detail.get("reviewThreads")
    if raw is None:
        raw = detail.get("threads") or []
    if not isinstance(raw, list):
        return [{"isResolved": False, "isOutdated": False, "invalid": True}]
    return [item for item in raw if isinstance(item, dict)]


def unresolved_current_threads(detail: dict[str, Any]) -> list[dict[str, Any]]:
    return [
        thread
        for thread in current_threads(detail)
        if thread.get("isResolved") is False and thread.get("isOutdated") is False
    ]


def review_detail_complete(detail: dict[str, Any]) -> bool:
    """Fail closed when the review/thread snapshot is incomplete or malformed."""

    if not all(isinstance(detail.get(key), list) for key in ("comments", "reviews", "reviewThreads")):
        return False
    for thread in detail["reviewThreads"]:
        if not isinstance(thread, dict):
            return False
        if not isinstance(thread.get("isResolved"), bool) or not isinstance(thread.get("isOutdated"), bool):
            return False
    return True


def _review_commit_oid(review: dict[str, Any]) -> str:
    commit = review.get("commit")
    if isinstance(commit, dict):
        return str(commit.get("oid") or commit.get("sha") or "").strip()
    return str(review.get("commitOid") or review.get("commit_id") or "").strip()


def _clean_review_body(body: str) -> bool:
    text = " ".join(body.split()).strip()
    if not text:
        return False
    lowered = text.casefold()
    if "codex review" not in lowered:
        return False
    if re.search(r"\b(?:not|isn't|is not|wasn't|was not)\s+clean\b", lowered):
        return False
    if any(phrase in lowered for phrase in ("request changes", "blocking finding", "actionable finding:")):
        return False
    return bool(
        re.search(r"\bclean\b", lowered)
        or "no actionable findings" in lowered
        or "no blocking findings" in lowered
        or "no issues" in lowered
    )


def exact_codex_review(pr: dict[str, Any], detail: dict[str, Any]) -> bool:
    reviews = detail.get("reviews") or pr.get("reviews") or []
    if not isinstance(reviews, list):
        return False
    head = str(pr.get("headRefOid") or pr.get("head_oid") or "")
    for review in reviews:
        if not isinstance(review, dict):
            continue
        author = review.get("author")
        login = str(author.get("login") or "").strip().lower() if isinstance(author, dict) else str(author or "").strip().lower()
        state = str(review.get("state") or "").strip().upper()
        body = str(review.get("body") or "")
        if (
            login in CODEX_REVIEW_AUTHORS
            and state in {"APPROVED", "COMMENTED"}
            and _review_commit_oid(review) == head
            and _clean_review_body(body)
        ):
            return True
    return False


def existing_marker(detail: dict[str, Any], kind: str, head: str) -> bool:
    comments = detail.get("comments")
    marker = MARKER.format(kind=kind, head=head)
    if not isinstance(comments, list):
        return False
    return any(marker in str(item.get("body") if isinstance(item, dict) else item) for item in comments)


def patch_minor_dependency_update(pr: dict[str, Any]) -> bool:
    """Require an explicit from/to version and reject major/security updates."""

    title = str(pr.get("title") or "")
    lowered = title.lower()
    if not is_dependabot(pr) or "security" in lowered or "vulnerability" in lowered:
        return False
    if any(word in lowered for word in ("major", "breaking", "epoch")):
        return False
    versions = re.search(
        r"\b(?:from\s+)?v?(\d+)\.(\d+)(?:\.\d+)?\s+to\s+v?(\d+)\.(\d+)(?:\.\d+)?\b",
        title,
        re.IGNORECASE,
    )
    if not versions:
        return False
    old_major, old_minor, new_major, new_minor = map(int, versions.groups())
    if old_major != new_major or new_minor < old_minor:
        return False
    # A 0.x minor bump is commonly a breaking change even though the numeric
    # major stays at zero. Keep it in the reviewed exception lane.
    if old_major == 0 and new_minor != old_minor:
        return False
    paths = changed_paths(pr)
    if not paths or any(path.rsplit("/", 1)[-1].lower() not in SAFE_DEPENDENCY_FILES for path in paths):
        return False
    if any(UNSAFE_PATH_RE.search(path) for path in paths):
        return False
    return True


def action_message(kind: str, head: str) -> str:
    marker = MARKER.format(kind=kind, head=head)
    if kind == "request_review":
        return (
            "@codex review\n\n"
            "Review this exact PR head for consequential bugs. Use the repository rules, "
            "report only actionable findings, and do not merge.\n\n"
            f"{marker}"
        )
    if kind == "fix_review":
        return (
            "@codex fix the current unresolved review findings on this PR. Work only on "
            "this branch, run the relevant tests, preserve the PR scope, and do not merge.\n\n"
            f"{marker}"
        )
    if kind == "fix_ci":
        return (
            "@codex fix the failing checks on this PR. Work only on this branch, run the "
            "relevant tests, preserve the PR scope, and do not merge.\n\n"
            f"{marker}"
        )
    return marker


def plan_for_pr(
    repo: str,
    pr: dict[str, Any],
    detail: dict[str, Any],
    *,
    protected_required_checks: bool,
    policy: Policy = Policy(),
) -> ActionPlan:
    number = int(pr.get("number") or 0)
    head = str(pr.get("headRefOid") or pr.get("head_oid") or "")
    base = str(pr.get("baseRefName") or pr.get("base") or "main")
    common = {"repo": repo, "number": number, "head_oid": head}
    if number <= 0 or not head or not base:
        return ActionPlan(**common, kind="hold", summary="Incomplete PR identity", reason="Missing number, head, or base.")
    if pr.get("isDraft"):
        return ActionPlan(**common, kind="skip", summary="Draft PR", reason="Drafts are not acted on.")
    if str(pr.get("state") or "OPEN").upper() != "OPEN":
        return ActionPlan(**common, kind="skip", summary="Closed PR", reason="Only open PRs are eligible.")
    if not trusted_pr(pr, repo):
        return ActionPlan(
            **common,
            kind="hold",
            summary="Untrusted PR boundary",
            reason="The author is not trusted or the head is from a fork; no Codex or merge write is permitted.",
        )
    if not review_detail_complete(detail):
        return ActionPlan(
            **common,
            kind="hold",
            summary="Review state unavailable",
            reason="The complete review, comment, or thread snapshot was not available.",
        )

    green, failed, pending = check_summary(pr)
    unresolved = unresolved_current_threads(detail)
    review_present = exact_codex_review(pr, detail)
    mergeable = str(pr.get("mergeable") or "").upper()
    merge_state = str(pr.get("mergeStateStatus") or "").upper()

    if unresolved:
        if not existing_marker(detail, "fix_review", head):
            return ActionPlan(
                **common,
                kind="fix_review",
                summary="Ask Codex to repair current review findings",
                reason=f"{len(unresolved)} current unresolved review thread(s).",
                message=action_message("fix_review", head),
            )
        return ActionPlan(**common, kind="hold", summary="Waiting for Codex fix", reason="A fix request already exists for this exact head.")
    if failed:
        if not existing_marker(detail, "fix_ci", head):
            return ActionPlan(
                **common,
                kind="fix_ci",
                summary="Ask Codex to repair failing checks",
                reason="At least one check is failing.",
                message=action_message("fix_ci", head),
            )
        return ActionPlan(**common, kind="hold", summary="Waiting for Codex CI fix", reason="A CI fix request already exists for this exact head.")
    if pending or not green:
        return ActionPlan(**common, kind="hold", summary="Wait for required checks", reason="Checks are pending or no checks are reported.")

    if mergeable in {"CONFLICTING", "UNKNOWN"} or merge_state in {"BEHIND", "DIRTY", "UNKNOWN"}:
        return ActionPlan(**common, kind="hold", summary="Branch needs reconciliation", reason="GitHub does not report a clean or blocked merge state.")

    if is_dependabot(pr) and patch_minor_dependency_update(pr):
        if not review_present:
            if not existing_marker(detail, "request_review", head):
                return ActionPlan(
                    **common,
                    kind="request_review",
                    summary="Request one fresh Codex review",
                    reason="Even a routine Dependabot update needs a non-empty clean exact-head review before auto-merge.",
                    message=action_message("request_review", head),
                )
            return ActionPlan(
                **common,
                kind="hold",
                summary="Waiting for clean exact-head review",
                reason="A review request already exists for this exact head, but no valid clean receipt is present.",
            )
        if policy.auto_merge_dependabot_patch_minor and (
            not policy.require_protected_required_checks or protected_required_checks
        ):
            return ActionPlan(
                **common,
                kind="enable_auto_merge",
                summary="Enable guarded auto-merge",
                reason="Dependabot patch/minor update; dependency-only files; green checks; protected branch checks present.",
            )
        return ActionPlan(**common, kind="hold", summary="Routine update not auto-mergeable", reason="Required branch protection is not proven.")

    if not review_present and not existing_marker(detail, "request_review", head):
        return ActionPlan(
            **common,
            kind="request_review",
            summary="Request one fresh Codex review",
            reason="This is an exception PR or a non-routine dependency update without an exact-head review.",
            message=action_message("request_review", head),
        )
    if not review_present:
        return ActionPlan(**common, kind="hold", summary="Waiting for Codex review", reason="A review request already exists for this exact head.")
    return ActionPlan(**common, kind="hold", summary="Human-risk gate remains", reason="Review and checks are present, but this PR is not eligible for automatic merge.")


def _head_is_still_current(client: Client, plan: ActionPlan) -> bool:
    current = client.get_pr(plan.repo, plan.number)
    current_head = str(current.get("headRefOid") or current.get("head_oid") or "")
    return current_head == plan.head_oid


def apply_plan(client: Client, plan: ActionPlan) -> bool:
    # Re-read immediately before every write.  The merge call also carries the
    # evaluated OID as an atomic GitHub optimistic-concurrency guard; comments
    # are skipped if the head changed before their marker could be posted.
    if not _head_is_still_current(client, plan):
        return False
    if plan.kind == "enable_auto_merge":
        client.enable_auto_merge(plan.repo, plan.number, plan.head_oid)
        return True
    elif plan.kind in {"request_review", "fix_review", "fix_ci"}:
        client.comment(plan.repo, plan.number, plan.message)
        return True
    return False


def run_once(
    client: Client,
    repo: str,
    *,
    pr_number: int | None = None,
    mode: str = "plan",
    policy: Policy = Policy(),
) -> list[ActionPlan]:
    prs = [client.get_pr(repo, pr_number)] if pr_number else client.list_prs(repo)
    plans: list[ActionPlan] = []
    writes = 0
    for pr in prs:
        number = int(pr.get("number") or 0)
        detail = client.get_detail(repo, number)
        base = str(pr.get("baseRefName") or "main")
        protected = client.has_required_checks(repo, base)
        plan = plan_for_pr(repo, pr, detail, protected_required_checks=protected, policy=policy)
        plans.append(plan)
        if mode == "act" and plan.kind in {"enable_auto_merge", "request_review", "fix_review", "fix_ci"}:
            if writes >= policy.max_actions:
                continue
            if apply_plan(client, plan):
                writes += 1
    return plans


class GhClient:
    def _run(self, args: list[str], *, input_text: str | None = None) -> str:
        completed = subprocess.run(
            ["gh", *args],
            input=input_text,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        if completed.returncode != 0:
            command = " ".join(shlex.quote(arg) for arg in args)
            raise RuntimeError(f"gh failed ({completed.returncode}): {command}: {completed.stderr.strip()}")
        return completed.stdout

    def _json(self, args: list[str]) -> Any:
        return json.loads(self._run(args))

    def list_prs(self, repo: str) -> list[dict[str, Any]]:
        fields = "number,title,url,author,headRefOid,baseRefName,isDraft,state,mergeable,mergeStateStatus,files,statusCheckRollup,headRepository,baseRepository,isCrossRepository"
        prs = list(self._json(["pr", "list", "--repo", repo, "--state", "open", "--limit", "100", "--json", fields]))
        return [self._enrich_trust_fields(repo, pr) for pr in prs]

    def get_pr(self, repo: str, number: int) -> dict[str, Any]:
        fields = "number,title,url,author,headRefOid,baseRefName,isDraft,state,mergeable,mergeStateStatus,files,statusCheckRollup,headRepository,baseRepository,isCrossRepository"
        return self._enrich_trust_fields(repo, dict(self._json(["pr", "view", str(number), "--repo", repo, "--json", fields])))

    def _enrich_trust_fields(self, repo: str, pr: dict[str, Any]) -> dict[str, Any]:
        """Add REST-only author association and fail closed on metadata errors."""

        number = int(pr.get("number") or 0)
        try:
            raw = self._json(["api", f"repos/{repo}/pulls/{number}"])
            pr["authorAssociation"] = raw.get("author_association")
            head = raw.get("head") or {}
            base = raw.get("base") or {}
            head_repo = (head.get("repo") or {}).get("full_name")
            base_repo = (base.get("repo") or {}).get("full_name")
            pr["headRepository"] = head_repo
            pr["baseRepository"] = base_repo
            pr["isCrossRepository"] = bool(
                pr.get("isCrossRepository")
                or (head_repo and base_repo and head_repo.lower() != base_repo.lower())
            )
        except (RuntimeError, ValueError, TypeError, AttributeError):
            pr["authorAssociation"] = ""
            pr["isCrossRepository"] = True
        return pr

    def get_detail(self, repo: str, number: int) -> dict[str, Any]:
        owner, name = repo.split("/", 1)
        query = """
        query($owner:String!, $name:String!, $number:Int!) {
          repository(owner:$owner, name:$name) {
            pullRequest(number:$number) {
              comments(last:100) { nodes { body } pageInfo { hasNextPage hasPreviousPage } }
              reviews(last:100) { nodes { author { login } state body commit { oid } } pageInfo { hasNextPage hasPreviousPage } }
              reviewThreads(first:100) { nodes { isResolved isOutdated } pageInfo { hasNextPage hasPreviousPage } }
            }
          }
        }
        """
        payload = self._json([
            "api", "graphql", "-f", f"query={query}",
            "-F", f"owner={owner}", "-F", f"name={name}", "-F", f"number={number}",
        ])
        if payload.get("errors"):
            raise RuntimeError("GitHub detail response contained GraphQL errors")
        try:
            pr = payload["data"]["repository"]["pullRequest"]
            for key in ("comments", "reviews", "reviewThreads"):
                page = pr[key].get("pageInfo", {})
                if page.get("hasNextPage") or page.get("hasPreviousPage"):
                    raise RuntimeError(f"{key} is paginated; refusing to guess")
            return {
                "comments": pr["comments"]["nodes"],
                "reviews": pr["reviews"]["nodes"],
                "reviewThreads": pr["reviewThreads"]["nodes"],
            }
        except (KeyError, TypeError) as exc:
            raise RuntimeError("GitHub detail response was incomplete") from exc

    def has_required_checks(self, repo: str, base: str) -> bool:
        try:
            payload = self._json(["api", f"repos/{repo}/branches/{base}/protection/required_status_checks"])
        except RuntimeError:
            # A missing protection rule, an inaccessible branch, and an API
            # read failure are all unsafe for auto-merge.  They become a
            # visible hold through the policy engine rather than a guessed
            # green result or a run-wide crash.
            return False
        return bool(payload.get("contexts") or payload.get("checks"))

    def comment(self, repo: str, number: int, body: str) -> None:
        self._run(["pr", "comment", str(number), "--repo", repo, "--body", body])

    def enable_auto_merge(self, repo: str, number: int, head_oid: str) -> None:
        self._run([
            "pr",
            "merge",
            str(number),
            "--repo",
            repo,
            "--auto",
            "--squash",
            "--match-head-commit",
            head_oid,
            "--delete-branch=false",
        ])


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Perform guarded PR actions in one owning repository.")
    parser.add_argument("--repo", default=os.environ.get("GITHUB_REPOSITORY", ""))
    parser.add_argument("--pr", type=int, default=None)
    parser.add_argument("--mode", choices=("plan", "act"), default="plan")
    parser.add_argument("--max-actions", type=int, default=10)
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    if not args.repo or "/" not in args.repo:
        raise SystemExit("--repo owner/name is required")
    if args.max_actions < 1:
        raise SystemExit("--max-actions must be positive")
    plans = run_once(
        GhClient(),
        args.repo,
        pr_number=args.pr,
        mode=args.mode,
        policy=Policy(max_actions=args.max_actions),
    )
    print(json.dumps({"mode": args.mode, "repo": args.repo, "actions": [asdict(plan) for plan in plans]}, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
