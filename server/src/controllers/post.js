import * as postService from "../services/post";

const { normalizePostFilterQuery } = require("../ultis/postFilters");

const normalizePostPayload = (payload = {}) => ({
  categoryCode: String(payload.categoryCode || "").trim(),
  title: String(payload.title || "").trim(),
  priceNumber: Number(payload.priceNumber),
  areaNumber: Number(payload.areaNumber),
  images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
  address: String(payload.address || "").trim(),
  description: payload.description,
  target: String(payload.target || "Tất cả").trim(),
  provinceCode: String(payload.provinceCode || "").trim(),
  province: String(payload.province || "").trim(),
});

const validatePostPayload = (payload = {}) => {
  if (!payload.categoryCode) return "Vui lòng chọn danh mục.";

  if (!payload.title || payload.title.length < 10) {
    return "Tiêu đề cần tối thiểu 10 ký tự.";
  }

  if (!payload.address || payload.address.length < 8) {
    return "Vui lòng nhập địa chỉ cho thuê đầy đủ.";
  }

  if (!payload.province) return "Vui lòng chọn tỉnh/thành phố.";
  if (!payload.images?.length) return "Vui lòng tải lên ít nhất 1 ảnh.";

  if (!payload.priceNumber || Number.isNaN(payload.priceNumber) || payload.priceNumber <= 0) {
    return "Giá cho thuê phải lớn hơn 0.";
  }

  if (!payload.areaNumber || Number.isNaN(payload.areaNumber) || payload.areaNumber <= 0) {
    return "Diện tích phải lớn hơn 0.";
  }

  const descriptionText = Array.isArray(payload.description)
    ? payload.description.join(" ").trim()
    : String(payload.description || "").trim();

  if (descriptionText.length < 20) {
    return "Nội dung mô tả cần tối thiểu 20 ký tự.";
  }

  return null;
};

export const getPosts = async (req, res) => {
  try {
    const response = await postService.getPostsService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const getPostsLimit = async (req, res) => {
  try {
    const { page, sort, filters } = normalizePostFilterQuery(req.query);

    const response = await postService.getPostsLimitService(page, filters, {
      priceNumber: filters.priceNumber,
      areaNumber: filters.areaNumber,
      sort,
    });

    return res.status(200).json(response);
  } catch (error) {
    console.error("[post.getPostsLimit] error name:", error && error.name);
    console.error("[post.getPostsLimit] message:", error && error.message);
    console.error("[post.getPostsLimit] code:", error && error.code);
    console.error("[post.getPostsLimit] errno:", error && error.errno);
    console.error("[post.getPostsLimit] sql:", error && error.sql);
    console.error("[post.getPostsLimit] sqlMessage:", error && error.sqlMessage);

    try {
      console.error("[post.getPostsLimit] props:", Object.getOwnPropertyNames(error || {}));
    } catch (nestedError) {
      /* ignore logging failure */
    }

    return res.status(500).json({
      err: -1,
      msg: "Failed at post controller",
    });
  }
};

export const getNewPosts = async (req, res) => {
  try {
    const response = await postService.getNewPostService();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await postService.getPostByIdService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const createNewPost = async (req, res) => {
  try {
    const normalizedPayload = normalizePostPayload(req.body);
    const { categoryCode, title, priceNumber, areaNumber } = normalizedPayload;
    const { id } = req.user || {};

    if (!categoryCode || !id || !title || !priceNumber || !areaNumber) {
      return res.status(400).json({
        err: 1,
        msg: "Thiếu dữ liệu đầu vào.",
      });
    }

    const validationMessage = validatePostPayload(normalizedPayload);
    if (validationMessage) {
      return res.status(400).json({
        err: 1,
        msg: validationMessage,
      });
    }

    const response = await postService.createNewPostService(normalizedPayload, id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const getPostsByCurrentUser = async (req, res) => {
  const { id } = req.user || {};

  try {
    const response = await postService.getPostsByUserService(id);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.user || {};
  const { id: postId } = req.params;
  const normalizedPayload = normalizePostPayload(req.body);
  const validationMessage = validatePostPayload(normalizedPayload);

  if (validationMessage) {
    return res.status(400).json({
      err: 1,
      msg: validationMessage,
    });
  }

  try {
    const response = await postService.updatePostService(postId, normalizedPayload, id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.user || {};
  const { id: postId } = req.params;

  try {
    const response = await postService.deletePostService(postId, id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file?.filename) {
      return res.status(400).json({
        err: 1,
        msg: "Không nhận được tệp ảnh hợp lệ.",
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    return res.status(200).json({
      err: 0,
      msg: "OK",
      secure_url: `${baseUrl}/uploads/posts/${req.file.filename}`,
      original_filename: req.file.originalname,
    });
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at post controller: ${error}`,
    });
  }
};
