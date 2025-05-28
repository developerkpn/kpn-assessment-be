import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";

// Gunakan memoryStorage karena file tidak disimpan ke disk
const storage = multer.memoryStorage();

// Daftar MIME type dan ekstensi yang diizinkan
const allowedMimeTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
  "application/pdf", // PDF
];
const allowedExtensions = [".xlsx", ".pdf"];

// File filter untuk validasi file yang diunggah
const fileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
  // Validasi MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error("Tipe file tidak valid. Hanya file XLSX dan PDF yang diizinkan."));
  }

  // Validasi ekstensi file
  const ext = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(ext)) {
    return callback(new Error("Ekstensi file tidak valid. Hanya file XLSX dan PDF yang diizinkan."));
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas 5 MB
  fileFilter,
});

// Middleware untuk single file dengan field name "file"
export const uploadSingleFile = upload.single("file");
