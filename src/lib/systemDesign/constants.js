export const SYSTEM_DESIGN_VERSION = "2026-03-10";
export const WORKFLOW_POLICY_VERSION = "2026-03-10";
export const DEFAULT_SYSTEM_GUIDE_FLAG = true;
export const LIQUIDITY_OPTIONS = [
  "High Liquidity (>80% liquid within 30 days)",
  "Mixed (40–80% liquid within 30 days)",
  "Illiquid-Heavy (<40% liquid within 30 days)",
];

export function isSystemGuideEnabled(value = process.env.NEXT_PUBLIC_ENABLE_SYSTEM_GUIDE) {
  if (value == null || value === "") {
    return DEFAULT_SYSTEM_GUIDE_FLAG;
  }

  const normalized = String(value).trim().toLowerCase();
  return !["0", "false", "off", "no"].includes(normalized);
}
