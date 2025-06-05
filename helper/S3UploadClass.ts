import {
  S3Client,
  ListBucketsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  S3,
  CreateMultipartUploadCommandOutput,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

class S3ClientUpload {
  Client: S3Client;

  constructor() {
    this.Client = new S3Client({
      region: "ap-southeast-1",
      credentials: { accessKeyId: process.env.ACCESS_KEY_S3 ?? "", secretAccessKey: process.env.SECRET_S3 ?? "" },
    });
  }

  async UploadFile(path: string, file: File | Buffer) {
    try {
      const MultiPartConn_cmd = new CreateMultipartUploadCommand({
        Bucket: "kpnapps-assessment",
        Key: path,
      });
      const MultiPartConn = await this.Client.send(MultiPartConn_cmd);
      const UploadPart_cmd = new UploadPartCommand({
        Bucket: "kpnapps-assessment",
        UploadId: MultiPartConn.UploadId,
        Key: path,
        PartNumber: 1,
        Body: file,
        ChecksumAlgorithm: "SHA256",
      });
      const UploadPrt = await this.Client.send(UploadPart_cmd);
      const CompleteUpload_cmd = new CompleteMultipartUploadCommand({
        UploadId: MultiPartConn.UploadId,
        Key: path,
        Bucket: "kpnapps-assessment",
        MultipartUpload: {
          Parts: [
            {
              ETag: UploadPrt.ETag,
              PartNumber: 1,
            },
          ],
        },
      });
      const CompleteUpload = await this.Client.send(CompleteUpload_cmd);
      return CompleteUpload;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async GetObject(path: string) {
    try {
      const GetObject_cmd = new GetObjectCommand({
        Bucket: "kpnapps-assessment",
        Key: path,
      });
      const GetObj = await this.Client.send(GetObject_cmd);
      console.log(GetObj);
      return { stream: GetObj.Body as Readable, filename: path.split("/").slice(-1) };
    } catch (error) {
      throw error;
    }
  }
  async ListObjects(prefix: string = "") {
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: "kpnapps-assessment",
        Prefix: prefix, // opsional, bisa kosong untuk ambil semua
      });

      const response = await this.Client.send(listCommand);

      const contents = response.Contents || [];

      return contents.map((item) => ({
        key: item.Key,
        lastModified: item.LastModified,
        // size: item.Size,
        // storageClass: item.StorageClass,
      }));
    } catch (error) {
      console.error("Error listing S3 objects:", error);
      throw error;
    }
  }
}

export default S3ClientUpload;
