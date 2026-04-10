import axiosConfig from "../axiosConfig";

export const apiRegister = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: "/api/v1/auth/register",
        data: payload,
      });
      resolve(response);
    } catch (error) {
      // return structured error so callers can handle messages
      const msg =
        error?.response?.data?.msg || error.message || "Internal error";
      resolve({ data: { err: -1, msg } });
    }
  });
export const apiLogin = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: "/api/v1/auth/login",
        data: payload,
      });
      resolve(response);
    } catch (error) {
      const msg =
        error?.response?.data?.msg || error.message || "Internal error";
      resolve({ data: { err: -1, msg } });
    }
  });
