import actionTypes from "./actionTypes";
import { apiRegister, apiLogin } from "../../services/auth";
import { apiGetCurrent } from "../../services/user";

const {
  extractRoleFromToken,
  normalizeRole,
} = require("../../ultils/Common/authHelpers");

const AUTH_STORAGE_MODE_KEY = "APP_TOKEN_STORAGE";

const persistToken = (token, rememberMe = true) => {
  try {
    window.localStorage.removeItem("APP_TOKEN");
    window.sessionStorage.removeItem("APP_TOKEN");

    if (rememberMe) {
      window.localStorage.setItem("APP_TOKEN", token);
      window.localStorage.setItem(AUTH_STORAGE_MODE_KEY, "local");
    } else {
      window.sessionStorage.setItem("APP_TOKEN", token);
      window.localStorage.setItem(AUTH_STORAGE_MODE_KEY, "session");
    }
  } catch (error) {}
};

const clearAuthStorage = () => {
  try {
    window.localStorage.removeItem("APP_TOKEN");
    window.sessionStorage.removeItem("APP_TOKEN");
    window.localStorage.removeItem("persist:auth");
    window.localStorage.removeItem(AUTH_STORAGE_MODE_KEY);
  } catch (error) {}
};

const syncCurrentUser = async (dispatch) => {
  try {
    const response = await apiGetCurrent();
    const currentData = response?.data?.err === 0 ? response.data.response : {};

    dispatch({
      type: actionTypes.GET_CURRENT,
      currentData,
    });

    if (currentData?.role) {
      dispatch({
        type: actionTypes.SET_AUTH_ROLE,
        data: normalizeRole(currentData.role),
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_CURRENT,
      currentData: {},
    });
  }
};

const handleAuthSuccess = async (dispatch, type, token, rememberMe = true) => {
  const nextRole = extractRoleFromToken(token) || "user";

  persistToken(token, rememberMe);

  dispatch({
    type,
    data: token,
    role: nextRole,
  });

  await syncCurrentUser(dispatch);

  return {
    ok: true,
  };
};

export const register = (payload, options = {}) => async (dispatch) => {
  try {
    const response = await apiRegister(payload);

    if (response?.data?.err === 0) {
      return await handleAuthSuccess(
        dispatch,
        actionTypes.REGISTER_SUCCESS,
        response.data.token,
        options.rememberMe ?? true,
      );
    }

    dispatch({
      type: actionTypes.REGISTER_FAIL,
      data: response?.data?.msg,
    });

    return {
      ok: false,
      msg: response?.data?.msg,
    };
  } catch (error) {
    dispatch({
      type: actionTypes.REGISTER_FAIL,
      data: null,
    });

    return {
      ok: false,
      msg: null,
    };
  }
};

export const login = (payload, options = {}) => async (dispatch) => {
  try {
    const response = await apiLogin(payload);

    if (response?.data?.err === 0) {
      return await handleAuthSuccess(
        dispatch,
        actionTypes.LOGIN_SUCCESS,
        response.data.token,
        options.rememberMe ?? true,
      );
    }

    dispatch({
      type: actionTypes.LOGIN_FAIL,
      data: response?.data?.msg,
    });

    return {
      ok: false,
      msg: response?.data?.msg,
    };
  } catch (error) {
    dispatch({
      type: actionTypes.LOGIN_FAIL,
      data: null,
    });

    return {
      ok: false,
      msg: null,
    };
  }
};

export const logout = () => (dispatch) => {
  clearAuthStorage();

  dispatch({
    type: actionTypes.LOGOUT,
  });
};

export const doLogout = logout;
