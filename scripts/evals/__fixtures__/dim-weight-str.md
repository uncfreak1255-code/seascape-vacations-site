# Two dims string weight
```json eval-spec
{
  "id": "weight-str",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [
    { "id": "a", "weight": "x", "max": 5, "criteria": "A." },
    { "id": "b", "weight": 1.0, "max": 5, "criteria": "B." }
  ],
  "autoFailPatterns": []
}
```
