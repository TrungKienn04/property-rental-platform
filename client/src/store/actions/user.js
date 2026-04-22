import actionTypes from "./actionTypes";
import * as apis from "../../services";
import { logout } from "./auth";

const { normalizeRole } = require("../../ultils/Common/authHelpers");

export const getCurrent = () => async (dispatch) => {
  dispatch({
    type: actionTypes.GET_CURRENT_REQUEST,
  });

  try {
    const response = await apis.apiGetCurrent();

    if (response?.data?.err === 0) {
      const currentData = response.data.response || {};

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

      return response;
    }

    dispatch({
      type: actionTypes.GET_CURRENT,
      msg: response?.data?.msg,
      currentData: {},
    });

    if (response?.status === 401) {
      dispatch(logout());
    }

    return response;
  } catch (error) {
    if (error?.response?.status === 401) {
      dispatch(logout());
      return null;
    }

    dispatch({
      type: actionTypes.GET_CURRENT,
      currentData: {},
      msg: error?.response?.data?.msg || error?.message || "Failed to get current user",
    });

    return null;
  }
};
