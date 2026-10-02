# Design finding evidence gate

Keep a candidate finding only when all three proofs exist:

1. **Contract:** cite the governing `DESIGN.md` rule, approved mock, explicit
   route requirement, or a direct contradiction within the same user task.
2. **Runtime:** prove that the cited source, style, component, or state reaches
   the reviewed route and viewport through rendering or an exercised control.
3. **Correction:** name one deterministic change supported by the evidence and
   the existing token, component, or pattern it should reuse.

Hierarchy, prominence, density, clarity, and discoverability require rendered
or user evidence. Source repetition alone does not prove a visual problem.
Delete a candidate when counterevidence shows an intentional exception, the
evidence supports multiple incompatible corrections, or the proposed fix would
invent product intent.

For each surviving finding, record contract, runtime evidence, correction,
route, viewport or state, user impact, and confidence. Re-open the cited source
and try to falsify the finding before reporting it.
