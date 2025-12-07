import dotenv from "dotenv";
import connectDB from "./database/index.ts";
import server from "./server.ts";
dotenv.config();

connectDB().then(
    () => {
        console.log("Connected to database");
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    }
).catch(
    (error) => {
        console.log("Error connecting to database", error);
    }
)


