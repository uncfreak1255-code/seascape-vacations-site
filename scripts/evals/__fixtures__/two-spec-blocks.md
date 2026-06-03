# Two blocks

```json eval-spec
{
  "id": "first",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [{ "id": "a", "weight": 1.0, "max": 5, "criteria": "A." }],
  "autoFailPatterns": []
}
```

Some text in between.

```json eval-spec
{
  "id": "second",
  "version": "1.0.0",
  "judgeModel": "claude-sonnet-4-6",
  "passFloor": 70,
  "dimensions": [{ "id": "a", "weight": 1.0, "max": 5, "criteria": "A." }],
  "autoFailPatterns": []
}
```
