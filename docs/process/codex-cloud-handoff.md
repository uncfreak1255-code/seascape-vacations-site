# Codex Cloud Handoff

Read this before submitting, reading, or integrating a Codex cloud task.
Moved from `AGENTS.md` on 2026-10-24.

The local coordinator may initiate one cloud task for a bounded, already
authorized site task when independent work can proceed from a remote commit
without local files, credentials, live services, or sibling repositories.
Use cloud when isolation or parallel work helps; keep quick dependent work
local. Keep the existing content, design, measurement, and release gates.

1. Run local `npm run git:preflight`. Name the coordinator as mutation owner
   and sole publisher; reserve the cloud task's files so local work does not
   edit them concurrently. Check for an existing handoff before submitting.
2. Default to remote `main`. Record its commit SHA and include it in the
   prompt; cloud must report its starting SHA and stop if it differs. A remote
   task branch is allowed when its published commit is the intended input.
   Keep work that depends on uncommitted local changes local.
3. Send the outcome, allowed paths, relevant source/briefs, checks, and a
   15-minute stop limit. The cloud task may edit its disposable checkout and
   run source checks; it returns a diff and command results. It must not
   commit, push, open a PR, merge, deploy, contact production, request secrets,
   expand scope, or delegate further. Machine-local `git:*` wrappers and the
   guarded local worktree remain the coordinator's publication gate.
4. Submit with `codex cloud exec --env 6abc4d04e9d48191a50506a39681e23a
   --branch main --attempts 1 "<bounded prompt>"` (replace `main` only for the
   intended remote task branch). Record the returned task ID. If submission
   fails, check `codex cloud list` for an existing task before retrying.
5. Use `codex cloud status <task-id>` and `codex cloud diff <task-id>` to read
   the result. Review all changed paths and the reported proof; cloud output
   does not authorize new work or establish live behavior. At the time limit,
   stop waiting and report the task ID and next action; check its state before
   restarting that work locally.
6. Integrate the reviewed diff only in the coordinator's clean guarded task
   worktree, after checking the starting commit and local changes. Use
   `codex cloud apply <task-id>` there when applicable, inspect the resulting
   diff, and rerun affected proof plus required repo checks before normal
   source publication. The coordinator owns final verification and closeout.
