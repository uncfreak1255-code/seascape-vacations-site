const { GUEST_EMAIL_CAPTURE_METRICS_KEY } = require("../../../netlify/functions/_guest-email-capture-metrics");
function createMemoryStore(options = {}) {
  const values = new Map();
  const versions = new Map();
  let metricsFailuresRemaining = Number(options.failMetricsWrites) || 0;
  return {
    values,
    async get(key) {
      return values.get(key) || null;
    },
    async getWithMetadata(key) {
      return values.has(key) ? { data: JSON.parse(values.get(key)), etag: String(versions.get(key)) } : null;
    },
    async set(key, value, conditions = {}) {
      if (conditions.onlyIfNew && values.has(key)) return { modified: false };
      if (conditions.onlyIfMatch && conditions.onlyIfMatch !== String(versions.get(key))) return { modified: false };
      if (options.failStateWrites && key.startsWith("guest_capture_state_v1/")) {
        throw new Error("state write failed");
      }
      if (key === GUEST_EMAIL_CAPTURE_METRICS_KEY && metricsFailuresRemaining > 0) {
        metricsFailuresRemaining -= 1;
        throw new Error("metrics write failed");
      }
      values.set(key, value);
      versions.set(key, (versions.get(key) || 0) + 1);
      return { modified: true, etag: String(versions.get(key)) };
    },
    async delete(key) {
      values.delete(key);
    },
    async list({ prefix } = {}) {
      return {
        blobs: [...values.keys()]
          .filter((key) => !prefix || key.startsWith(prefix))
          .map((key) => ({ key, etag: `"${key}"` }))
      };
    }
  };
}

module.exports = { createMemoryStore };
