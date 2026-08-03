#!/usr/bin/env python3

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path
from types import SimpleNamespace


def load_module():
    path = Path(__file__).parents[1] / ".github" / "actions" / "pr-steward" / "pr_auto_steward.py"
    if not path.exists():
        path = Path(__file__).with_name("pr_auto_steward.py")
    spec = importlib.util.spec_from_file_location("pr_auto_steward", path)
    module = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class FakeClient:
    def __init__(self, pr_value, detail_value, *, protected=True, pr_reads=None):
        self.pr = pr_value
        self.detail = detail_value
        self.protected = protected
        self.pr_reads = list(pr_reads or [])
        self.actions = []

    def list_prs(self, repo):
        return [self.pr]

    def get_pr(self, repo, number):
        if self.pr_reads:
            return self.pr_reads.pop(0)
        return self.pr

    def get_detail(self, repo, number):
        return self.detail

    def has_required_checks(self, repo, base):
        return self.protected

    def comment(self, repo, number, body):
        self.actions.append(("comment", repo, number, body))

    def enable_auto_merge(self, repo, number, head_oid):
        self.actions.append(("auto-merge", repo, number, head_oid))


def pr(number=1, **overrides):
    value = {
        "number": number,
        "title": "Bump widget from 1.2.3 to 1.3.0",
        "author": {"login": "dependabot[bot]"},
        "authorAssociation": "MEMBER",
        "headRefOid": f"head-{number}",
        "baseRefName": "main",
        "headRepository": "owner/repo",
        "baseRepository": "owner/repo",
        "isCrossRepository": False,
        "isDraft": False,
        "state": "OPEN",
        "mergeable": "MERGEABLE",
        "mergeStateStatus": "CLEAN",
        "files": [{"path": "package.json"}, {"path": "package-lock.json"}],
        "statusCheckRollup": [{"conclusion": "SUCCESS"}],
    }
    value.update(overrides)
    return value


def detail(**overrides):
    value = {"comments": [], "reviews": [], "reviewThreads": []}
    value.update(overrides)
    return value


def clean_review(head, *, author="chatgpt-codex-connector", body="Codex Review: CLEAN — full branch review; no actionable findings."):
    return {
        "author": {"login": author},
        "state": "APPROVED",
        "body": body,
        "commit": {"oid": head},
    }


def check(condition, message):
    if not condition:
        raise AssertionError(message)
    print(f"PASS: {message}")


def run(mod, client):
    return mod.run_once(client, "owner/repo", mode="act")[0]


def main():
    mod = load_module()

    # A routine update cannot skip the review receipt anymore.
    missing = FakeClient(pr(), detail())
    plan = run(mod, missing)
    check(plan.kind == "request_review", "missing review receipt requests review")
    check(len(missing.actions) == 1 and "@codex review" in missing.actions[0][3], "review request is emitted once")
    check(not any(action[0] == "auto-merge" for action in missing.actions), "missing receipt never auto-merges")

    # Empty, dirty, stale, and forged receipts are not clean exact-head receipts.
    for label, receipt in [
        ("empty", clean_review("head-1", body="")),
        ("dirty", clean_review("head-1", body="Codex Review: not clean; blocking finding.")),
        ("stale", clean_review("old-head")),
        ("forged", clean_review("head-1", author="attacker")),
    ]:
        client = FakeClient(pr(), detail(reviews=[receipt]))
        plan = run(mod, client)
        check(plan.kind == "request_review", f"{label} review receipt is rejected")
        check(not any(action[0] == "auto-merge" for action in client.actions), f"{label} receipt cannot enable auto-merge")

    # Only a submitted, non-empty clean review by the trusted Codex identity and
    # exact evaluated head unlocks the routine path.
    valid = FakeClient(pr(), detail(reviews=[clean_review("head-1")]))
    plan = run(mod, valid)
    check(plan.kind == "enable_auto_merge", "clean exact-head review unlocks guarded merge")
    check(valid.actions == [("auto-merge", "owner/repo", 1, "head-1")], "merge receives the evaluated head")

    major = FakeClient(
        pr(title="Bump widget from 1.2.3 to 2.0.0", author={"login": "sawyer"}, authorAssociation="OWNER"),
        detail(),
    )
    plan = run(mod, major)
    check(plan.kind == "request_review", "major update requests review instead of auto-merging")
    check("@codex review" in major.actions[0][3], "major review request invokes Codex")

    zero_minor = FakeClient(
        pr(title="Bump widget from 0.8.1 to 0.9.0", author={"login": "sawyer"}, authorAssociation="OWNER"),
        detail(),
    )
    check(run(mod, zero_minor).kind == "request_review", "0.x minor updates stay in the review lane")

    # An evaluated plan is abandoned if the head changes before the write.
    head_changed = FakeClient(
        pr(),
        detail(reviews=[clean_review("head-1")]),
        pr_reads=[pr(headRefOid="head-2")],
    )
    plan = run(mod, head_changed)
    check(plan.kind == "enable_auto_merge", "race fixture starts with an eligible plan")
    check(not head_changed.actions, "head change prevents the stale write")

    # The GitHub adapter carries the same OID into GitHub's atomic merge guard.
    original_run = mod.subprocess.run
    calls = []

    def fake_run(args, **kwargs):
        calls.append(args)
        if "required_status_checks" in " ".join(args):
            return SimpleNamespace(returncode=0, stdout='{"contexts":["test"]}', stderr="")
        return SimpleNamespace(returncode=0, stdout="", stderr="")

    mod.subprocess.run = fake_run
    try:
        gh = mod.GhClient()
        gh.enable_auto_merge("owner/repo", 1, "head-1")
        gh.comment("owner/repo", 1, "@codex review")
        check_result = gh.has_required_checks("owner/repo", "main")
    finally:
        mod.subprocess.run = original_run
    check(check_result is True, "GitHub branch-protection read is consumed")
    check("--auto" in calls[0] and "--squash" in calls[0], "GitHub write uses auto-merge, not force-merge")
    check("--match-head-commit" in calls[0] and "head-1" in calls[0], "merge is atomically bound to the evaluated head")
    check("pr" in calls[1] and "comment" in calls[1], "Codex request uses a PR comment")

    # Unknown authors and all forks are held before any Codex command.
    untrusted = FakeClient(
        pr(author={"login": "unknown"}, authorAssociation="CONTRIBUTOR"),
        detail(),
    )
    untrusted.pr["statusCheckRollup"] = [{"conclusion": "FAILURE"}]
    plan = run(mod, untrusted)
    check(plan.kind == "hold", "untrusted author is held")
    check(not untrusted.actions, "untrusted author cannot issue a Codex fix")

    fork = FakeClient(
        pr(
            author={"login": "sawyer"},
            authorAssociation="OWNER",
            isCrossRepository=True,
            headRepository="attacker/repo",
        ),
        detail(),
    )
    plan = run(mod, fork)
    check(plan.kind == "hold", "forked PR is held")
    check(not fork.actions, "forked PR cannot issue a Codex command")

    # Repeated markers are idempotent, but an old-head marker cannot suppress a
    # new-head action.
    marker = mod.MARKER.format(kind="request_review", head="head-1")
    repeated = FakeClient(
        pr(title="Bump widget from 1.2.3 to 2.0.0", author={"login": "sawyer"}, authorAssociation="OWNER"),
        detail(comments=[{"body": marker}, {"body": marker}]),
    )
    plan = run(mod, repeated)
    check(plan.kind == "hold", "repeated same-head marker holds")
    check(not repeated.actions, "repeated marker prevents duplicate command")
    new_head = FakeClient(
        pr(title="Bump widget from 1.2.3 to 2.0.0", author={"login": "sawyer"}, authorAssociation="OWNER", headRefOid="head-2"),
        detail(comments=[{"body": marker}]),
    )
    plan = run(mod, new_head)
    check(plan.kind == "request_review", "old marker does not suppress a new-head request")
    check("head-2" in new_head.actions[0][3], "new marker is bound to the new head")

    # Delayed checks must be re-read; a pending first run is not a permanent
    # decision and never becomes an implicit merge authorization.
    delayed = FakeClient(
        pr(),
        detail(reviews=[clean_review("head-1")]),
    )
    delayed.pr["statusCheckRollup"] = [{"status": "IN_PROGRESS"}]
    plan = run(mod, delayed)
    check(plan.kind == "hold", "pending checks hold")
    delayed.pr["statusCheckRollup"] = [{"conclusion": "SUCCESS"}]
    plan = run(mod, delayed)
    check(plan.kind == "enable_auto_merge", "completed checks are re-evaluated")
    check(delayed.actions[-1][0] == "auto-merge", "completed checks can reach the guarded merge path")

    # A newly added current thread overrides a previously clean state and gets
    # one exact-head fix request; an existing fix marker keeps it idempotent.
    threads = FakeClient(pr(), detail(reviews=[clean_review("head-1")]))
    check(run(mod, threads).kind == "enable_auto_merge", "clean state is initially merge-eligible")
    threads.actions.clear()
    threads.detail["reviewThreads"] = [{"isResolved": False, "isOutdated": False}]
    plan = run(mod, threads)
    check(plan.kind == "fix_review", "new current thread triggers a fix request")
    check("@codex fix" in threads.actions[0][3], "new thread fix request is actionable")
    threads.actions.clear()
    threads.detail["comments"] = [{"body": mod.MARKER.format(kind="fix_review", head="head-1")}]
    check(run(mod, threads).kind == "hold", "same-head thread fix marker holds")
    check(not threads.actions, "same-head thread does not retrigger")

    unsafe = FakeClient(
        pr(files=[{"path": ".github/workflows/release.yml"}]),
        detail(),
    )
    check(run(mod, unsafe).kind == "request_review", "workflow changes never auto-merge")

    protected = FakeClient(pr(), detail(reviews=[clean_review("head-1")]), protected=False)
    check(run(mod, protected).kind == "hold", "auto-merge fails closed without required branch checks")
    check(not protected.actions, "unprotected branch receives no merge action")

    stale = FakeClient(pr(mergeStateStatus="BEHIND"), detail(reviews=[clean_review("head-1")]))
    check(run(mod, stale).kind == "hold", "behind branches never receive auto-merge")

    # Future event-driven callers must cover both delayed check completion and
    # review/thread transitions. The current workflow subscribes to none.
    check(mod.event_requires_reevaluation("workflow_run", "completed"), "check completion requires re-evaluation")
    check(mod.event_requires_reevaluation("pull_request_review", "submitted"), "new review requires re-evaluation")
    check(mod.event_requires_reevaluation("pull_request_review", "dismissed"), "review dismissal requires re-evaluation")
    check(mod.event_requires_reevaluation("pull_request_review_comment", "created"), "new review thread comment requires re-evaluation")
    check(not mod.event_requires_reevaluation("pull_request", "opened"), "ordinary PR events are not an implicit event contract")

    workflow = (Path(__file__).parents[1] / ".github" / "workflows" / "pr-steward.yml").read_text(encoding="utf-8")
    check("workflow_dispatch:" in workflow, "steward has a human-invoked entry point")
    check("pull_request_target:" not in workflow and "schedule:" not in workflow, "watcher and scheduler stay disabled")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
