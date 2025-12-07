
import mongoose from "mongoose";

const connectDB = async ()=>{
    const DB_NAME = "your-database-name for best practice use env file"
    try {
        const databaseConnection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`) 
    } catch (error) {
        console.log("error ",error);
        process.exit(1)
    }
}
export default connectDB