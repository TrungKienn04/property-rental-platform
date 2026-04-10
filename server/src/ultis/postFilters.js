const { Op } = require("sequelize");

const toArray = (value) => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value.flat(Infinity) : [value];
};

const compactValues = (values = []) =>
  values.filter((value) => value !== undefined && value !== null && value !== "");

const parseNumberRange = (value) => {
  const values = compactValues(toArray(value))
    .map((item) => Number(item))
    .filter((item) => !Number.isNaN(item));

  if (!values.length) return null;
  if (values.length === 1) return values[0];

  const [min, max] = values.sort((left, right) => left - right);
  return { [Op.between]: [min, max] };
};

const normalizeListFilter = (value) => {
  const values = compactValues(toArray(value)).map((item) => item.toString());

  if (!values.length) return null;
  if (values.length === 1) return values[0];

  return { [Op.in]: values };
};

const normalizePostFilterQuery = (rawQuery = {}) => {
  const normalized = {};

  Object.entries(rawQuery).forEach(([rawKey, rawValue]) => {
    const key = rawKey.endsWith("[]") ? rawKey.slice(0, -2) : rawKey;
    const values = compactValues(toArray(rawValue));

    if (!values.length) return;

    normalized[key] = values.length === 1 ? values[0] : values;
  });

  const page = Array.isArray(normalized.page)
    ? normalized.page[0]
    : normalized.page;
  const sort = Array.isArray(normalized.sort)
    ? normalized.sort[0]
    : normalized.sort;

  const filters = {
    ...normalized,
  };

  delete filters.page;
  delete filters.sort;

  if (filters.priceNumber) {
    delete filters.priceCode;
  }
  if (filters.areaNumber) {
    delete filters.areaCode;
  }

  return {
    page,
    sort,
    filters,
  };
};

const buildPostWhereClause = (filters = {}) => {
  const where = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (key === "priceNumber" || key === "areaNumber") {
      const range = parseNumberRange(value);
      if (range !== null) where[key] = range;
      return;
    }

    const normalized = normalizeListFilter(value);
    if (normalized !== null) where[key] = normalized;
  });

  return where;
};

module.exports = {
  buildPostWhereClause,
  normalizeListFilter,
  normalizePostFilterQuery,
  parseNumberRange,
  toArray,
};
