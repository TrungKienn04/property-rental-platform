import actionTypes from "./actionTypes";
import * as apis from "../../services";
import { fetchVietnamProvinces } from "../../services/location";

export const getCategories = () => async (dispatch) => {
  try {
    const response = await apis.apiGetCategories();
    if (response?.data.err === 0) {
      dispatch({
        type: actionTypes.GET_CATEGORIES,
        categories: response.data.response,
      });
    } else {
      dispatch({
        type: actionTypes.GET_CATEGORIES,
        msg: response.data.msg,
        categories: null,
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_CATEGORIES,
      categories: null,
    });
  }
};
export const getPrices = () => async (dispatch) => {
  try {
    const response = await apis.apiGetPrices();
    if (response?.data.err === 0) {
      dispatch({
        type: actionTypes.GET_PRICES,
        prices: response.data.response.sort((a, b) => {
          return +a.order - +b.order;
        }),
        msg: "",
      });
    } else {
      dispatch({
        type: actionTypes.GET_PRICES,
        msg: response.data.msg,
        prices: null,
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_PRICES,
      prices: null,
      msg: error,
    });
  }
};
export const getAreas = () => async (dispatch) => {
  try {
    const response = await apis.apiGetAreas();
    if (response?.data.err === 0) {
      dispatch({
        type: actionTypes.GET_AREAS,
        areas: response.data.response.sort((a, b) => {
          return +a.order - +b.order;
        }),
        msg: "",
      });
    } else {
      dispatch({
        type: actionTypes.GET_AREAS,
        msg: response.data.msg,
        areas: null,
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_AREAS,
      areas: null,
      msg: error,
    });
  }
};
export const getProvinces = () => async (dispatch) => {
  let serverProvinces = [];

  try {
    const response = await apis.apiGetProvinces();
    if (response?.data.err === 0) {
      serverProvinces = response.data.response || [];
    }
  } catch (error) {
    serverProvinces = [];
  }

  try {
    const publicProvinces = await fetchVietnamProvinces();
    const provinceMap = new Map();

    publicProvinces.forEach((item) => {
      provinceMap.set(item.province_code, {
        code: item.province_code,
        value: item.province_name,
      });
    });

    serverProvinces.forEach((item) => {
      provinceMap.set(item.code, {
        code: item.code,
        value: item.value,
      });
    });

    const provinces = Array.from(provinceMap.values()).sort((left, right) =>
      String(left.value || "").localeCompare(String(right.value || ""), "vi", {
        sensitivity: "base",
      }),
    );

    dispatch({
      type: actionTypes.GET_PROVINCES,
      provinces,
      msg: "",
    });
  } catch (error) {
    dispatch({
      type: actionTypes.GET_PROVINCES,
      provinces: serverProvinces,
      msg: "",
    });
  }
};
