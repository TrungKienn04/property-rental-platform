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
  if (!payload.categoryCode) return "Vui long chon danh muc.";

  if (!payload.title || payload.title.length < 10) {
    return "Tieu de can toi thieu 10 ky tu.";
  }

  if (!payload.address || payload.address.length < 8) {
    return "Vui long nhap dia chi cho thue day du.";
  }

  if (!payload.province) return "Vui long chon tinh/thanh pho.";
  if (!payload.images?.length) return "Vui long tai len it nhat 1 anh.";

  if (
    !payload.priceNumber
    || Number.isNaN(payload.priceNumber)
    || payload.priceNumber <= 0
  ) {
    return "Gia cho thue phai lon hon 0.";
  }

  if (
    !payload.areaNumber
    || Number.isNaN(payload.areaNumber)
    || payload.areaNumber <= 0
  ) {
    return "Dien tich phai lon hon 0.";
  }

  const descriptionText = Array.isArray(payload.description)
    ? payload.description.join(" ").trim()
    : String(payload.description || "").trim();

  if (descriptionText.length < 20) {
    return "Noi dung mo ta can toi thieu 20 ky tu.";
  }

  return null;
};

module.exports = {
  normalizePostPayload,
  validatePostPayload,
};
