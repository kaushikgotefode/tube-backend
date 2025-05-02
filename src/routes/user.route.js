import { Router } from "express";
import {
    getCurrentUser,
    loginUser,
    logoutUser,
    refreshActionToken,
    registerUser,
    updatePassword,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyUser } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    registerUser,
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyUser, logoutUser);
router.route("/update-password").get(verifyUser, updatePassword);
router.route("/refresh-token").post(refreshActionToken);
router.route("/current-user").get(verifyUser, getCurrentUser);

export default router;
