# Two dims negative weight
```json eval-spec
{
  "id": "weight-neg",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": -0.5, "max": 5, "criteria": "A." },
    { "id": "b", "weight": 1.0, "max": 5, "criteria": "B." }
  ],
  "autoFailPatterns": []
}
```
