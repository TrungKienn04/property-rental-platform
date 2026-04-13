const { isAdminRole } = require("./authHelpers");

const normalizeId = (value) => String(value || "").trim();

const getPostOwnerId = (post = {}) =>
  normalizeId(post?.userId || post?.user?.id || "");

const canDeletePost = ({ role, currentUserId, post } = {}) => {
  const postId = normalizeId(post?.id);
  const ownerId = getPostOwnerId(post);
  const userId = normalizeId(currentUserId);

  if (!postId) return false;
  if (isAdminRole(role)) return true;

  return Boolean(userId && ownerId && userId === ownerId);
};

const canEditManagedPost = ({ currentUserId, post } = {}) => {
  const ownerId = getPostOwnerId(post);
  const userId = normalizeId(currentUserId);

  return Boolean(userId && ownerId && userId === ownerId);
};

module.exports = {
  canDeletePost,
  canEditManagedPost,
  getPostOwnerId,
};
