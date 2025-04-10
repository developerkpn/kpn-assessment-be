import { db } from "#dep/config/connection";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";
import S3ClientUpload from "#dep/helper/S3UploadClass";
import fs from "fs";
import path from "path";
import moment from "moment";

const ProctoringModel = {
  checkS3Storage: async () => {
    const client = new S3Client({
      region: "ap-southeast-1",
      credentials: { accessKeyId: process.env.ACCESS_KEY_S3 ?? "", secretAccessKey: process.env.SECRET_S3 ?? "" },
    });
    try {
      const listBuckCommand = new ListBucketsCommand();
      const result = await client.send(listBuckCommand);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  UploadFile: async (batch_id: string, user_id: string, subtest_id: string, image: File | Buffer, filename: string) => {
    try {
      const ClientUpload = new S3ClientUpload();
      const unix_tmstp = moment().unix();
      const result = await ClientUpload.UploadFile(
        `${batch_id}/${user_id}/${subtest_id}/${unix_tmstp}_${filename}.png`,
        image
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  GetFile: async (path: string) => {
    try {
      const clientS3 = new S3ClientUpload();
      const stream_file = await clientS3.GetObject(path);
      return stream_file;
    } catch (error) {
      throw error;
    }
  },
};

export default ProctoringModel;
