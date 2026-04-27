import actionTypes from "../actions/actionTypes";

const initState = {
  ids: [],
  posts: [],
};

const uniqueIds = (ids = []) => Array.from(new Set(ids.filter(Boolean)));

const savedPostReducer = (state = initState, action) => {
  switch (action.type) {
    case actionTypes.LOGOUT:
      return initState;

    case actionTypes.GET_SAVED_POST_IDS:
      return {
        ...state,
        ids: uniqueIds(action.ids || []),
      };

    case actionTypes.GET_SAVED_POSTS:
      return {
        ...state,
        posts: Array.isArray(action.posts) ? action.posts : [],
      };

    case actionTypes.TOGGLE_SAVED_POST: {
      const postId = action.payload?.postId;
      const saved = Boolean(action.payload?.saved);

      if (!postId) return state;

      const nextIds = saved
        ? uniqueIds([...(state.ids || []), postId])
        : (state.ids || []).filter((id) => String(id) !== String(postId));

      const nextPosts = saved
        ? state.posts
        : (state.posts || []).filter((post) => String(post?.id) !== String(postId));

      return {
        ...state,
        ids: nextIds,
        posts: nextPosts,
      };
    }

    default:
      return state;
  }
};

export default savedPostReducer;

