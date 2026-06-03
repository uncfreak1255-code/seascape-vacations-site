# Misweighted

```json eval-spec
{
  "id": "bad-weights",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": 0.3, "max": 5, "criteria": "Criterion a." },
    { "id": "b", "weight": 0.3, "max": 5, "criteria": "Criterion b." }
  ],
  "autoFailPatterns": []
}
```
