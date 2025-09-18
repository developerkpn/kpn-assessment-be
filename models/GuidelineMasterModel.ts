import { TRANSACTION } from "@/config/transaction.js";
import { ClientAction, deleteQuery, insertQuery, updateQuery } from "@/helper/queryBuilder.js";
import fs from "fs";
import fspromise from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v7 as uuid } from "uuid";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const GuidelineMasterModel = {
  GetGuideline: async ({ is_all }: { is_all: boolean }) => {
    return await ClientAction(async (client) => {
      try {
        let where = "";
        if (!is_all) {
          where = " where selected = true";
        }
        const query = `
          select * from mst_guideline${where} order by selected desc ;
        `;
        const { rows } = await client.query(query);
        return rows;
      } catch (error) {
        throw error;
      }
    });
  },
  GetFileGuideline: async (file_id: string) => {
    return await ClientAction(async (client) => {
      try {
        const { rows, rowCount } = await client.query(`select guideline_name from mst_guideline where uid = $1`, [
          file_id,
        ]);
        if (!rowCount) {
          throw new Error("File not found");
        }
        const file_name = rows[0].guideline_name;
        const guideline_path = path.resolve(path.join(__dirname, "../uploads/guideline", file_name));
        return guideline_path;
      } catch (error) {
        throw error;
      }
    });
  },
  GetDefaultFileGuideline: async () => {
    return await ClientAction(async (client) => {
      try {
        const { rows } = await client.query(`select guideline_name from mst_guideline where selected = true`);
        const file_name = rows[0].guideline_name;
        const file = path.join(path.resolve(__dirname, `../uploads/guideline`), file_name);
        return file;
      } catch (error) {
        throw error;
      }
    });
  },
  UploadGuideline: async ({
    file,
    filename,
    user_id,
  }: {
    file: NodeJS.ArrayBufferView;
    filename: string;
    user_id: string;
  }) => {
    return await ClientAction(async (client) => {
      try {
        const dirguideline = path.join(path.resolve(__dirname), "../uploads/guideline");
        if (!fs.existsSync(dirguideline)) {
          fs.mkdirSync(dirguideline);
        }
        const today = new Date();
        const uid = uuid();
        await client.query(TRANSACTION.BEGIN);
        let insertParam = {
          uid: uid,
          guideline_name: filename,
          create_at: today,
          create_by: user_id,
        };
        const [insque, insval] = insertQuery("mst_guideline", insertParam);
        const { rows } = await client.query(insque, insval);
        //write file
        await fspromise.writeFile(dirguideline + "/" + filename, file);
        await client.query(TRANSACTION.COMMIT);
        return {
          uid: uid,
          guideline_name: filename,
        };
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },
  SelectGuideline: async ({ id_file }: { id_file: string }) => {
    return await ClientAction(async (client) => {
      try {
        await client.query(TRANSACTION.BEGIN);
        //deselect selected
        const [deselque, deselval] = updateQuery("mst_guideline", { selected: false }, { selected: true });
        const { rows: desel } = await client.query(deselque, deselval);
        const update_select = {
          selected: true,
        };
        const [upque, upval] = updateQuery("mst_guideline", update_select, { uid: id_file }, "guideline_name");
        const { rows } = await client.query(upque, upval);
        await client.query(TRANSACTION.COMMIT);
        return { guideline_name: rows[0].guideline_name };
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },
  DeleteGuideline: async ({ id_file }: { id_file: string }) => {
    return await ClientAction(async (client) => {
      try {
        await client.query(TRANSACTION.BEGIN);
        const dirguideline = path.join(__dirname, "../uploads/guideline/");
        const { rows } = await client.query("delete from mst_guideline where uid = $1 returning guideline_name", [
          id_file,
        ]);
        // unlink file
        if (fs.existsSync(path.join(dirguideline + rows[0].guideline_name))) {
          fs.unlinkSync(path.join(dirguideline + rows[0].guideline_name));
        }
        //set random file

        await client.query(TRANSACTION.COMMIT);
        return { guideline_name: rows[0].guideline_name };
      } catch (error) {
        await client.query(TRANSACTION.ROLLBACK);
        throw error;
      }
    });
  },
};

export default GuidelineMasterModel;
