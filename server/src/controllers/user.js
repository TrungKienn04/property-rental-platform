import * as userService from "../services/user";
import * as postService from "../services/post";

const {
  normalizePostPayload,
  validatePostPayload,
} = require("../ultis/postPayload");
const { parsePostStatus } = require("../ultis/accessControl");

const normalizePage = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

export const getCurrent = async (req, res) => {
  const { id } = req.user;

  try {
    const response = await userService.getOne(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};

export const updateCurrent = async (req, res) => {
  const { id } = req.user;

  try {
    const response = await userService.updateCurrentUser(id, req.body);
    return res.status(response?.err === 0 ? 200 : 400).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};

export const getMyPosts = async (req, res) => {
  try {
    const requestedStatus = String(req.query?.status || "").trim();
    let normalizedStatus;

    if (requestedStatus) {
      normalizedStatus = parsePostStatus(requestedStatus);

      if (!normalizedStatus) {
        return res.status(400).json({
          err: 1,
          msg: "Trang thai bai dang khong hop le.",
          response: null,
        });
      }
    }

    const response = await postService.getPostsByUserService(req.user.id, {
      status: normalizedStatus,
      page: normalizePage(req.query?.page),
      limit: req.query?.limit,
    });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};

export const getMyPostById = async (req, res) => {
  try {
    const response = await postService.getPostByIdService(req.params.id, req.user);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};

export const createMyPost = async (req, res) => {
  try {
    const normalizedPayload = normalizePostPayload(req.body);
    const { categoryCode, title, priceNumber, areaNumber } = normalizedPayload;

    if (!categoryCode || !title || !priceNumber || !areaNumber) {
      return res.status(400).json({
        err: 1,
        msg: "Thieu du lieu dau vao.",
        response: null,
      });
    }

    const validationMessage = validatePostPayload(normalizedPayload);
    if (validationMessage) {
      return res.status(400).json({
        err: 1,
        msg: validationMessage,
        response: null,
      });
    }

    const response = await postService.createNewPostService(
      normalizedPayload,
      req.user.id,
    );

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};

export const updateMyPost = async (req, res) => {
  return res.status(403).json({
    err: 1,
    msg: "Khong duoc phep chinh sua bai dang trong workflow hien tai.",
    response: null,
  });
};

export const deleteMyPost = async (req, res) => {
  return res.status(403).json({
    err: 1,
    msg: "Khong duoc phep xoa bai dang trong workflow hien tai.",
    response: null,
  });
};

export const uploadMyPostImage = async (req, res) => {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({
        err: 1,
        msg: "Khong nhan duoc tep anh hop le.",
        response: null,
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      err: 0,
      msg: "OK",
      response: {
        secure_url: `${baseUrl}/uploads/posts/${req.file.filename}`,
        original_filename: req.file.originalname,
      },
      secure_url: `${baseUrl}/uploads/posts/${req.file.filename}`,
      original_filename: req.file.originalname,
    });
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at user controller: ${error}`,
      response: null,
    });
  }
};
