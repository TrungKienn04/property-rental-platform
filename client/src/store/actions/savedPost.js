import actionTypes from "./actionTypes";
import {
  apiGetSavedPostIds,
  apiGetSavedPosts,
  apiToggleSavedPost,
} from "../../services";

export const getSavedPostIds = () => async (dispatch) => {
  try {
    const response = await apiGetSavedPostIds();
    if (response?.data?.err === 0) {
      dispatch({
        type: actionTypes.GET_SAVED_POST_IDS,
        ids: response.data.response,
      });
    } else {
      dispatch({
        type: actionTypes.GET_SAVED_POST_IDS,
        ids: [],
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_SAVED_POST_IDS,
      ids: [],
    });
  }
};

export const getSavedPosts = () => async (dispatch) => {
  try {
    const response = await apiGetSavedPosts();
    if (response?.data?.err === 0) {
      dispatch({
        type: actionTypes.GET_SAVED_POSTS,
        posts: response.data.response,
      });
    } else {
      dispatch({
        type: actionTypes.GET_SAVED_POSTS,
        posts: [],
      });
    }
  } catch (error) {
    dispatch({
      type: actionTypes.GET_SAVED_POSTS,
      posts: [],
    });
  }
};

export const toggleSavedPost = (postId) => async (dispatch) => {
  try {
    const response = await apiToggleSavedPost(postId);
    if (response?.data?.err === 0) {
      dispatch({
        type: actionTypes.TOGGLE_SAVED_POST,
        payload: response.data.response,
      });
      return response.data.response;
    }
  } catch (error) {
    // ignore
  }

  return null;
};

