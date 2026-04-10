import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
});

const getStoredToken = () => {
  return (
    window.sessionStorage.getItem("APP_TOKEN") ||
    window.localStorage.getItem("APP_TOKEN") ||
    null
  );
};

instance.interceptors.request.use(
  function (config) {
    const token = getStoredToken();

    config.headers = {
      ...config.headers,
    };

    if (token) {
      config.headers.authorization = `Bearer ${token}`;
    } else {
      delete config.headers.authorization;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    return Promise.reject(error);
  },
);

export default instance;
