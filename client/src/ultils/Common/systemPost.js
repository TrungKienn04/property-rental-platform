import { formatVietnameseToString } from "./formatVietnameseToString";

const DEFAULT_TARGET = "Tất cả";

export const SYSTEM_POST_PAGE_SIZE = 10;

export const POST_STATUS = {
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
  const rawTarget = String(post?.overview?.target || "").trim();
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
    target: rawTarget.toLowerCase() === "tat ca" ? DEFAULT_TARGET : rawTarget || DEFAULT_TARGET,
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
    errors.exactAddress = "Nhập địa chỉ cụ thể.";
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
    errors.address = "Địa chỉ đăng chưa hoàn chỉnh.";
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
    case POST_STATUS.PENDING:
      return {
        key: POST_STATUS.PENDING,
        label: "Chờ duyệt",
        tone: "bg-amber-100 text-amber-700",
        description: "Tin đang chờ admin kiểm duyệt và chưa hiển thị công khai.",
        note: null,
      };
    case POST_STATUS.REJECTED:
      return {
        key: POST_STATUS.REJECTED,
        label: "Từ chối",
        tone: "bg-rose-100 text-rose-700",
        description:
          post?.moderationReason || "Tin đã bị từ chối và không hiển thị công khai.",
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
        description: "Tin đã bị xóa mềm và đang chờ xóa vĩnh viễn nếu cần.",
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
        description: "Trạng thái hiện tại không hợp lệ hoặc chưa đồng bộ đúng.",
        note: expiryNote,
      };
  }
};

const getDeletedRestoreStatus = (post = {}) => {
  const normalizedStatus = String(post?.deletedFromStatus || "")
    .trim()
    .toLowerCase();

  return [
    POST_STATUS.PENDING,
    POST_STATUS.PUBLISHED,
    POST_STATUS.REJECTED,
    POST_STATUS.HIDDEN,
  ].includes(normalizedStatus)
    ? normalizedStatus
    : "";
};

export const getAdminStatusActions = (post = {}) => {
  const normalizedStatus = String(post?.status || "").trim().toLowerCase();
  const deletedRestoreStatus = getDeletedRestoreStatus(post);

  switch (normalizedStatus) {
    case POST_STATUS.PENDING:
      return [
        {
          key: "approve",
          actionType: "status",
          nextStatus: POST_STATUS.PUBLISHED,
          label: "Duyệt",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
          key: "reject",
          actionType: "status",
          nextStatus: POST_STATUS.REJECTED,
          label: "Từ chối",
          className:
            "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        },
        {
          key: "soft-delete-pending",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xóa",
          className:
            "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700",
        },
      ];
    case POST_STATUS.REJECTED:
      return [
        {
          key: "reopen-rejected",
          actionType: "status",
          nextStatus: POST_STATUS.PENDING,
          label: "Gỡ",
          className:
            "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        },
        {
          key: "soft-delete-rejected",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xóa",
          className:
            "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700",
        },
      ];
    case POST_STATUS.PUBLISHED:
      return [
        {
          key: "hide",
          actionType: "status",
          nextStatus: POST_STATUS.HIDDEN,
          label: "Ẩn",
          className:
            "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
        },
        {
          key: "soft-delete-published",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xóa",
          className:
            "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700",
        },
      ];
    case POST_STATUS.HIDDEN:
      return [
        {
          key: "unhide",
          actionType: "status",
          nextStatus: POST_STATUS.PUBLISHED,
          label: "Gỡ ẩn",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
          key: "soft-delete-hidden",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xóa",
          className:
            "border-rose-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700",
        },
      ];
    case POST_STATUS.DELETED:
      return [
        ...(deletedRestoreStatus
          ? [
              {
                key: "restore-deleted",
                actionType: "status",
                nextStatus: deletedRestoreStatus,
                label: "Hoàn tác",
                className:
                  "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
              },
            ]
          : []),
        {
          key: "force-delete",
          actionType: "force-delete",
          label: "Xóa vĩnh viễn",
          className:
            "border-rose-600 bg-rose-600 text-white hover:bg-rose-700",
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
