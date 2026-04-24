import { formatVietnameseToString } from "./formatVietnameseToString";

const DEFAULT_TARGET = "Tat ca";

export const SYSTEM_POST_PAGE_SIZE = 10;

export const POST_STATUS = {
  PENDING: "pending",
  PUBLISHED: "published",
  REJECTED: "rejected",
  HIDDEN: "hidden",
  DELETED: "deleted",
};

export const ADMIN_POST_FILTERS = [
  { value: "", label: "Tat ca" },
  { value: POST_STATUS.PENDING, label: "Cho duyet" },
  { value: POST_STATUS.PUBLISHED, label: "Dang hien thi" },
  { value: POST_STATUS.REJECTED, label: "Tu choi" },
  { value: POST_STATUS.HIDDEN, label: "Da an" },
  { value: POST_STATUS.DELETED, label: "Da xoa" },
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

  if (!values.categoryCode) errors.categoryCode = "Chon danh muc.";

  const title = String(values.title || "").trim();
  if (!title) {
    errors.title = "Nhap tieu de tin dang.";
  } else if (title.length < 10) {
    errors.title = "Tieu de can toi thieu 10 ky tu.";
  }

  if (!String(values.exactAddress || "").trim()) {
    errors.exactAddress = "Nhap dia chi cu the.";
  }

  if (!String(values.province || "").trim()) {
    errors.province = "Chon tinh/thanh pho.";
  }

  if (!String(values.district || "").trim()) {
    errors.district = "Chon quan/huyen.";
  }

  const priceNumber = Number(values.priceNumber);
  if (!values.priceNumber || Number.isNaN(priceNumber) || priceNumber <= 0) {
    errors.priceNumber = "Nhap gia cho thue hop le.";
  }

  const areaNumber = Number(values.areaNumber);
  if (!values.areaNumber || Number.isNaN(areaNumber) || areaNumber <= 0) {
    errors.areaNumber = "Nhap dien tich hop le.";
  }

  const descriptionLines = textareaToDescriptionLines(values.description);
  if (!descriptionLines.length) {
    errors.description = "Nhap noi dung mo ta.";
  } else if (descriptionLines.join(" ").length < 20) {
    errors.description = "Noi dung mo ta can toi thieu 20 ky tu.";
  }

  if (!Array.isArray(values.images) || !values.images.length) {
    errors.images = "Tai len it nhat 1 anh.";
  }

  if (!String(values.address || buildFullAddress(values)).trim()) {
    errors.address = "Dia chi dang chua hoan chinh.";
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
      label: "Da het han hien thi",
      tone: "text-rose-600",
    };
  }

  if (diffInDays <= 2) {
    return {
      label: `Sap het han sau ${diffInDays} ngay`,
      tone: "text-amber-700",
    };
  }

  return {
    label: `Con hien thi khoang ${diffInDays} ngay`,
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
        label: "Cho duyet",
        tone: "bg-amber-100 text-amber-700",
        description: "Tin dang cho admin kiem duyet va chua hien thi cong khai.",
        note: null,
      };
    case POST_STATUS.REJECTED:
      return {
        key: POST_STATUS.REJECTED,
        label: "Tu choi",
        tone: "bg-rose-100 text-rose-700",
        description:
          post?.moderationReason || "Tin da bi tu choi va khong hien thi cong khai.",
        note: null,
      };
    case POST_STATUS.HIDDEN:
      return {
        key: POST_STATUS.HIDDEN,
        label: "Da an",
        tone: "bg-slate-200 text-slate-700",
        description:
          post?.moderationReason || "Tin da bi an khoi danh sach cong khai.",
        note: null,
      };
    case POST_STATUS.DELETED:
      return {
        key: POST_STATUS.DELETED,
        label: "Da xoa",
        tone: "bg-rose-50 text-rose-700",
        description: "Tin da bi xoa mem va dang cho xoa vinh vien neu can.",
        note: null,
      };
    case POST_STATUS.PUBLISHED:
      return {
        key: POST_STATUS.PUBLISHED,
        label: "Dang hien thi",
        tone: "bg-emerald-100 text-emerald-700",
        description: "Tin dang duoc hien thi cong khai.",
        note: expiryNote,
      };
    default:
      return {
        key: normalizedStatus || "unknown",
        label: "Khong ro",
        tone: "bg-slate-100 text-slate-600",
        description: "Trang thai hien tai khong hop le hoac chua dong bo dung.",
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
          label: "Duyet",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
          key: "reject",
          actionType: "status",
          nextStatus: POST_STATUS.REJECTED,
          label: "Tu choi",
          className:
            "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
        },
        {
          key: "soft-delete-pending",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xoa",
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
          label: "Go",
          className:
            "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
        },
        {
          key: "soft-delete-rejected",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xoa",
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
          label: "An",
          className:
            "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200",
        },
        {
          key: "soft-delete-published",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xoa",
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
          label: "Go",
          className:
            "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
        },
        {
          key: "soft-delete-hidden",
          actionType: "status",
          nextStatus: POST_STATUS.DELETED,
          label: "Xoa",
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
                label: "Hoan tac",
                className:
                  "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100",
              },
            ]
          : []),
        {
          key: "force-delete",
          actionType: "force-delete",
          label: "Xoa vinh vien",
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
