const USER_ROLE = "user";
const ADMIN_ROLE = "admin";
const USER_ROLES = [USER_ROLE, ADMIN_ROLE];

const USER_STATUS_ACTIVE = "active";
const USER_STATUS_BLOCKED = "blocked";
const USER_STATUSES = [USER_STATUS_ACTIVE, USER_STATUS_BLOCKED];

const POST_STATUS_PENDING = "pending";
const POST_STATUS_PUBLISHED = "published";
const POST_STATUS_REJECTED = "rejected";
const POST_STATUS_HIDDEN = "hidden";
const POST_STATUS_DELETED = "deleted";
const RESTORABLE_POST_STATUSES = [
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
  POST_STATUS_HIDDEN,
];
const LEGACY_POST_STATUS_DRAFT = "draft";
const POST_STATUSES = [
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
  POST_STATUS_HIDDEN,
  POST_STATUS_DELETED,
];
const ADMIN_POST_STATUS_TRANSITIONS = {
  [POST_STATUS_PENDING]: [
    POST_STATUS_PUBLISHED,
    POST_STATUS_REJECTED,
    POST_STATUS_DELETED,
  ],
  [POST_STATUS_PUBLISHED]: [
    POST_STATUS_HIDDEN,
    POST_STATUS_DELETED,
  ],
  [POST_STATUS_REJECTED]: [
    POST_STATUS_PENDING,
    POST_STATUS_DELETED,
  ],
  [POST_STATUS_HIDDEN]: [
    POST_STATUS_PUBLISHED,
    POST_STATUS_DELETED,
  ],
  [POST_STATUS_DELETED]: RESTORABLE_POST_STATUSES,
};

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

const parsePostStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return POST_STATUSES.includes(normalized) ? normalized : null;
};

const normalizePostStatus = (status, fallback = POST_STATUS_PENDING) => {
  const normalized = String(status || "").trim().toLowerCase();

  if (normalized === LEGACY_POST_STATUS_DRAFT) {
    return POST_STATUS_PENDING;
  }

  return parsePostStatus(normalized) || fallback;
};

const isAdminRole = (role) => normalizeRole(role) === ADMIN_ROLE;
const isBlockedUserStatus = (status) =>
  normalizeUserStatus(status) === USER_STATUS_BLOCKED;
const isPublishedPostStatus = (status) =>
  normalizePostStatus(status, "") === POST_STATUS_PUBLISHED;
const normalizeDeletedFromStatus = (status) => {
  const normalized = parsePostStatus(status);
  return RESTORABLE_POST_STATUSES.includes(normalized) ? normalized : null;
};
const canRestoreDeletedPostStatus = (deletedFromStatus, nextStatus) => {
  const restoreStatus = normalizeDeletedFromStatus(deletedFromStatus);
  const nextRestoreStatus = normalizeDeletedFromStatus(nextStatus);

  return Boolean(
    restoreStatus
    && nextRestoreStatus
    && restoreStatus === nextRestoreStatus,
  );
};
const canTransitionPostStatus = (currentStatus, nextStatus) => {
  const current = normalizePostStatus(currentStatus, "");
  const next = parsePostStatus(nextStatus);

  if (!current || !next) return false;

  return ADMIN_POST_STATUS_TRANSITIONS[current]?.includes(next) || false;
};

module.exports = {
  ADMIN_POST_STATUS_TRANSITIONS,
  ADMIN_ROLE,
  LEGACY_POST_STATUS_DRAFT,
  POST_STATUSES,
  RESTORABLE_POST_STATUSES,
  POST_STATUS_DELETED,
  POST_STATUS_HIDDEN,
  POST_STATUS_PENDING,
  POST_STATUS_PUBLISHED,
  POST_STATUS_REJECTED,
  USER_ROLE,
  USER_ROLES,
  USER_STATUSES,
  USER_STATUS_ACTIVE,
  USER_STATUS_BLOCKED,
  canRestoreDeletedPostStatus,
  canTransitionPostStatus,
  isAdminRole,
  isBlockedUserStatus,
  isPublishedPostStatus,
  normalizeDeletedFromStatus,
  parsePostStatus,
  normalizePostStatus,
  normalizeRole,
  normalizeUserStatus,
};
