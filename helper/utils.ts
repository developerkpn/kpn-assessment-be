import fs from "fs";
import path from "path";
import archiver from "archiver";
import zlib from "node:zlib";

const Utils = {
  ZipFile: async (directory: string, zipname: string, files?: string[]): Promise<string> => {
    const outputPath = path.join(process.cwd(), "uploads", zipname);

    if (files && files.length === 0) {
      throw new Error("No report files to archive");
    }

    const output = fs.createWriteStream(outputPath);
    const archive = archiver("zip", {
      zlib: { flush: zlib.constants.Z_FULL_FLUSH, level: zlib.constants.Z_BEST_SPEED },
    });

    // Selesai baru setelah output stream benar-benar tertutup. Kalau hanya menunggu
    // finalize(), file zip bisa belum ter-flush saat dibaca -> unduhan kosong/terpotong.
    const closed = new Promise<void>((resolve, reject) => {
      output.on("close", () => {
        console.log(`✅ Archive ${zipname} created (${archive.pointer()} bytes)`);
        resolve();
      });
      output.on("error", reject);
      archive.on("error", reject);
      archive.on("warning", (err) => {
        if (err.code === "ENOENT") console.warn("⚠️ Warning:", err);
        else reject(err);
      });
    });

    archive.pipe(output);
    if (!files) {
      archive.directory(directory, false);
    } else {
      for (const file of files) {
        archive.file(path.join(directory, file), { name: file });
      }
    }
    await archive.finalize();
    await closed;
    return outputPath;
  },
};

export default Utils;
