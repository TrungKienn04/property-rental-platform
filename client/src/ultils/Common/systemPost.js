import { formatVietnameseToString } from "./formatVietnameseToString";

const DEFAULT_TARGET = "Tất cả";

export const POST_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  DELETED: "deleted",
};

export const ADMIN_POST_FILTERS = [
  { value: "", label: "Tất cả" },
  { value: POST_STATUS.PENDING, label: "Chờ duyệt" },
  { value: POST_STATUS.PUBLISHED, label: "Đang hiển thị" },
  { value: POST_STATUS.REJECTED, label: "Từ chối" },
  { value: POST_STATUS.HIDDEN, label: "Đã ẩn" },
  { value: POST_STATUS.DRAFT, label: "Nháp" },
  { value: POST_STATUS.DELETED, label: "Đã xóa" },
];

export const sortByVietnameseName = (items = [], key) => {
  const safeItems = Array.isArray(items) ? [...items] : [];

  return safeItems.sort((left, right) =>
    String(left?.[key] || "").localeCompare(String(right?.[key] || ""), "vi", {
      sensitivity: "base",
    }),
  );
};

export const splitAddressParts = (address = "") =>
  String(address || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const buildFullAddress = ({
  exactAddress = "",
  district = "",
  province = "",
}) =>
  [exactAddress, district, province]
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .join(", ");

export const descriptionToTextarea = (description) => {
  if (Array.isArray(description)) return description.join("\n");
  return String(description || "");
};

export const textareaToDescriptionLines = (description) =>
  String(description || "")
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

export const createEmptyPostForm = () => ({
  categoryCode: "",
  title: "",
  priceNumber: "",
  areaNumber: "",
  images: [],
  address: "",
  priceCode: "",
  areaCode: "",
  description: "",
  target: DEFAULT_TARGET,
  provinceCode: "",
  province: "",
  district: "",
  exactAddress: "",
});

export const normalizePostFormFromRecord = (post = {}) => {
  const parts = splitAddressParts(post?.address);
  const province = post?.overview?.area || parts.slice(-1)[0] || "";
  const district = parts.length >= 2 ? parts.slice(-2)[0] : "";
  const exactAddress =
    parts.length > 2
      ? parts.slice(0, -2).join(", ")
      : parts.length === 1
        ? parts[0]
        : "";

  return {
    categoryCode: post?.categoryCode || "",
    title: post?.title || "",
    priceNumber: post?.priceNumber ? String(post.priceNumber) : "",
    areaNumber: post?.areaNumber ? String(post.areaNumber) : "",
    images: Array.isArray(post?.images?.image) ? post.images.image : [],
    address: post?.address || "",
    priceCode: post?.priceCode || "",
    areaCode: post?.areaCode || "",
    description: descriptionToTextarea(post?.description),
    target: post?.overview?.target || DEFAULT_TARGET,
    provinceCode: post?.provinceCode || "",
    province,
    district,
    exactAddress,
  };
};

export const validatePostForm = (values = {}) => {
  const errors = {};

  if (!values.categoryCode) errors.categoryCode = "Chọn danh mục.";

  const title = String(values.title || "").trim();
  if (!title) {
    errors.title = "Nhập tiêu đề tin đăng.";
  } else if (title.length < 10) {
    errors.title = "Tiêu đề cần tối thiểu 10 ký tự.";
  }

  if (!String(values.exactAddress || "").trim()) {
    errors.exactAddress =
      "Nhập số nhà, đường hoặc mô tả địa chỉ cụ thể.";
  }

  if (!String(values.province || "").trim()) {
    errors.province = "Chọn tỉnh/thành phố.";
  }

  if (!String(values.district || "").trim()) {
    errors.district = "Chọn quận/huyện.";
  }

  const priceNumber = Number(values.priceNumber);
  if (!values.priceNumber || Number.isNaN(priceNumber) || priceNumber <= 0) {
    errors.priceNumber = "Nhập giá cho thuê hợp lệ.";
  }

  const areaNumber = Number(values.areaNumber);
  if (!values.areaNumber || Number.isNaN(areaNumber) || areaNumber <= 0) {
    errors.areaNumber = "Nhập diện tích hợp lệ.";
  }

  const descriptionLines = textareaToDescriptionLines(values.description);
  if (!descriptionLines.length) {
    errors.description = "Nhập nội dung mô tả.";
  } else if (descriptionLines.join(" ").length < 20) {
    errors.description = "Nội dung mô tả cần tối thiểu 20 ký tự.";
  }

  if (!Array.isArray(values.images) || !values.images.length) {
    errors.images = "Tải lên ít nhất 1 ảnh.";
  }

  if (!String(values.address || buildFullAddress(values)).trim()) {
    errors.address = "Địa chỉ đang chưa hoàn chỉnh.";
  }

  return errors;
};

export const toPostPayload = (values = {}) => ({
  categoryCode: values.categoryCode,
  title: String(values.title || "").trim(),
  priceNumber: Number(values.priceNumber),
  areaNumber: Number(values.areaNumber),
  images: Array.isArray(values.images) ? values.images : [],
  address: buildFullAddress(values),
  priceCode: values.priceCode || "",
  areaCode: values.areaCode || "",
  description: textareaToDescriptionLines(values.description),
  target: values.target || DEFAULT_TARGET,
  provinceCode: values.provinceCode || "",
  province: String(values.province || "").trim(),
});

export const getMapEmbedUrl = (address = "") =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

const getExpiryNote = (post = {}) => {
  const expiredAt = post?.overview?.expired ? new Date(post.overview.expired) : null;

  if (!(expiredAt instanceof Date) || Number.isNaN(expiredAt.getTime())) {
    return null;
  }

  const diffInMs = expiredAt.getTime() - Date.now();
  const diffInDays = Math.ceil(diffInMs / (24 * 60 * 60 * 1000));

  if (diffInDays < 0) {
    return {
      label: "Đã hết hạn hiển thị",
      tone: "text-rose-600",
    };
  }

  if (diffInDays <= 2) {
    return {
      label: `Sắp hết hạn sau ${diffInDays} ngày`,
      tone: "text-amber-700",
    };
  }

  return {
    label: `Còn hiển thị khoảng ${diffInDays} ngày`,
    tone: "text-emerald-700",
  };
};

export const getPostStatusMeta = (post = {}) => {
  const normalizedStatus = String(post?.status || "").trim().toLowerCase();
  const expiryNote = getExpiryNote(post);

  switch (normalizedStatus) {
    case POST_STATUS.DRAFT:
      return {
        key: POST_STATUS.DRAFT,
        label: "Nháp",
        tone: "bg-slate-100 text-slate-700",
        description: "Tin mới lưu nháp, chưa đưa vào luồng duyệt.",
        note: null,
      };
    case POST_STATUS.PENDING:
      return {
        key: POST_STATUS.PENDING,
        label: "Chờ duyệt",
        tone: "bg-amber-100 text-amber-700",
        description: "Tin đang chờ quản trị viên kiểm duyệt.",
        note: null,
      };
    case POST_STATUS.REJECTED:
      return {
        key: POST_STATUS.REJECTED,
        label: "Từ chối",
        tone: "bg-rose-100 text-rose-700",
        description:
          post?.moderationReason || "Tin bị từ chối và chưa được hiển thị.",
        note: null,
      };
    case POST_STATUS.HIDDEN:
      return {
        key: POST_STATUS.HIDDEN,
        label: "Đã ẩn",
        tone: "bg-slate-200 text-slate-700",
        description:
          post?.moderationReason || "Tin đã bị ẩn khỏi danh sách công khai.",
        note: null,
      };
    case POST_STATUS.DELETED:
      return {
        key: POST_STATUS.DELETED,
        label: "Đã xóa",
        tone: "bg-rose-50 text-rose-700",
        description: "Tin đã bị gỡ khỏi hệ thống.",
        note: null,
      };
    case POST_STATUS.PUBLISHED:
      return {
        key: POST_STATUS.PUBLISHED,
        label: "Đang hiển thị",
        tone: "bg-emerald-100 text-emerald-700",
        description: "Tin đang được hiển thị công khai.",
        note: expiryNote,
      };
    default:
      return {
        key: normalizedStatus || "unknown",
        label: "Không rõ",
        tone: "bg-slate-100 text-slate-600",
        description: "Trạng thái chưa được đồng bộ đầy đủ từ máy chủ.",
        note: expiryNote,
      };
  }
};

export const getAdminStatusActions = (post = {}) => {
  const normalizedStatus = String(post?.status || "").trim().toLowerCase();

  switch (normalizedStatus) {
    case POST_STATUS.PENDING:
      return [
        {
          key: "approve",
          nextStatus: POST_STATUS.PUBLISHED,
          label: "Duyệt",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
          key: "reject",
          nextStatus: POST_STATUS.REJECTED,
          label: "Từ chối",
          requiresReason: true,
          className:
            "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        },
      ];
    case POST_STATUS.PUBLISHED:
      return [
        {
          key: "hide",
          nextStatus: POST_STATUS.HIDDEN,
          label: "Ẩn bài",
          requiresReason: true,
          className:
            "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
        },
      ];
    case POST_STATUS.HIDDEN:
      return [
        {
          key: "restore",
          nextStatus: POST_STATUS.PUBLISHED,
          label: "Hiện lại",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
      ];
    default:
      return [];
  }
};

export const countPostsByStatus = (posts = []) =>
  (Array.isArray(posts) ? posts : []).reduce((accumulator, item) => {
    const normalizedStatus = String(item?.status || "").trim().toLowerCase() || "unknown";

    return {
      ...accumulator,
      [normalizedStatus]: (accumulator[normalizedStatus] || 0) + 1,
    };
  }, {});

export const createDetailPath = (post = {}) =>
  `/chi-tiet/${formatVietnameseToString(post?.title || "tin-dang")}/${post?.id || ""}`;
