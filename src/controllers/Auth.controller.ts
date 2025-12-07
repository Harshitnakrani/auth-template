import { asyncHandeler } from "../utils/asyncHandler.ts";
import { User } from "../models/user.model.ts";
import type { IUser, IUserMethods , IRegisterRequest} from "../types/types.ts"
import { ApiResponse } from "../utils/ApiResponse.ts";
import { ApiError } from "../utils/ApiError.ts";
import type { Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.ts";
import jwt from "jsonwebtoken";


interface AuthRequest extends Request {
    user?: { _id: string };
}

const generateAccessAndRefreshTokens = async (userId: string) => {
    try {
        const user = (await User.findById(userId)) as (IUser & IUserMethods) | null;
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error while generating tokens");
    }
};

export const registerUser = asyncHandeler(async (req: AuthRequest, res: Response) => {
    const { username, email, fullname, password }: IRegisterRequest = req.body;

    const files = req.files as {
        avatar?: Express.Multer.File[];
        coverImage?: Express.Multer.File[];
    };

    const avatarLocalPath = files?.avatar?.[0]?.path;
    const coverImageLocalPath = files?.coverImage?.[0]?.path;

    if (!username || !email || !fullname || !password) {
        throw new ApiError(400, "All fields are required");
    }
    if (!username.match(/^[a-zA-Z0-9]+$/)) {
        throw new ApiError(400, "Username must contain only letters and numbers");
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        throw new ApiError(400, "Invalid email address");
    }
    if (password.length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long");
    }

    const avatarUpload = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;
    const coverImageUpload = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    const user = await User.create({
        username,
        email,
        fullname,
        password,
        avatar: avatarUpload?.url ?? "",
        coverImage: coverImageUpload?.url ?? "",
    });

    if (!user) {
        throw new ApiError(501, "Failed to create user");
    }

    res.status(201).json(new ApiResponse(201, user, "User registered successfully"));
});

export const loginUser = asyncHandeler(async (req: Request, res: Response) => {
    const { email, password }: IRegisterRequest = req.body
    if (!email) {
        throw new ApiError(401, "email is required")
    }
    const user = await User.findOne(
        { email }
    ) as (IUser & IUserMethods) | null

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const isPasswordValid = user.isPasswordCorrect(password as string)

    if (!isPasswordValid) throw new ApiError(401, "Wrong password")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString());

    const loggedInUser = await User.findById(user._id).select("-password") as IUser

    return res
        .status(200)
        .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json(
            new ApiResponse(
                200,
                { loggedInUser },
                "user loggedin successfully"
            )
        )
})


export const logoutUser = asyncHandeler(async (req: any, res: Response) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged out"))

})

export const refreshAccessToken = asyncHandeler(
    async (req: AuthRequest, res: Response) => {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        try {
            // jwt.verify returns string | object, we assert as object
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET as string
            ) as { _id: string };

            if (!decodedToken._id) throw new ApiError(401, "Invalid token");

            const user = await User.findById(decodedToken._id).select("-password");
            if (!user) throw new ApiError(404, "User not found");

            if (incomingRefreshToken !== user.refreshToken) {
                throw new ApiError(401, "Invalid refresh token");
            }

            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: "strict" as const,
            };

            const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id.toString());

            return res
                .status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed"));
        } catch (error) {
            throw new ApiError(401, "Error while refreshing access token");
        }
    }
);


export const changeCurrentPassword = asyncHandeler(async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    const isPasswordSame = await user?.isPasswordCorrect(oldPassword)
    if (!isPasswordSame) {
        throw new ApiError(401, "password incorrect")
    }
    user.password = newPassword;
    await user?.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, {}, "Password canged successfully"))
})


export const updateUserDetails = asyncHandeler(async (req: AuthRequest, res: Response) => {
    const { fullname, email } = req.body
    if (!fullname && !email) {
        throw new ApiError(401, "Invalid credintionals")
    }

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, { $set: { fullname, email } }, { new: true }).select("-password")

    return res.status(200).json(new ApiResponse(200, updatedUser, "userdetail updated"))
})

export const updateUserAvatar = asyncHandeler(async (req: AuthRequest, res: Response) => {

    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new ApiError(401, "avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar?.url) {
        throw new ApiError(400, "Error while uploading avatar")
    }

    const updatedAvtar = await User.findByIdAndUpdate(req.user?._id, { $set: { avatar: avatar.url } }, { new: true }).select("-password")
    return res.status(200).json(new ApiResponse(200, updatedAvtar, "User avatar updated"))
})


export const updateCoverImage = asyncHandeler(async (req: AuthRequest, res: Response) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverimage is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage?.url) {
        throw new ApiError(400, "Error while uploading coverimage")
    }

    const updatedCoverImage = User.findByIdAndUpdate(req.user?._id, { $set: { coverImage: coverImage.url } }, { new: true }).select("-password")

    return res.status(200).json(new ApiResponse(200, updatedCoverImage, "CoverImage updated successfuly"))
})

export const getUserDetails = asyncHandeler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(404, "user not found")
    }

    const userDetails = await User.findById(userId).select("-password")

    if (!userDetails) {
        throw new ApiError(404, "user details not found")
    }

    return res.status(200).json(new ApiResponse(200, userDetails, "user details found"))
})

