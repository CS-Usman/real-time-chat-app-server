import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = () => {
    mongoose
        .connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        })
        .then(() => {
            console.log("Connected to MongoDB");
            run();
        })
        .catch((err) => {
            console.error("Error connecting to MongoDB:", err);
        });
};

async function run() {
    await mongoose.connection.db.admin().ping();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
}