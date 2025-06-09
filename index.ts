import express from "express";
import dotenv from "dotenv";

import os from "os";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: path.resolve(__dirname, `./${process.env.NODE_ENV}.env`) });
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import whitelist from "@/config/allowedOrigins.js";
import credentials from "@/middleware/credential.js";
import router from "./routes/index.js";
import { errorMiddleware } from "@/middleware/errorMiddleware.js";
const app = express();
// const servOption = {
//   cert: fs.readFileSync("./ssl/cert.pem"),
//   key: fs.readFileSync("./ssl/key.pem"),
// };

const corsOption: CorsOptions = {
  origin: function (req, callback) {
    if (req && whitelist.indexOf(req) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE", "PATCH"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};

app.use(cors(corsOption));

app.use("/api/static", express.static("uploads"));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/static")) {
    return res.status(404).sendFile(path.join(__dirname, "uploads", "404.html"));
  }
  next();
});

app.use(credentials);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(router);
app.use(errorMiddleware);
app.use(express.static(path.join(__dirname, "public/build")));
app.get("/*$", (req, res) => {
  res.sendFile(path.join(__dirname, "public/build", "index.html"));
});
app.use(errorMiddleware);

// app.listen(process.env.PORT as unknown as number, "0.0.0.0", () => {
//   console.log(`App running on ${process.env.PORT}`);
// });

// const server = https.createServer(servOption, app).listen(process.env.PORT, () => {
//   console.log(`App running on ${process.env.PORT}`);
// });

app.listen(process.env.PORT as unknown as number, "0.0.0.0", () => {
  console.log(`App running on http://localhost:${process.env.PORT}`);
});
