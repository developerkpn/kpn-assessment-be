import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder foto profil dicari dari cwd dan dari lokasi modul, supaya sama-sama
// ketemu saat dev (tsx dari root project) maupun di container (WORKDIR /app).
const PHOTO_DIRS = [
  path.join(process.cwd(), "uploads", "profile_photos"),
  path.resolve(__dirname, "../uploads/profile_photos"),
];

// Upload menyimpan file dengan ekstensi aslinya, jadi keduanya dicoba.
const PHOTO_EXTS = [".jpg", ".jpeg"];

/**
 * Baca foto profil assessee (internal: employee_id, eksternal: id mst_user_extern).
 * Mengembalikan null kalau tidak ada, supaya pemanggil bisa pakai placeholder.
 */
export const readProfilePhoto = async (assesseeId?: string | null): Promise<Buffer | null> => {
  if (!assesseeId) return null;
  for (const dir of PHOTO_DIRS) {
    for (const ext of PHOTO_EXTS) {
      try {
        return await fs.promises.readFile(path.join(dir, `${assesseeId}${ext}`));
      } catch {
        // coba kandidat berikutnya
      }
    }
  }
  return null;
};

/** Path foto profil yang ada beserta mtime-nya, untuk cek kesegaran cache PDF. */
export const findProfilePhotoMtime = (assesseeId?: string | null): Date | null => {
  if (!assesseeId) return null;
  let latest: Date | null = null;
  for (const dir of PHOTO_DIRS) {
    for (const ext of PHOTO_EXTS) {
      const file = path.join(dir, `${assesseeId}${ext}`);
      if (fs.existsSync(file)) {
        const mtime = fs.statSync(file).mtime;
        if (!latest || mtime > latest) latest = mtime;
      }
    }
  }
  return latest;
};
