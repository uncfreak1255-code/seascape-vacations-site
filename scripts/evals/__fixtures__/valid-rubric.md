# Owner Copy Evaluation Rubric

Some description here.

```json eval-spec
{
  "id": "owner-copy",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "decision-answer", "weight": 0.5, "max": 5, "criteria": "Does copy answer the owner decision question directly?" },
    { "id": "proof-density", "weight": 0.5, "max": 5, "criteria": "Are specific proof points used rather than generic claims?" }
  ],
  "autoFailPatterns": ["curated", "nestled"]
}
```
