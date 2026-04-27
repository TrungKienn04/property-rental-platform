const normalizePostPayload = (payload = {}) => ({
  categoryCode: String(payload.categoryCode || "").trim(),
  title: String(payload.title || "").trim(),
  priceNumber: Number(payload.priceNumber),
  areaNumber: Number(payload.areaNumber),
  images: Array.isArray(payload.images) ? payload.images.filter(Boolean) : [],
  address: String(payload.address || "").trim(),
  description: payload.description,
  target: String(payload.target || "Tat ca").trim(),
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

  if (
    !payload.priceNumber
    || Number.isNaN(payload.priceNumber)
    || payload.priceNumber <= 0
  ) {
    return "Giá cho thuê phải lớn hơn 0.";
  }

  if (
    !payload.areaNumber
    || Number.isNaN(payload.areaNumber)
    || payload.areaNumber <= 0
  ) {
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

module.exports = {
  normalizePostPayload,
  validatePostPayload,
};
