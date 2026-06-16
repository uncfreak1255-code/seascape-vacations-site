# Legal Approval Blocked

Use this when public legal or trust copy needs approval and no approved source
text exists yet.

## Immediate Actions

1. Stop the merge of substantive legal copy, policy promises, or disclaimer
   changes.
2. Separate route plumbing from legal substance:
   - route shell, links, redirects, and layout can often proceed
   - new legal promises or policy language cannot
3. Keep the PR draft or narrow the diff to non-substantive plumbing until
   approved copy exists.
4. Record who owns approval and the exact source text or document path still
   needed.
5. After narrowing or approval, rerun the relevant checks:

```bash
npm run lint:content
npm run build
npm run verify:links
```

## Source Of Truth

- approved legal copy from the real owner or counsel
- current source diff in this repo

## Proof Gate

- the approved source text is named in the branch or PR, or
- the remaining diff is strictly non-substantive plumbing

## Do Not

- invent legal promises
- treat plugin output or model text as legal approval
- merge public legal wording on assumption alone
