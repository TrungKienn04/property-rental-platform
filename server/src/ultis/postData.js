const extractUrls = (value) => {
  if (!value || typeof value !== "string") return [];

  const matches = value.match(/https?:\/\/[^\s"'(),\]]+/g);

  return (matches || []).map((url) => url.replace(/"/g, ""));
};

const isLikelyImageUrl = (value) => {
  if (typeof value !== "string") return false;
  if (!/^https?:\/\//i.test(value)) return false;

  try {
    const url = new URL(value);
    return url.hostname.length > 0 && url.pathname.length > 4;
  } catch (error) {
    return false;
  }
};

const normalizeImageList = (value) => {
  if (!value) return [];

  let parsedValue = value;

  if (typeof value === "string") {
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      try {
        parsedValue = JSON.parse(
          value.replace(/\\"/g, '"').replace(/\'/g, '"'),
        );
      } catch (repairError) {
        parsedValue = extractUrls(value);
      }
    }
  }

  const normalized = Array.isArray(parsedValue) ? parsedValue : [parsedValue];

  return normalized.filter(isLikelyImageUrl);
};

const normalizeDescription = (value) => {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    try {
      return JSON.parse(value.replace(/\\"/g, '"').replace(/\'/g, '"'));
    } catch (repairError) {
      return value;
    }
  }
};

module.exports = {
  extractUrls,
  normalizeDescription,
  normalizeImageList,
  isLikelyImageUrl,
};
