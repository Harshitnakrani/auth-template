import { ApiError } from "../utils/ApiError.ts"
import { asyncHandeler } from "../utils/asyncHandler.ts"
import jwt from "jsonwebtoken";

export const verifyJWT = (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string, (err : any, decoded : any) => {
      if (err) {
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
      }

      req.user = decoded;
      next();
    });
  } catch (error : any) {
    console.error("verifyJWT Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
