import express from "express";
import * as adminController from "../controllers/admin";
import verifyToken, { requireRole } from "../middlewares/verifyToken";
import { loadCurrentUser } from "../middlewares/authAccess";
import { loadPost } from "../middlewares/postAccess";

const router = express.Router();

router.use(verifyToken, loadCurrentUser, requireRole("admin"));

router.get("/posts", adminController.getPosts);
router.get("/posts/:id", loadPost, adminController.getPostById);
router.patch("/posts/:id/status", loadPost, adminController.updatePostStatus);
router.delete("/posts/:id", loadPost, adminController.forceDeletePost);

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.patch("/users/:id/role", adminController.promoteUserToAdmin);

router.delete("/post/:id/force", loadPost, adminController.forceDeletePost);
router.patch("/user/:id/role", adminController.promoteUserToAdmin);

export default router;
