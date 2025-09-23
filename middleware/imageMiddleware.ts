import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Profile photos directory path - go up from middleware to project root
const profilePhotosDir = path.join(__dirname, "../uploads", "profile_photos");

// Storage configuration for profile photos
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, callback) => {
    // Ensure directory exists right before multer needs it
    if (!fs.existsSync(profilePhotosDir)) {
      fs.mkdirSync(profilePhotosDir, { recursive: true });
      console.log("Created profile photos directory");
    }
    callback(null, profilePhotosDir);
  },
  filename: (_req: Request, file: Express.Multer.File, callback) => {
    // Generate a temporary filename first, we'll rename it after getting user_id
    const ext = path.extname(file.originalname);
    const tempName = `temp_${Date.now()}${ext}`;
    callback(null, tempName);
  }
});

// Allowed image MIME types and extensions - only JPG since camera always produces JPG
const allowedMimeTypes = [
  "image/jpeg",
  "image/jpg"
];

const allowedExtensions = [".jpg", ".jpeg"];

// File filter for images
const fileFilter = (_req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  // Validate MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."));
  }

  // Validate file extension
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return callback(new Error("Invalid file extension. Only JPEG, PNG, and WebP images are allowed."));
  }

  callback(null, true);
};

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB limit for images
    files: 1 // Only one file allowed
  },
  fileFilter,
});

// Middleware for single image upload
export const uploadSingleImage = imageUpload.single("profile_photo");