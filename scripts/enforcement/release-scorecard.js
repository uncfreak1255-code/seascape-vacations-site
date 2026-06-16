const path = require("path");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs) || durationMs < 0) {
    return "";
  }

  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

function relativeLink(baseDir, targetPath) {
  if (!targetPath) {
    return "";
  }

  const relativePath = path.relative(baseDir, targetPath).replace(/\\/g, "/");
  return relativePath || ".";
}

function resolveProofAssetPath(repoRoot, assetPath) {
  if (!assetPath) {
    return "";
  }

  if (path.isAbsolute(assetPath)) {
    return assetPath;
  }

  return path.resolve(repoRoot || process.cwd(), assetPath);
}

function normalizeReleaseChecks(releaseReceipt) {
  const assertions = Array.isArray(releaseReceipt?.path_assertions)
    ? releaseReceipt.path_assertions.map((assertion) => ({
        kind: "assertion",
        label: assertion.label,
        status: assertion.status,
        command: assertion.command || "",
        duration_ms: assertion.duration_ms,
        error: assertion.error || "",
      }))
    : [];
  const commands = Array.isArray(releaseReceipt?.checks)
    ? releaseReceipt.checks.map((check) => ({
        kind: "command",
        label: check.label,
        status: check.status,
        command: check.command || "",
        duration_ms: check.duration_ms,
        error: check.error || "",
      }))
    : [];

  return [...assertions, ...commands];
}

function buildProofIndex(visualProofReceipt) {
  const index = new Map();
  const projects =
    visualProofReceipt && visualProofReceipt.projects && typeof visualProofReceipt.projects === "object"
      ? visualProofReceipt.projects
      : {};

  for (const [projectName, captures] of Object.entries(projects)) {
    for (const capture of Array.isArray(captures) ? captures : []) {
      if (!index.has(capture.route)) {
        index.set(capture.route, {
          route: capture.route,
          slug: capture.slug,
          screenshots: {},
        });
      }
      index.get(capture.route).screenshots[projectName] = capture.screenshot || "";
    }
  }

  return [...index.values()];
}

function buildNextAction({ verdict, failures, visualProofReceipt }) {
  if (verdict === "fail" && failures.length > 0) {
    return `Fix failing gate: ${failures[0].label}`;
  }

  if (visualProofReceipt) {
    return "Review the diff and attach this scorecard with the visual proof bundle before merge.";
  }

  return "Generate or attach route proof before merge review.";
}

function buildReleaseScorecard({
  releaseReceipt,
  visualProofReceipt = null,
  releaseReceiptPath = "",
  visualProofReceiptPath = "",
  outputDir = "",
} = {}) {
  const repoRoot = releaseReceipt?.repo_root || "";
  const checks = normalizeReleaseChecks(releaseReceipt);
  const failures = checks.filter((check) => check.status !== "passed");
  const proofRoutes = buildProofIndex(visualProofReceipt);
  const verdict = releaseReceipt?.summary?.verdict || (failures.length > 0 ? "fail" : "pass");
  const nextAction = buildNextAction({ verdict, failures, visualProofReceipt });
  const releaseReceiptLink = relativeLink(outputDir, releaseReceiptPath);
  const visualProofReceiptLink = visualProofReceiptPath
    ? relativeLink(outputDir, visualProofReceiptPath)
    : "";

  const scorecardReceipt = {
    receipt_type: "release_scorecard",
    generated_at: new Date().toISOString(),
    source: "scripts/enforcement/generate-release-scorecard.js",
    repo_root: releaseReceipt?.repo_root || "",
    git: releaseReceipt?.git || {},
    summary: {
      verdict,
      total_checks: checks.length,
      failed_checks: failures.length,
      affected_routes: proofRoutes.map((route) => route.route),
      next_action: nextAction,
    },
    source_receipts: {
      release_verification: releaseReceiptPath || "",
      visual_proof_bundle: visualProofReceiptPath || "",
    },
  };

  const markdownLines = [
    "# Release Scorecard",
    "",
    `- Verdict: ${verdict}`,
    `- Generated: ${scorecardReceipt.generated_at}`,
    `- Repo: ${releaseReceipt?.repo_root || "unknown"}`,
    `- Branch: ${releaseReceipt?.git?.branch || "unknown"}`,
    `- Range: ${releaseReceipt?.git?.range || "unknown"}`,
    `- Release receipt: ${releaseReceiptLink || releaseReceiptPath || "n/a"}`,
  ];

  if (visualProofReceiptLink || visualProofReceiptPath) {
    markdownLines.push(
      `- Visual proof receipt: ${visualProofReceiptLink || visualProofReceiptPath}`
    );
  }

  markdownLines.push(
    "",
    "## Gate Table",
    "",
    "| Gate | Type | Status | Duration | Command |",
    "|---|---|---|---:|---|"
  );

  for (const check of checks) {
    markdownLines.push(
      `| ${check.label} | ${check.kind} | ${check.status} | ${formatDuration(check.duration_ms)} | ${check.command || "-"} |`
    );
  }

  markdownLines.push("", "## Affected Routes", "");

  if (proofRoutes.length > 0) {
    markdownLines.push(
      "| Route | Desktop proof | Mobile proof |",
      "|---|---|---|"
    );
    for (const route of proofRoutes) {
      const desktopPath = route.screenshots["desktop-chromium"];
      const mobilePath = route.screenshots["mobile-chromium"];
      const desktopLink = desktopPath
        ? `[desktop](${relativeLink(outputDir, resolveProofAssetPath(repoRoot, desktopPath))})`
        : "-";
      const mobileLink = mobilePath
        ? `[mobile](${relativeLink(outputDir, resolveProofAssetPath(repoRoot, mobilePath))})`
        : "-";
      markdownLines.push(`| ${route.route} | ${desktopLink} | ${mobileLink} |`);
    }
  } else {
    markdownLines.push("No visual-proof routes were attached.");
  }

  markdownLines.push("", "## Failures", "");

  if (failures.length > 0) {
    for (const failure of failures) {
      markdownLines.push(
        `- ${failure.label}: ${failure.error || failure.command || "failed"}`
      );
    }
  } else {
    markdownLines.push("- none");
  }

  markdownLines.push("", "## Next Action", "", `- ${nextAction}`, "");

  const htmlRows = checks
    .map(
      (check) => `
        <tr>
          <td>${escapeHtml(check.label)}</td>
          <td>${escapeHtml(check.kind)}</td>
          <td>${escapeHtml(check.status)}</td>
          <td>${escapeHtml(formatDuration(check.duration_ms))}</td>
          <td><code>${escapeHtml(check.command || "-")}</code></td>
        </tr>`
    )
    .join("");

  const routeRows =
    proofRoutes.length > 0
      ? proofRoutes
          .map((route) => {
            const desktopPath = route.screenshots["desktop-chromium"];
            const mobilePath = route.screenshots["mobile-chromium"];
            return `
        <tr>
          <td>${escapeHtml(route.route)}</td>
          <td>${desktopPath ? `<a href="${escapeHtml(relativeLink(outputDir, resolveProofAssetPath(repoRoot, desktopPath)))}">desktop</a>` : "-"}</td>
          <td>${mobilePath ? `<a href="${escapeHtml(relativeLink(outputDir, resolveProofAssetPath(repoRoot, mobilePath)))}">mobile</a>` : "-"}</td>
        </tr>`;
          })
          .join("")
      : `<tr><td colspan="3">No visual-proof routes were attached.</td></tr>`;

  const failureItems =
    failures.length > 0
      ? failures
          .map(
            (failure) =>
              `<li><strong>${escapeHtml(failure.label)}:</strong> ${escapeHtml(
                failure.error || failure.command || "failed"
              )}</li>`
          )
          .join("")
      : "<li>none</li>";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Release Scorecard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #1f2933; }
    h1, h2 { color: #12343b; }
    ul { padding-left: 20px; }
    table { border-collapse: collapse; width: 100%; margin: 16px 0 24px; }
    th, td { border: 1px solid #d7dee5; padding: 10px; text-align: left; vertical-align: top; }
    th { background: #f3f6f8; }
    code { font-family: Menlo, Monaco, Consolas, monospace; font-size: 0.92em; }
    .meta li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <h1>Release Scorecard</h1>
  <ul class="meta">
    <li><strong>Verdict:</strong> ${escapeHtml(verdict)}</li>
    <li><strong>Generated:</strong> ${escapeHtml(scorecardReceipt.generated_at)}</li>
    <li><strong>Repo:</strong> ${escapeHtml(releaseReceipt?.repo_root || "unknown")}</li>
    <li><strong>Branch:</strong> ${escapeHtml(releaseReceipt?.git?.branch || "unknown")}</li>
    <li><strong>Range:</strong> ${escapeHtml(releaseReceipt?.git?.range || "unknown")}</li>
    <li><strong>Release receipt:</strong> ${releaseReceiptLink ? `<a href="${escapeHtml(releaseReceiptLink)}">${escapeHtml(releaseReceiptLink)}</a>` : "n/a"}</li>
    ${visualProofReceiptLink ? `<li><strong>Visual proof receipt:</strong> <a href="${escapeHtml(visualProofReceiptLink)}">${escapeHtml(visualProofReceiptLink)}</a></li>` : ""}
  </ul>

  <h2>Gate Table</h2>
  <table>
    <thead>
      <tr>
        <th>Gate</th>
        <th>Type</th>
        <th>Status</th>
        <th>Duration</th>
        <th>Command</th>
      </tr>
    </thead>
    <tbody>${htmlRows}</tbody>
  </table>

  <h2>Affected Routes</h2>
  <table>
    <thead>
      <tr>
        <th>Route</th>
        <th>Desktop proof</th>
        <th>Mobile proof</th>
      </tr>
    </thead>
    <tbody>${routeRows}</tbody>
  </table>

  <h2>Failures</h2>
  <ul>${failureItems}</ul>

  <h2>Next Action</h2>
  <ul><li>${escapeHtml(nextAction)}</li></ul>
</body>
</html>
`;

  return {
    markdown: markdownLines.join("\n"),
    html,
    receipt: scorecardReceipt,
  };
}

module.exports = {
  buildReleaseScorecard,
  buildProofIndex,
  normalizeReleaseChecks,
};
