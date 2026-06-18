
const { runLane } = require("/sessions/gracious-peaceful-meitner/mnt/seascape-vacations-site/scripts/evals/lib/run-lane.js");
runLane(undefined, { apiKey: "", require: false }).then(r => {
  if (r.skipped && r.ok) process.exit(0);
  process.exit(1);
}).catch(() => process.exit(2));
