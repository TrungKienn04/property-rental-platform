import db from "../models";

const {
  isBlockedUserStatus,
  normalizeRole,
  normalizeUserStatus,
} = require("../ultis/accessControl");

export const loadCurrentUser = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        err: 1,
        msg: "Missing access token",
        response: null,
      });
    }

    const currentUser = await db.User.findOne({
      where: { id: req.user.id },
      raw: true,
      attributes: {
        exclude: ["password"],
      },
    });

    if (!currentUser) {
      return res.status(401).json({
        err: 1,
        msg: "User no longer exists",
        response: null,
      });
    }

    req.currentUser = currentUser;
    req.user = {
      ...req.user,
      id: currentUser.id,
      role: normalizeRole(currentUser.role),
      status: normalizeUserStatus(currentUser.status),
    };

    return next();
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: "Failed to load current user",
      response: null,
    });
  }
};

export const requireActiveUser = (req, res, next) => {
  if (isBlockedUserStatus(req.user?.status)) {
    return res.status(403).json({
      err: 1,
      msg: "Tai khoan da bi khoa.",
      response: null,
    });
  }

  return next();
};
