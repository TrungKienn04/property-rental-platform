import axios from "axios";
import { normalizeProvinceText, resolveProvinceCode, stripProvincePrefix } from "../ultils/Common/provinceCode";

const provinceCache = {
  data: null,
  promise: null,
};

const districtCache = new Map();

const sortByName = (items = [], key) =>
  [...items].sort((left, right) =>
    String(left?.[key] || "").localeCompare(String(right?.[key] || ""), "vi", {
      sensitivity: "base",
    }),
  );

const mapProvince = (item = {}) => ({
  province_id: String(item.code),
  province_code: resolveProvinceCode(item.name),
  province_name: stripProvincePrefix(item.name),
  province_label: item.name,
  province_search: normalizeProvinceText(item.name),
});

const mapDistrict = (item = {}) => ({
  district_id: String(item.code),
  district_name: item.name,
});

export const fetchVietnamProvinces = async () => {
  if (provinceCache.data) {
    return provinceCache.data;
  }

  if (!provinceCache.promise) {
    provinceCache.promise = axios
      .get("https://provinces.open-api.vn/api/v1/")
      .then((response) => sortByName((response?.data || []).map(mapProvince), "province_name"))
      .then((results) => {
        provinceCache.data = results;
        return results;
      })
      .finally(() => {
        provinceCache.promise = null;
      });
  }

  return provinceCache.promise;
};

export const fetchVietnamDistricts = async (provinceId) => {
  if (!provinceId) return [];

  const cached = districtCache.get(provinceId);
  if (cached?.data) {
    return cached.data;
  }

  if (!cached?.promise) {
    const promise = axios
      .get(`https://provinces.open-api.vn/api/v1/p/${provinceId}?depth=2`)
      .then((response) => sortByName((response?.data?.districts || []).map(mapDistrict), "district_name"))
      .then((results) => {
        districtCache.set(provinceId, { data: results, promise: null });
        return results;
      })
      .catch((error) => {
        districtCache.delete(provinceId);
        throw error;
      });

    districtCache.set(provinceId, { data: null, promise });
    return promise;
  }

  return cached.promise;
};
