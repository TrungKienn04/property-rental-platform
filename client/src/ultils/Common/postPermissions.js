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
  const ownerId = getPostOwnerId(post);
  const userId = normalizeId(currentUserId);

  if (!postId) return false;
  if (isAdminRole(role)) return true;
  if (isBlockedUserStatus(currentUserStatus)) return false;

  return Boolean(userId && ownerId && userId === ownerId);
};

const canEditManagedPost = ({
  role,
  currentUserId,
  currentUserStatus,
  post,
} = {}) => {
  const ownerId = getPostOwnerId(post);
  const userId = normalizeId(currentUserId);

  if (isAdminRole(role) || isBlockedUserStatus(currentUserStatus)) {
    return false;
  }

  return Boolean(userId && ownerId && userId === ownerId);
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
