import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import { ApiError } from "./ApiError.ts";

dotenv.config()
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});
const uploadOnCloudinary = async (localFilePath: string) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })
    fs.unlinkSync(localFilePath)
    return response
  } catch (error: any | ApiError) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath)
    console.error("Cloudinary upload error:", error.message);
    throw new ApiError(500, "Cloudinary upload error", [error.message])
  }
};

export { uploadOnCloudinary };
