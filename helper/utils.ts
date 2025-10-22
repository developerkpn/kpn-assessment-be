import fs from "fs";
import path from "path";
import archiver from "archiver";
import zlib from "node:zlib";

const Utils = {
  ZipFile: async (directory: string, zipname: string, files?: string[]): Promise<string> => {
    try {
      const outputPath = path.join(process.cwd(), "uploads", zipname);

      const output = fs.createWriteStream(outputPath);
      const archive = archiver("zip", {
        zlib: { flush: zlib.constants.Z_FULL_FLUSH, level: zlib.constants.Z_BEST_SPEED },
      });

      output.on("close", () => {
        console.log(`✅ Archive ${zipname} created (${archive.pointer()} bytes)`);
        // resolve(outputPath);
      });

      output.on("error", (err) => {
        console.error("❌ Output stream error:", err);
        throw err;
      });

      archive.on("finish", () => {
        console.log("finish");
      });

      archive.on("warning", (err) => {
        if (err.code === "ENOENT") console.warn("⚠️ Warning:", err);
        else {
          console.error("❌ Archiver warning:", err);
          throw err;
        }
      });

      archive.on("error", (err) => {
        // process.exit();
        console.error("❌ Archiver error:", err);
        throw err;
      });

      archive.pipe(output);
      if(!files) {
        archive.directory(directory, false);
      }
      else {
        for(const file of files) {
          archive.file(path.join(directory, file), {name : file})
        }
      }
      await archive.finalize();
      return outputPath;
    } catch (error) {
      throw error;
    }

    // finalize() returns a promise only in modern archiver versions
    // setTimeout(() => {
    // }, 10000);
  },
};

export default Utils;
