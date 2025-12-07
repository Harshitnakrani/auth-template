import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/user.routes.ts"
const server = express()

server.use(cors({
    origin:["your domain "],
    credentials: true 
}))
server.use(express.json())
server.use(express.urlencoded({ extended: true }))
server.use(cookieParser())
server.use(express.static('uploads'))
server.use("/api/users",userRouter)
export default server