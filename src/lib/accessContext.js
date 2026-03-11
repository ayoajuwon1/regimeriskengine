const ACCESS_MODE_LABELS = {
  "local-demo": "Local Demo Workspace",
  "enterprise-target": "Enterprise Target Operating Model",
};

function normalizeMode(value) {
  return String(value || "")
    .trim()
    .toLowerCase() === "enterprise-target"
    ? "enterprise-target"
    : "local-demo";
}

export function getAccessContext(value = process.env.NEXT_PUBLIC_ACCESS_MODE) {
  const mode = normalizeMode(value);

  if (mode === "enterprise-target") {
    return {
      mode,
      displayLabel: ACCESS_MODE_LABELS[mode],
      identityStatus: "Authenticated reviewer access expected at deployment",
      limitations: [
        "This reference app is still running as a browser-local prototype.",
        "Enterprise authentication, entitlements, and shared audit controls are not wired in this build.",
      ],
      expectations: [
        "Named reviewers should be institutionally authenticated in the deployed platform.",
        "Shared history and export controls should be governed by enterprise access policies.",
      ],
    };
  }

  return {
    mode,
    displayLabel: ACCESS_MODE_LABELS[mode],
    identityStatus: "Anonymous browser session",
    limitations: [
      "Saved analyses live only in this browser.",
      "There is no shared access or institutional identity assurance.",
      "This mode is appropriate for demo and local evaluation only.",
    ],
    expectations: [
      "Use authenticated reviewer access in the production deployment.",
      "Treat local history as a workspace convenience, not a governed system of record.",
    ],
  };
}
