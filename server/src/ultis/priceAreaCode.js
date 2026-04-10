const stripAccents = (value = "") =>
  String(value)
    .replace(/[\u0111\u0110]/g, (char) => (char === "\u0111" ? "d" : "D"))
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizeText = (value = "") =>
  stripAccents(value).replace(/\s+/g, " ").trim().toLowerCase();

const roundMetric = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 1000) / 1000;
};

const parseLocalizedNumber = (rawValue) => {
  if (typeof rawValue === "number") {
    return Number.isFinite(rawValue) ? rawValue : null;
  }

  if (typeof rawValue !== "string") return null;

  let token = rawValue.trim().replace(/[^\d.,-]/g, "");
  if (!token) return null;

  const dotCount = (token.match(/\./g) || []).length;
  const commaCount = (token.match(/,/g) || []).length;

  if (dotCount > 0 && commaCount > 0) {
    const decimalSeparator =
      token.lastIndexOf(".") > token.lastIndexOf(",") ? "." : ",";
    const thousandSeparator = decimalSeparator === "." ? "," : ".";

    token = token.split(thousandSeparator).join("");
    if (decimalSeparator === ",") {
      token = token.replace(",", ".");
    }
  } else if (commaCount > 0) {
    if (commaCount > 1) {
      token = token.replace(/,/g, "");
    } else {
      const [left, right = ""] = token.split(",");
      token = right.length === 3 ? `${left}${right}` : `${left}.${right}`;
    }
  } else if (dotCount > 0) {
    if (dotCount > 1) {
      token = token.replace(/\./g, "");
    } else {
      const [left, right = ""] = token.split(".");
      token = right.length === 3 ? `${left}${right}` : `${left}.${right}`;
    }
  }

  const parsed = Number(token);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractNumbers = (value = "") =>
  String(value)
    .match(/-?[\d.,]+/g)
    ?.map((item) => parseLocalizedNumber(item))
    .filter((item) => Number.isFinite(item)) || [];

const parsePriceValue = (value) => {
  const normalized = normalizeText(value);
  const numeric =
    typeof value === "string"
      ? extractNumbers(value)[0]
      : parseLocalizedNumber(value);

  if (!Number.isFinite(numeric)) return null;

  if (typeof value === "string") {
    if (normalized.includes("ty")) return roundMetric(numeric * 1000);
    if (normalized.includes("trieu")) return roundMetric(numeric);
    if (normalized.includes("nghin") || normalized.includes("ngan")) {
      return roundMetric(numeric / 1000);
    }
    if (normalized.includes("dong")) return roundMetric(numeric / 1000000);
    if (/\bk\b/.test(normalized)) return roundMetric(numeric / 1000);
  }

  if (numeric >= 100000) return roundMetric(numeric / 1000000);
  return roundMetric(numeric);
};

const parseAreaValue = (value) => {
  const numeric =
    typeof value === "string"
      ? extractNumbers(value)[0]
      : parseLocalizedNumber(value);

  if (!Number.isFinite(numeric)) return null;
  return roundMetric(numeric);
};

const parseRangeLabel = (label = "") => {
  const normalized = normalizeText(label);
  const numbers = extractNumbers(label);

  if (!numbers.length) return null;

  if (normalized.includes("duoi")) {
    return { min: 0, max: numbers[0] };
  }

  if (normalized.includes("tren")) {
    return { min: numbers[0], max: Number.POSITIVE_INFINITY };
  }

  if (numbers.length >= 2) {
    return { min: numbers[0], max: numbers[1] };
  }

  return { min: numbers[0], max: numbers[0] };
};

const isWithinRange = (value, range) => {
  if (!Number.isFinite(value) || !range) return false;
  if (range.max === Number.POSITIVE_INFINITY) return value >= range.min;
  return value >= range.min && value < range.max;
};

const getCatalogRange = (item = {}) => {
  const min = Number(item.min);
  const max = Number(item.max);

  if (Number.isFinite(min) && Number.isFinite(max)) {
    return { min, max };
  }

  return parseRangeLabel(item.value);
};

const resolveRangeCode = (value, catalog = []) => {
  if (!Number.isFinite(value) || !Array.isArray(catalog)) return null;

  const sortedCatalog = [...catalog].sort(
    (left, right) => (left.order || 0) - (right.order || 0),
  );

  const match = sortedCatalog.find((item) => isWithinRange(value, getCatalogRange(item)));

  return match?.code || null;
};

const formatMetric = (value) => {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value) ? `${value}` : `${value}`.replace(/\.0+$/, "");
};

const formatPriceAttribute = (value) => {
  if (!Number.isFinite(value)) return "";
  if (value < 1) return `${Math.round(value * 1000)} ngh\u00ecn/th\u00e1ng`;
  return `${formatMetric(value)} tri\u1ec7u/th\u00e1ng`;
};

const formatAreaAttribute = (value) => {
  if (!Number.isFinite(value)) return "";
  return `${formatMetric(value)}m2`;
};

const derivePostPriceAreaCodes = ({
  priceText,
  acreageText,
  priceNumber,
  areaNumber,
  priceCatalog = [],
  areaCatalog = [],
}) => {
  const normalizedPriceNumber =
    parsePriceValue(priceText) ?? parsePriceValue(priceNumber);
  const normalizedAreaNumber =
    parseAreaValue(acreageText) ?? parseAreaValue(areaNumber);

  return {
    priceNumber: normalizedPriceNumber,
    areaNumber: normalizedAreaNumber,
    priceCode: resolveRangeCode(normalizedPriceNumber, priceCatalog),
    areaCode: resolveRangeCode(normalizedAreaNumber, areaCatalog),
  };
};

module.exports = {
  derivePostPriceAreaCodes,
  formatAreaAttribute,
  formatPriceAttribute,
  normalizeText,
  parseAreaValue,
  parseLocalizedNumber,
  parsePriceValue,
  parseRangeLabel,
  resolveRangeCode,
};
