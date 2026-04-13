const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const normalizeRole = (role) =>
  String(role || "").trim().toLowerCase() === "admin" ? "admin" : "user";

const isAdminRole = (role) => normalizeRole(role) === "admin";

const normalizeLoginIdentifier = (value = "") => {
  const trimmed = String(value || "").trim();

  if (!trimmed) return "";

  if (EMAIL_REGEX.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return trimmed.replace(/\s+/g, "");
};

const decodeBase64Url = (value = "") => {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const remainder = normalized.length % 4;
  const padded =
    remainder === 0 ? normalized : `${normalized}${"=".repeat(4 - remainder)}`;

  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(
      Array.from(window.atob(padded))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
  }

  return Buffer.from(padded, "base64").toString("utf8");
};

const extractRoleFromToken = (token) => {
  const rawToken = String(token || "").trim();

  if (!rawToken) return null;

  const parts = rawToken.split(".");

  if (parts.length < 2) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return payload?.role ? normalizeRole(payload.role) : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  EMAIL_REGEX,
  extractRoleFromToken,
  isAdminRole,
  normalizeLoginIdentifier,
  normalizeRole,
};
