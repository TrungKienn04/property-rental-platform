import axiosConfig from "../axiosConfig";

export const apiGetSavedPostIds = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "get",
        url: "/api/v1/user/saved-posts/ids",
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

export const apiGetSavedPosts = () =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "get",
        url: "/api/v1/user/saved-posts",
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

export const apiToggleSavedPost = (postId) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: `/api/v1/user/saved-posts/${postId}`,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

