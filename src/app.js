import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// app.use("/api/v1", (req, res) => {
//     res.status(200).json({ message: "API is working" });
// });
// app.use((req, res, next) => {
//     res.status(404).json({ message: "Route not found" });
// });
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ message: "Internal server error" });
// });

//Routes

import userRoute from "./routes/user.route.js";

app.use("/api/v1/user", userRoute);

export { app };
