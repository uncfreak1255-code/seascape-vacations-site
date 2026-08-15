// Microsoft Graph Mail.Send for owner-lead transactional mail only.
// Sender and internal notify recipient are always info@seascape-vacations.com.
// This is not the guest Mailchimp plane and not the frozen owner outbound campaign.

const DEFAULT_FROM = "info@seascape-vacations.com";
const GRAPH_SCOPE = "https://graph.microsoft.com/.default";
const GRAPH_TOKEN_HOST = "https://login.microsoftonline.com";
const GRAPH_API_HOST = "https://graph.microsoft.com";

function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function getMsGraphMailConfig(env = process.env) {
  const tenantId = normalizeText(env.MS_GRAPH_TENANT_ID || env.AZURE_TENANT_ID);
  const clientId = normalizeText(env.MS_GRAPH_CLIENT_ID || env.AZURE_CLIENT_ID);
  const clientSecret = normalizeText(env.MS_GRAPH_CLIENT_SECRET || env.AZURE_CLIENT_SECRET);
  const from = DEFAULT_FROM;
  const internalTo = DEFAULT_FROM;

  if (!tenantId || !clientId || !clientSecret) {
    return null;
  }

  return {
    tenantId,
    clientId,
    clientSecret,
    from,
    internalTo
  };
}

function missingGraphConfigReason(env = process.env) {
  const missing = [];
  if (!normalizeText(env.MS_GRAPH_TENANT_ID || env.AZURE_TENANT_ID)) {
    missing.push("MS_GRAPH_TENANT_ID");
  }
  if (!normalizeText(env.MS_GRAPH_CLIENT_ID || env.AZURE_CLIENT_ID)) {
    missing.push("MS_GRAPH_CLIENT_ID");
  }
  if (!normalizeText(env.MS_GRAPH_CLIENT_SECRET || env.AZURE_CLIENT_SECRET)) {
    missing.push("MS_GRAPH_CLIENT_SECRET");
  }
  return missing.length ? `missing_env:${missing.join(",")}` : "graph_not_configured";
}

async function requestGraphAccessToken(config, injectedFetch) {
  const transport = injectedFetch || fetch;
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: GRAPH_SCOPE
  });

  let response;
  try {
    response = await transport(
      GRAPH_TOKEN_HOST + "/" + encodeURIComponent(config.tenantId) + "/oauth2/v2.0/token",
      { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: body.toString() }
    );
  } catch (error) {
    throw new Error("graph_token_transport_failed:" + (error && error.message ? error.message : "network"));
  }

  if (!response.ok) throw new Error("graph_token_failed:" + response.status);
  const payload = await response.json();
  const accessToken = normalizeText(payload && payload.access_token);
  if (!accessToken) throw new Error("graph_token_missing_access_token");
  return accessToken;
}

function buildGraphSendMailPayload(message) {
  const to = Array.isArray(message.to) ? message.to : [message.to];
  const payload = {
    message: {
      subject: message.subject,
      body: {
        contentType: message.contentType || "Text",
        content: message.text || message.html || ""
      },
      toRecipients: to.filter(Boolean).map((address) => ({
        emailAddress: { address: String(address).trim() }
      }))
    },
    saveToSentItems: true
  };

  if (message.replyTo) {
    payload.message.replyTo = [
      { emailAddress: { address: String(message.replyTo).trim() } }
    ];
  }

  return payload;
}

async function sendMailViaGraph(message, injectedFetch, env = process.env) {
  const config = getMsGraphMailConfig(env);
  if (!config) return { sent: false, reason: missingGraphConfigReason(env) };

  const toList = Array.isArray(message && message.to) ? message.to : [message && message.to];
  const recipients = toList.map((value) => normalizeText(value)).filter(Boolean);
  if (!recipients.length) return { sent: false, reason: "missing_recipient" };

  const transport = injectedFetch || fetch;
  let accessToken;
  try {
    accessToken = await requestGraphAccessToken(config, transport);
  } catch (error) {
    const reason = error && error.message ? error.message : "graph_token_failed";
    console.error("owner_lead_graph_token_failed", { reason });
    return { sent: false, reason };
  }

  try {
    const response = await transport(
      GRAPH_API_HOST + "/v1.0/users/" + encodeURIComponent(config.from) + "/sendMail",
      {
        method: "POST",
        headers: { authorization: "Bearer " + accessToken, "content-type": "application/json; charset=utf-8" },
        body: JSON.stringify(buildGraphSendMailPayload({ ...message, to: recipients, replyTo: message.replyTo || config.from }))
      }
    );
    if (!response.ok) {
      console.error("owner_lead_graph_send_failed", { status: response.status, fromConfigured: Boolean(config.from), recipientCount: recipients.length });
      return { sent: false, reason: "graph_send_failed:" + response.status, ambiguous: response.status >= 500 };
    }
    return { sent: true, from: config.from, to: recipients, status: response.status || 202 };
  } catch (error) {
    const reason = error && error.message ? error.message : "network";
    console.error("owner_lead_graph_send_unknown", { recipientCount: recipients.length });
    return { sent: false, reason: "graph_send_transport_unknown:" + reason, ambiguous: true };
  }
}

module.exports = {
  DEFAULT_FROM,
  getMsGraphMailConfig,
  missingGraphConfigReason,
  buildGraphSendMailPayload,
  requestGraphAccessToken,
  sendMailViaGraph
};
