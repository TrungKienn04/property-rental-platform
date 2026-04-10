import express from "express";
import * as postController from "../controllers/post";
import verifyToken from "../middlewares/verifyToken";
import upload from "../middlewares/uploadPostImages";

const router = express.Router();

const uploadSingleImage = (req, res, next) => {
  const handler = upload.single("file");

  handler(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    res.status(400).json({
      err: 1,
      msg:
        error.code === "LIMIT_FILE_SIZE"
          ? "Ảnh tải lên không được vượt quá 5MB."
          : error.message || "Không thể tải ảnh lên.",
    });
  });
};

router.get("/all", postController.getPosts);
router.get("/limit", postController.getPostsLimit);
router.get("/new-post", postController.getNewPosts);
router.get("/manage/all", verifyToken, postController.getPostsByCurrentUser);
router.post("/upload-image", verifyToken, uploadSingleImage, postController.uploadImage);
router.post("/create-new", verifyToken, postController.createNewPost);
router.put("/:id", verifyToken, postController.updatePost);
router.delete("/:id", verifyToken, postController.deletePost);
router.get("/:id", postController.getPostById);

export default router;
