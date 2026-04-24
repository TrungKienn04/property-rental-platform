const {
  isAdminRole,
  isBlockedUserStatus,
  isUserRole,
} = require("./authHelpers");

const normalizeId = (value) => String(value || "").trim();

const getPostOwnerId = (post = {}) =>
  normalizeId(post?.userId || post?.user?.id || "");

const canDeletePost = ({ role, currentUserId, post, currentUserStatus } = {}) => {
  const postId = normalizeId(post?.id);

  if (!postId) return false;
  if (isBlockedUserStatus(currentUserStatus)) return false;

  return isAdminRole(role);
};

const canEditManagedPost = ({
  role,
  currentUserStatus,
} = {}) => {
  if (isAdminRole(role) || isBlockedUserStatus(currentUserStatus)) {
    return false;
  }

  return false;
};

const canCreatePost = ({ role, currentUserStatus } = {}) =>
  isUserRole(role) && !isBlockedUserStatus(currentUserStatus);

const canModeratePost = ({ role, post } = {}) =>
  isAdminRole(role) && Boolean(normalizeId(post?.id));

module.exports = {
  canCreatePost,
  canDeletePost,
  canEditManagedPost,
  canModeratePost,
  getPostOwnerId,
};
