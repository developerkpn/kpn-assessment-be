import axios from "axios";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
dotenv.config({ path: path.resolve(__dirname, `../${process.env.NODE_ENV}.env`) });
export const axiosDarwin = axios.create({
  baseURL: process.env.DARWIN_BASE_URL,
  auth: {
    username: process.env.BASIC_AUTH_USERNAME || "",
    password: process.env.BASIC_AUTH_PASSWORD || "",
  },
});

export const darwinAuth = axios.create({
  baseURL: process.env.DARWINHOST,
  auth: {
    username: process.env.DARWINUSER || "",
    password: process.env.DARWINPASS || "",
  },
});
