import axios from "axios";

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
