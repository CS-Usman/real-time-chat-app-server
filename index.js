import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import errorHandler from "./middlewares/errorHandler.js";
import morgan from "morgan";
import { rateLimit } from 'express-rate-limit'
import helmet from "helmet";
import mongoSanitize from 'express-mongo-sanitize';
import xss from "xss";

const app = express();

app.use(mongoSanitize());

// app.use(xss());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    credentials: true
}))

app.use(errorHandler);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
}

const limiter = rateLimit({
    max: 3000,
    windowMs: 60 * 60 * 1000, // 1 hr
    message: "Too many requests from this IP , try again in one hour"
});

app.use("/tawk", limiter);


app.get("/", (req, res) => {
    res.send("Server up and running!");
});

app.use("/", router);

export default app;