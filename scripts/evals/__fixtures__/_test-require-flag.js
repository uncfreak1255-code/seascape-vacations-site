
const { runLane } = require("/sessions/gracious-peaceful-meitner/mnt/seascape-vacations-site/scripts/evals/lib/run-lane.js");
const lane = {
  id: "require-test",
  rubric: "scripts/evals/__fixtures__/_require-test-rubric.md",
  golden: "scripts/evals/golden/owner",
  targets: ["src/property-management/**/*.njk"],
  blocking: true
};
runLane(lane, { apiKey: "", require: true }).then(r => {
  if (!r.ok) process.exit(0); // ok=false means failure was correctly detected
  process.exit(1);
}).catch((e) => {
  process.exit(2);
});
