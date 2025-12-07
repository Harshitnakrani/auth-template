import { Router } from "express";
import { verifyJWT } from "../middlewares/Auth.middleware.ts";
import { changeCurrentPassword, getUserDetails, loginUser, logoutUser, refreshAccessToken, registerUser, updateCoverImage, updateUserAvatar, updateUserDetails } from "../controllers/Auth.controller.ts";
import { upload } from "../middlewares/multer.middleware.ts";

export const userRouter = Router()

userRouter.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]), registerUser)

userRouter.route("/login").post(loginUser)
userRouter.route("/refresh-token").post(refreshAccessToken)

//Protected routes
userRouter.route("/logout").get(verifyJWT, logoutUser)
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword)
userRouter.route("/update-user-details").post(verifyJWT, updateUserDetails)
userRouter.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateUserAvatar)
userRouter.route("/update-coverimage").post(verifyJWT, upload.single("coverImage"), updateCoverImage)
userRouter.route("/get-user-details").get(verifyJWT, getUserDetails)
