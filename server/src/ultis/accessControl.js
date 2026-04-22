const USER_ROLE = "user";
const ADMIN_ROLE = "admin";
const USER_ROLES = [USER_ROLE, ADMIN_ROLE];

const USER_STATUS_ACTIVE = "active";
const USER_STATUS_BLOCKED = "blocked";
const USER_STATUSES = [USER_STATUS_ACTIVE, USER_STATUS_BLOCKED];

const POST_STATUS_PUBLISHED = "published";
const POST_STATUS_PENDING = "pending";
const POST_STATUS_HIDDEN = "hidden";
const POST_STATUS_REJECTED = "rejected";
const POST_STATUSES = [
  POST_STATUS_PUBLISHED,
  POST_STATUS_PENDING,
  POST_STATUS_HIDDEN,
  POST_STATUS_REJECTED,
];

const normalizeRole = (role) => {
  const normalized = String(role || "").trim().toLowerCase();
  return USER_ROLES.includes(normalized) ? normalized : USER_ROLE;
};

const normalizeUserStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return USER_STATUSES.includes(normalized)
    ? normalized
    : USER_STATUS_ACTIVE;
};

const normalizePostStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return POST_STATUSES.includes(normalized)
    ? normalized
    : POST_STATUS_PUBLISHED;
};

const isAdminRole = (role) => normalizeRole(role) === ADMIN_ROLE;
const isBlockedUserStatus = (status) =>
  normalizeUserStatus(status) === USER_STATUS_BLOCKED;
const isPublishedPostStatus = (status) =>
  normalizePostStatus(status) === POST_STATUS_PUBLISHED;

module.exports = {
  ADMIN_ROLE,
  POST_STATUSES,
  POST_STATUS_HIDDEN,
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
  USER_ROLE,
  USER_ROLES,
  USER_STATUSES,
  USER_STATUS_ACTIVE,
  USER_STATUS_BLOCKED,
  isAdminRole,
  isBlockedUserStatus,
  isPublishedPostStatus,
  normalizePostStatus,
  normalizeRole,
  normalizeUserStatus,
};
