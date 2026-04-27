import * as postService from "../services/post";
import * as userService from "../services/user";

const {
  parsePostStatus,
  normalizeUserStatus,
  POST_STATUSES,
  USER_STATUSES,
} = require("../ultis/accessControl");

const normalizePage = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export const getPosts = async (req, res) => {
  try {
    const filters = {};
    const requestedStatus = String(req.query?.status || "").trim();

    if (requestedStatus) {
      const normalizedStatus = parsePostStatus(requestedStatus);

      if (!normalizedStatus) {
        return res.status(400).json({
          err: 1,
          msg: "Trạng thái bài đăng không hợp lệ.",
          response: null,
        });
      }

      filters.status = normalizedStatus;
    }

    if (req.query?.userId) {
      filters.userId = String(req.query.userId).trim();
    }

    if (req.query?.provinceCode) {
      filters.provinceCode = String(req.query.provinceCode).trim();
    }

    const response = await postService.getAllManagedPostsService(filters, {
      page: normalizePage(req.query?.page),
      limit: req.query?.limit,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const response = await postService.getPostByIdService(req.params.id, req.user);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const updatePostStatus = async (req, res) => {
  const nextStatus = String(req.body?.status || "").trim().toLowerCase();

  if (!POST_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      err: 1,
      msg: "Trạng thái bài đăng không hợp lệ.",
      response: null,
    });
  }

  try {
    const response = await postService.updatePostStatusService(
      req.params.id,
      nextStatus,
      req.user.id,
      req.body?.moderationReason,
    );
    const statusCode =
      response?.statusCode || (response?.err === 0 ? 200 : 400);
    return res.status(statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const forceDeletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await postService.forceDeletePostService(id);
    const statusCode =
      response?.statusCode || (response?.err === 0 ? 200 : 400);
    return res.status(statusCode).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const filters = {};

    if (req.query?.role) {
      filters.role = req.query.role;
    }

    if (req.query?.status) {
      filters.status = req.query.status;
    }

    const response = await userService.getUsers(filters);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const response = await userService.getUserById(req.params.id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  const nextStatus = String(req.body?.status || "").trim().toLowerCase();

  if (!USER_STATUSES.includes(nextStatus)) {
    return res.status(400).json({
      err: 1,
      msg: "Trạng thái tài khoản không hợp lệ.",
      response: null,
    });
  }

  try {
    const response = await userService.updateUserStatus(req.params.id, {
      status: normalizeUserStatus(nextStatus),
      blockedReason: req.body?.blockedReason,
    });
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};

export const promoteUserToAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await userService.promoteUserToAdmin(id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
      response: null,
    });
  }
};
