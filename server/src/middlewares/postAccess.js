import db from "../models";

const { isAdminRole } = require("../ultis/accessControl");

const resolvePostId = (req) => req.params?.postId || req.params?.id;

export const loadPost = async (req, res, next) => {
  try {
    const postId = resolvePostId(req);

    if (!postId) {
      return res.status(400).json({
        err: 1,
        msg: "Missing post id.",
        response: null,
      });
    }

    const post = await db.Post.findOne({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        err: 1,
        msg: "Khong tim thay tin dang.",
        response: null,
      });
    }

    req.post = post;
    return next();
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed to load post.",
      response: null,
    });
  }
};

export const requirePostOwner = (req, res, next) => {
  const currentUserId = String(req.user?.id || "").trim();
  const ownerId = String(req.post?.userId || "").trim();

  if (!currentUserId || !ownerId || currentUserId !== ownerId) {
    return res.status(403).json({
      err: 1,
      msg: "Forbidden",
      response: null,
    });
  }

  return next();
};

export const requirePostOwnerOrAdmin = (req, res, next) => {
  if (isAdminRole(req.user?.role)) {
    return next();
  }

  return requirePostOwner(req, res, next);
};
