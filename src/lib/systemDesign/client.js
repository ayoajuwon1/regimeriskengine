function normalizeApiBaseUrl(value) {
  return (value || "")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api(?:\/analyze|\/data\/context|\/data\/series|\/system-design|\/intake-screen)?$/i, "");
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export async function fetchSystemDesign() {
  const response = await fetch(`${API_BASE_URL}/api/system-design`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }

  return payload;
}

export async function screenIntakeConstraints(constraints) {
  const response = await fetch(`${API_BASE_URL}/api/intake-screen`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ constraints }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || `Request failed with status ${response.status}`);
  }

  return payload;
}
