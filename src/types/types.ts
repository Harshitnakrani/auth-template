import { Document } from "mongoose";

export interface IUserMethods {
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

export interface IUser extends Document {
    username: string;
    email: string;
    fullname: string;
    avatar: string;
    coverImage: string;
    password: string;
    refreshToken: string;
}

export interface IRegisterRequest {
    username?: string;
    email?: string;
    fullname?: string;
    password?: string;
}