import * as postService from "../services/post";
import * as userService from "../services/user";

export const forceDeletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await postService.forceDeletePostService(id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
    });
  }
};

export const promoteUserToAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await userService.promoteUserToAdmin(id);
    return res.status(response?.err === 0 ? 200 : 404).json(response);
  } catch (error) {
    return res.status(500).json({
      err: -1,
      msg: `Failed at admin controller: ${error}`,
    });
  }
};
