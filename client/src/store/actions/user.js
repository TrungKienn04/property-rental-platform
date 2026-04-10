import actionTypes from "./actionTypes";
import * as apis from "../../services";
import { logout } from "./auth";

export const getCurrent = () => async (dispatch) => {
  try {
    const response = await apis.apiGetCurrent();

    if (response?.data?.err === 0) {
      dispatch({
        type: actionTypes.GET_CURRENT,
        currentData: response.data.response,
      });
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
