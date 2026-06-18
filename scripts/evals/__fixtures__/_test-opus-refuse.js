
const { createClient } = require("/sessions/gracious-peaceful-meitner/mnt/seascape-vacations-site/scripts/evals/lib/anthropic-client.js");
try {
  createClient({ apiKey: "test", model: "claude-opus-4-8" });
  process.exit(1); // should not reach here
} catch (e) {
  if (e.message.includes("Opus") || e.message.includes("opus")) {
    process.exit(0);
  }
  process.exit(2);
}
