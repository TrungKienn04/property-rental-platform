const getDisplayDescription = (description) => {
  if (Array.isArray(description)) {
    return description.filter(Boolean).join(" ");
  }

  return description || "";
};

const getShortAddress = (address = "") => {
  const segments = address
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (segments.length >= 2) {
    return segments.slice(-2).join(", ");
  }

  return address;
};

const getPrimaryImage = (images = [], fallbackImage = "/placeholder.svg") => {
  const normalized = Array.isArray(images) ? images.filter(Boolean) : [];

  if (normalized.length) return normalized[0];
  return fallbackImage;
};

module.exports = {
  getDisplayDescription,
  getPrimaryImage,
  getShortAddress,
};
