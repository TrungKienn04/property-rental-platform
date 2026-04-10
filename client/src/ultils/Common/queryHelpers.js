const DEFAULT_POSTS_LIMIT = Number(process.env.REACT_APP_LIMIT_POSTS) || 5;

const buildSearchParamsObject = (searchParams) => {
  const entries =
    typeof searchParams?.entries === "function"
      ? Array.from(searchParams.entries())
      : Array.isArray(searchParams)
        ? searchParams
        : [];

  return entries.reduce((accumulator, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return accumulator;
    }

    if (Object.prototype.hasOwnProperty.call(accumulator, key)) {
      const currentValue = accumulator[key];
      accumulator[key] = Array.isArray(currentValue)
        ? [...currentValue, value]
        : [currentValue, value];
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});
};

const removeEmptyQueryValues = (query = {}) =>
  Object.entries(query).reduce((accumulator, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return accumulator;
    }

    if (Array.isArray(value)) {
      const compact = value.filter(
        (item) => item !== undefined && item !== null && item !== "",
      );
      if (!compact.length) return accumulator;
      accumulator[key] = compact;
      return accumulator;
    }

    accumulator[key] = value;
    return accumulator;
  }, {});

const mergeQueryValues = (currentQuery = {}, patch = {}) =>
  removeEmptyQueryValues({
    ...currentQuery,
    ...patch,
  });

const buildSearchTitle = (queries = {}) => {
  const parts = [
    queries.category || "Cho thuê tất cả",
    queries.province ? `tại ${queries.province}` : "",
    queries.price ? `mức giá ${queries.price}` : "",
    queries.area ? `diện tích ${queries.area}` : "",
  ].filter(Boolean);

  return parts.join(" ");
};

const getTotalPages = (count, limit = DEFAULT_POSTS_LIMIT) => {
  if (!count || !limit) return 0;
  return Math.ceil(count / limit);
};

module.exports = {
  DEFAULT_POSTS_LIMIT,
  buildSearchParamsObject,
  buildSearchTitle,
  getTotalPages,
  mergeQueryValues,
  removeEmptyQueryValues,
};
