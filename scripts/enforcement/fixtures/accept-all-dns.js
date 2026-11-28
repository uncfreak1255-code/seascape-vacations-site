// Requiring this keeps capture tests off real DNS: every domain accepts mail.
// Tests that swap in another resolver restore this one afterwards.
const { setDomainResolver } = require("../../../netlify/functions/_guest-capture-domain-check");

const acceptAllDomains = Object.freeze({
  resolveMx: async () => [{ exchange: "mx.test", priority: 10 }],
  resolve4: async () => [],
  resolve6: async () => []
});

function useAcceptAllDomains() {
  setDomainResolver(acceptAllDomains);
}

useAcceptAllDomains();

module.exports = { acceptAllDomains, useAcceptAllDomains };
