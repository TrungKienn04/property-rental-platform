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

  if (!postId) return false;
  if (isBlockedUserStatus(currentUserStatus)) return false;
  if (isAdminRole(role)) return true;

  return isUserRole(role) && Boolean(ownerId) && ownerId === normalizeId(currentUserId);
};

const canEditManagedPost = ({
  role,
  currentUserId,
  post,
  currentUserStatus,
} = {}) => {
  const ownerId = getPostOwnerId(post);

  if (isAdminRole(role) || isBlockedUserStatus(currentUserStatus)) {
    return false;
  }

  return isUserRole(role) && Boolean(ownerId) && ownerId === normalizeId(currentUserId);
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
