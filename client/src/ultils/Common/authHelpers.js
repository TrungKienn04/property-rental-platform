const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const USER_ROLE = "user";
const ADMIN_ROLE = "admin";
const USER_STATUS_ACTIVE = "active";
const USER_STATUS_BLOCKED = "blocked";

const normalizeKnownRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();

  if (normalized === ADMIN_ROLE || normalized === USER_ROLE) {
    return normalized;
  }

  return null;
};

const normalizeRole = (role) =>
  normalizeKnownRole(role) || USER_ROLE;

const resolveAuthRole = (...roles) => {
  for (const role of roles) {
    const normalized = normalizeKnownRole(role);

    if (normalized) {
      return normalized;
    }
  }

  return null;
};

const isAdminRole = (role) => resolveAuthRole(role) === ADMIN_ROLE;
const isUserRole = (role) => resolveAuthRole(role) === USER_ROLE;

const normalizeUserStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === USER_STATUS_ACTIVE || normalized === USER_STATUS_BLOCKED) {
    return normalized;
  }

  return null;
};

const isBlockedUserStatus = (status) =>
  normalizeUserStatus(status) === USER_STATUS_BLOCKED;

const hasResolvedAuthProfile = (currentData = {}) =>
  Boolean(currentData?.id && resolveAuthRole(currentData?.role));

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
  ADMIN_ROLE,
  EMAIL_REGEX,
  extractRoleFromToken,
  hasResolvedAuthProfile,
  isBlockedUserStatus,
  isAdminRole,
  isUserRole,
  normalizeLoginIdentifier,
  normalizeRole,
  normalizeUserStatus,
  resolveAuthRole,
  USER_ROLE,
  USER_STATUS_ACTIVE,
  USER_STATUS_BLOCKED,
};
