import express from "express";
import * as adminController from "../controllers/admin";
import verifyToken, { isAdmin } from "../middlewares/verifyToken";

const router = express.Router();

router.use(verifyToken, isAdmin);
router.delete("/post/:id/force", adminController.forceDeletePost);
router.patch("/user/:id/role", adminController.promoteUserToAdmin);

export default router;
