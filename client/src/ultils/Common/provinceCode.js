const SPECIAL_CODES = [
  {
    code: "TPHCM",
    aliases: [
      "thanh pho ho chi minh",
      "ho chi minh",
      "tp hcm",
      "tphcm",
      "sai gon",
      "saigon",
    ],
  },
  {
    code: "HANOI",
    aliases: ["thanh pho ha noi", "ha noi", "hanoi", "hn"],
  },
  {
    code: "DANANG",
    aliases: ["thanh pho da nang", "da nang", "danang", "dn"],
  },
];

export const normalizeProvinceText = (value = "") =>
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

export const stripProvincePrefix = (value = "") =>
  String(value || "").replace(/^(Thành phố|Tỉnh)\s+/i, "").trim();

export const createProvinceCode = (value = "") =>
  normalizeProvinceText(value).replace(/\s+/g, "").toUpperCase();

export const resolveProvinceCode = (value = "") => {
  const normalized = normalizeProvinceText(value);
  const condensed = normalized.replace(/\s+/g, "");

  const specialMatch = SPECIAL_CODES.find(({ aliases }) =>
    aliases.some((alias) => {
      const normalizedAlias = normalizeProvinceText(alias);
      return (
        normalized === normalizedAlias
        || normalized.includes(normalizedAlias)
        || condensed === normalizedAlias.replace(/\s+/g, "")
      );
    }),
  );

  if (specialMatch) {
    return specialMatch.code;
  }

  return createProvinceCode(stripProvincePrefix(value));
};
