# Private interactive design review

Use this within the [design review workflow](design-review-workflow.md) when
Sawyer needs to click, scroll, hover, or try a control to choose. It is not a
site feature or a release gate. No new app, browser plugin or agent is required.

1. Open a design lane with `npm run design:lane -- "<visitor task>"`. Pin
   the baseline commit, real page, shared fixture inputs, and what must stay
   unchanged. Build Current and two working alternatives in separate, local
   directories. Claude Design can supply a direction if synced to Waterline;
   the coding agent recreates working behavior on the real page for review.
2. Save a **private** JSON manifest outside the public checkout. Example:

   ```json
   {
     "title": "Property photo viewer",
     "routes": ["/properties/dockside-dreams/"],
     "variants": [
       {"id":"current","label":"Current","root":"./current/_site","revision":"BASE_SHA"},
       {"id":"a","label":"A · Filmstrip","root":"./a/_site","revision":"a-r1"},
       {"id":"b","label":"B · Contact sheet","root":"./b/_site","revision":"b-r1"}
     ]
   }
   ```

   `root` is relative to the manifest or absolute and must point to **built
   output only**, never a repo root or a directory with private data. All
   variants must serve the same routes. The picker is for trusted local
   builds; don't point it at third-party HTML or tunnel its ports. It binds to
   `127.0.0.1` only, separates variant origins, and disables forms and external
   links. External requests are blocked by policy; use local fixture data for
   workflows that need availability or transactions. Check phone layout in
   the picker and separately in the browser test suite; its 390px view is not
   a physical phone.
3. From the worktree, run `npm run design:preview -- /absolute/path/to/private-preview.json`.
   Use the printed link. One agent owns edits: Claude Code can use Claude in
   Chrome, Codex desktop can use `@Browser`, or use a normal browser with
   Playwright for assertions. Edit source, rebuild only the selected variant
   in place and bump its revision in the manifest, then refresh the same link.
   For an iteration in flight, **Reload version** reads rebuilt files without
   changing the selected page or variant. Restart only when changing the route
   list or directory/port assignments. Optional
   `port` in the manifest and `port` per variant must all be distinct (defaults
   43260–43263).
4. Record the choice as a contract: page and variant, exact artifact SHA-256
   or commit, constraints and non-goals, critic verdict, and missing proof.
   Archive the private artifact where both agents can read it; only commit
   non-sensitive design evidence and the contract. Implement the winner in a
   guarded worktree and follow the normal rendered QA, tests and PR process.
   Selecting a version is not merge or production approval.
