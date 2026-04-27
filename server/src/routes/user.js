import express from "express";
import verifyToken from "../middlewares/verifyToken";
import uploadSinglePostImage from "../middlewares/uploadSinglePostImage";
import { loadCurrentUser, requireActiveUser } from "../middlewares/authAccess";
import { loadPost, requirePostOwner } from "../middlewares/postAccess";
import * as userController from "../controllers/user";

const router = express.Router();

router.use(verifyToken, loadCurrentUser);

router.get("/get-current", userController.getCurrent);
router.get("/me", userController.getCurrent);
router.put("/profile", userController.updateCurrent);
router.put("/me", userController.updateCurrent);

router.get("/posts", requireActiveUser, userController.getMyPosts);
router.get("/saved-posts/ids", requireActiveUser, userController.getSavedPostIds);
router.get("/saved-posts", requireActiveUser, userController.getSavedPosts);
router.post(
  "/saved-posts/:postId",
  requireActiveUser,
  userController.toggleSavedPost,
);
router.post("/posts", requireActiveUser, userController.createMyPost);
router.post(
  "/posts/upload-image",
  requireActiveUser,
  uploadSinglePostImage,
  userController.uploadMyPostImage,
);
router.get(
  "/posts/:id",
  requireActiveUser,
  loadPost,
  requirePostOwner,
  userController.getMyPostById,
);
router.put(
  "/posts/:id",
  requireActiveUser,
  loadPost,
  requirePostOwner,
  userController.updateMyPost,
);
router.delete(
  "/posts/:id",
  requireActiveUser,
  loadPost,
  requirePostOwner,
  userController.deleteMyPost,
);

export default router;
