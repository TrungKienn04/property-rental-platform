const DEFAULT_PROVINCES = [
  { code: "TPHCM", value: "Thành phố Hồ Chí Minh" },
  { code: "HANOI", value: "Hà Nội" },
  { code: "DANANG", value: "Đà Nẵng" },
];

const EXTRA_PROVINCE_ALIASES = {
  TPHCM: ["ho chi minh", "hochiminh", "tp hcm", "tphcm", "sai gon", "saigon"],
  HANOI: ["ha noi", "hanoi", "hn"],
  DANANG: ["da nang", "danang", "dn"],
};

const normalizeText = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const createProvinceCode = (value = "") =>
  normalizeText(value).replace(/\s+/g, "").toUpperCase();

const stripAdministrativePrefix = (value = "") =>
  value.replace(/^(thanh pho|tp|tinh)\s+/i, "").trim();

const extractProvinceNameFromAddress = (address = "") => {
  const segments = address
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return segments.length ? segments[segments.length - 1] : "";
};

const getProvinceAliases = (province = {}) => {
  const aliasSet = new Set();
  const rawValue = province?.value || "";
  const normalizedValue = normalizeText(rawValue);
  const strippedValue = normalizeText(stripAdministrativePrefix(rawValue));
  const words = strippedValue.split(" ").filter(Boolean);

  [normalizedValue, strippedValue].filter(Boolean).forEach((alias) => {
    aliasSet.add(alias);
    aliasSet.add(alias.replace(/\s+/g, ""));
  });

  if (words.length >= 2) {
    aliasSet.add(words.slice(-2).join(" "));
    aliasSet.add(words.slice(-2).join(""));
  }

  if (words.length >= 3) {
    aliasSet.add(words.slice(-3).join(" "));
    aliasSet.add(words.slice(-3).join(""));
  }

  (EXTRA_PROVINCE_ALIASES[province?.code] || []).forEach((alias) => {
    const normalizedAlias = normalizeText(alias);
    if (!normalizedAlias) return;
    aliasSet.add(normalizedAlias);
    aliasSet.add(normalizedAlias.replace(/\s+/g, ""));
  });

  return Array.from(aliasSet)
    .filter(Boolean)
    .sort((left, right) => right.length - left.length);
};

const mergeProvinceCatalog = (provinces = []) => {
  const provinceMap = new Map();

  [...DEFAULT_PROVINCES, ...provinces].forEach((province) => {
    if (!province?.code) return;
    provinceMap.set(province.code, {
      code: province.code,
      value: province.value || provinceMap.get(province.code)?.value || "",
    });
  });

  return Array.from(provinceMap.values());
};

const resolveProvinceCodeFromAddress = (address, provinces = []) => {
  const normalizedAddress = normalizeText(address);
  const condensedAddress = normalizedAddress.replace(/\s+/g, "");

  if (!normalizedAddress) return null;

  const catalog = mergeProvinceCatalog(provinces).flatMap((province) =>
    getProvinceAliases(province).map((alias) => ({
      code: province.code,
      alias,
    })),
  );

  catalog.sort((left, right) => right.alias.length - left.alias.length);

  const match = catalog.find(
    ({ alias }) =>
      normalizedAddress.includes(alias) || condensedAddress.includes(alias),
  );

  return match?.code || null;
};

const buildProvinceCodeUpdates = (posts = [], provinces = []) => {
  const updates = [];
  const unmatched = [];

  posts.forEach((post) => {
    const provinceCode = resolveProvinceCodeFromAddress(
      post?.address,
      provinces,
    );

    if (provinceCode) {
      updates.push({
        id: post.id,
        provinceCode,
      });
      return;
    }

    unmatched.push({
      id: post?.id || null,
      address: post?.address || "",
    });
  });

  return { updates, unmatched };
};

module.exports = {
  createProvinceCode,
  DEFAULT_PROVINCES,
  extractProvinceNameFromAddress,
  mergeProvinceCatalog,
  normalizeText,
  resolveProvinceCodeFromAddress,
  buildProvinceCodeUpdates,
};
