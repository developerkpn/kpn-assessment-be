import { NextFunction, Request, Response } from "express";
import { v7 as uuid } from "uuid";
import { Validation } from "#dep/validation/Validation";
import { BatchValidation } from "#dep/validation/BatchValidation";
import * as XLSX from "xlsx";
import {
  addAssessee,
  createBatch,
  deleteBatch,
  deleteBatchAssessee,
  deleteEmailCC,
  getAssesseeByDarwinNIK,
  getBatch,
  getBatchAssesses,
  getBatchCCEmail,
  getBatchCode,
  getBatchDetail,
  getUserEmailByRole,
  publishBatch,
  startProgress,
  storeEmailCC,
  updateBatch,
} from "#dep/models/BatchModel";
import fs from "fs";
import { AdminWebValidation } from "#dep/validation/AdminWebValidation";
import { BatchAssessee, BatchHeader, BatchHeadUpdate } from "#dep/types/BatchTypes";
import {
  handleGenerateEmailTemplate,
  handleSendCCEmail,
  handleSendEmail,
} from "#dep/controllers/EmailTemplateController";
import { ResponseError } from "#dep/error/response-error";
import { Secret, sign } from "jsonwebtoken";
import { emailTemplateHTML } from "#dep/helper/email/emailnotifmgrprc";
// import { getTestFromChoosenGroupTest} from "#dep/models/GroupTestModel";
import moment from "moment";
import axios from "axios";
import { axiosDarwin } from "#dep/config/axiosDarwin";
export const handleCreateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(BatchValidation.CREATE, req.body);

    console.log("date");
    console.log(validatedRequest.end_period);
    console.log(moment(validatedRequest.end_period).toISOString());

    const payload: any = {
      ...validatedRequest,
      start_period: moment(validatedRequest.start_period).toISOString(),
      end_period: moment(validatedRequest.end_period).toISOString(),
    };

    console.log(payload);

    const batch: BatchHeader = {
      id: uuid(),
      created_by: req.userDecode!.user_id,
      created_at: new Date(),
      ...payload,
    };

    const result = await createBatch(batch);

    res.status(201).send({
      message: `Batch with code ${result} is created successfully!`,
      data: {
        id: batch.id,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getBatch();

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(BatchValidation.UPDATE, req.body);
    const batchUpdate: BatchHeadUpdate = {
      id: validatedId,
      updated_by: req.userDecode?.user_id,
      updated_at: new Date(),
      ...validatedRequest,
    };
    const result = await updateBatch(validatedId, batchUpdate);

    res.status(201).send({
      message: `Batch with code ${result} is updated successfully!`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

    const result = await deleteBatch(validatedId);

    res.status(200).send({
      message: `Batch with code ${result} is deleted successfully`,
    });
  } catch (e) {
    next(e);
  }
};

export const handleAddAssesseeManually = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
    const validatedRequest = Validation.validate(BatchValidation.ADDASSESSEEMANUALLY, req.body);

    const assessee = validatedRequest.map((row: any) => {
      const result = {
        id: uuid(),
        batch_id: validatedId,
        assessee_nik: row.assessee_nik,
        assessee_name: row.assessee_name,
        assessee_email: row.assessee_email,
      };
      return result;
    });

    console.log(assessee);

    await addAssessee(assessee);

    res.status(201).send({
      message: "Assessee is successfully added!",
    });
  } catch (e) {
    next(e);
  }
};

// export const handleAddInternalAssesseeManually = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
//     const validatedRequest = Validation.validate(BatchValidation.ADDASSESSEEINTERNALMANUALLY, req.body);
//
//     const { assessee } = await getAssesseeByDarwinNIK(validatedRequest.assessee_nik);
//     console.log(assessee);
//
//     await addAssessee(assessee);
//
//     res.status(201).send({
//       message: "Assessee is successfully added!",
//       data: assessee,
//     });
//   } catch (e) {
//     next(e);
//   }
// };

export const handleGetBatchDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

    const result = await getBatchDetail(validatedId);
    console.log(result);
    res.status(200).send({
      message: `Success!`,
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchAssessees = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

    const result = await getBatchAssesses(validatedId);

    res.status(200).send({
      message: "Success!",
      data: result,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteBatchAssessee = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedBatchId = Validation.validate(BatchValidation.ID, req.params.id);
    const validateAssesseeId = Validation.validate(BatchValidation.ID, req.params.assesseeId);
    console.log("halo");
    await deleteBatchAssessee(validatedBatchId, validateAssesseeId);
    console.log("halo 2");
    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

// export const handleAddAssesseeByFile = async (req: Request, res: Response, next: NextFunction) => {
//   if (!req.file) {
//     res.status(400).send("File tidak ditemukan.");
//
//   try {
//     const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
//     const workbook = XLSX.read(req.file!.buffer, { type: "buffer" });
//     const firstSheetName = workbook.SheetNames[0];
//     const worksheet = workbook.Sheets[firstSheetName];
//
//     // Convert sheet to JSON
//     const jsonData = XLSX.utils.sheet_to_json(worksheet, {
//       defval: null,
//       raw: false,
//     });
//
//     console.log("masuk payload");
//
//     // Prepare payload for API request
//     const payload = {
//       api_key: process.env.API_KEY,
//       datasetKey: process.env.DATASET_KEY,
//       limit: "1000",
//       employee_ids: jsonData.map((row: any) => `${row.NIK}`),
//     };
//
//     console.log(payload);
//     console.log("keluar payload");
//
//     // Prepare Basic Auth
//     const username = process.env.BASIC_AUTH_USERNAME || "no";
//     const password = process.env.BASIC_AUTH_PASSWORD || "no";
//     const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
//
//     // Fetch employee data from API
//     const getAssessee = await axios.post(`${process.env.DARWIN_BASE_URL}`, payload, {
//       headers: {
//         Authorization: `Basic ${basicAuth}`,
//         "Content-Type": "application/json",
//       },
//     });
//
//     console.log("fetch berhasil");
//     console.log(getAssessee);
//     console.log(getAssessee.data.employee_data);
//
//     // Create a map of found employee IDs for quick lookup
//     const foundEmployees = new Map(getAssessee.data.employee_data.map((emp: any) => [emp.employee_id, emp]));
//
//     // Process each row and update status
//     const processedData = jsonData.map((row: any) => {
//       const employee: any = foundEmployees.get(row.NIK);
//
//       if (employee) {
//         return {
//           ...row,
//           Status: "Success",
//           Name: employee.full_name,
//           Email: employee.company_email_id,
//         };
//       } else {
//         return {
//           ...row,
//           Status: "Failed",
//           Name: null,
//           Email: null,
//         };
//       }
//     });
//
//     // Prepare data for database insertion
//     const assesseeData = processedData
//       .filter((row: any) => row.Status === "Success")
//       .map((row: any) => ({
//         id: uuid(),
//         batch_id: validatedId,
//         assessee_nik: row.NIK,
//         assessee_name: row.Name,
//         assessee_email: row.Email,
//       }));

// // Validate and add assessees to database
// if (assesseeData.length > 0) {
//   const validatedAssessee = Validation.validate(BatchValidation.ASSESSEE, assesseeData);
//   await addAssessee(validatedAssessee);
// }
//
// // Prepare workbook for response
// const updatedWorksheet = XLSX.utils.json_to_sheet(processedData);
// const updatedWorkbook = XLSX.utils.book_new();
// XLSX.utils.book_append_sheet(updatedWorkbook, updatedWorksheet, "Assessees");
//
// // Set response headers for Excel file download
// res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
// res.setHeader("Content-Disposition", "attachment; filename=processed_assessees.xlsx");
//
// // Convert workbook to buffer and send
// const excelBuffer = XLSX.write(updatedWorkbook, { type: "buffer", bookType: "xlsx" });
// res.send(excelBuffer);
//
//     res.status(200).send({
//       message: "Success!",
//     });
//   } catch (e) {
//     next(e);
//   }
// };

export const handlePreviewBatchTemplateEmail = async (req: Request, res: Response, next: NextFunction) => {
  console.log("ini dia");
  console.log(req.body);
  try {
    const template = emailTemplateHTML;
    res.status(200).send({
      message: "Success!",
      template: template,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

export const handleCreateBatchToken = async (batchId: string, startPeriod: any, endPeriod: any, userId: string) => {
  try {
    const batchTokenPayload = {
      user_id: userId,
      batch_id: batchId,
      start_period: startPeriod,
      end_period: endPeriod,
    };

    const token = sign(batchTokenPayload, process.env.SECRETJWT as Secret);

    return token;
  } catch (e) {
    throw e;
  }
};

export const handlePublishBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
    const batchDetails: any = await getBatchDetail(validatedId);
    const batchDetail = batchDetails.batch;
    const assesseeList = await getBatchAssesses(validatedId);
    console.log(batchDetail);
    console.log(batchDetail.status);
    if (batchDetail.status !== "Draft") {
      throw new ResponseError(400, "Batch's already submitted");
    }

    const progressHead = await Promise.all(
      assesseeList.map(async (assessee) => {
        const token = await handleCreateBatchToken(
          validatedId,
          batchDetail.start_period,
          batchDetail.end_period,
          assessee.assessee_nik
        );

        await handleSendEmail(validatedId, token, assessee.assessee_email);
        return {
          id: uuid(),
          assessee_id: assessee.assessee_nik,
          batch_id: batchDetail.id,
          token: token,
        };
      })
    );

    console.log("check progress head");
    await startProgress(progressHead);

    const emailCCList: any = await getBatchCCEmail(validatedId);

    console.log("Berhasil masuk");
    console.log(emailCCList);
    await Promise.all(emailCCList.map((email: any) => handleSendCCEmail(validatedId, email.cc_email)));
    console.log("send response");
    res.status(200).send({
      message: "Batch is successfully published and email's sent to assessee",
    });
  } catch (e) {
    next(e);
  }
};

export const handleAddCCEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { roles = [], emails = [] } = req.body;
    const batch_id = req.params.id;

    if (!batch_id) {
      res.status(400).json({ message: "Batch ID diperlukan" });
    }

    // Data yang akan disimpan
    let ccEmails: Array<{ id: string; batch_id: string; role_id: string | null; cc_email: string }> = [];

    // Proses roles jika ada
    if (roles && roles.length > 0) {
      // Dapatkan email berdasarkan role_id
      for (const role of roles) {
        const userEmails = await getUserEmailByRole(role.role_id);

        if (userEmails && userEmails.length > 0) {
          // Tambahkan email dari role ke array
          userEmails.forEach((user) => {
            ccEmails.push({
              id: uuid(),
              batch_id,
              role_id: role.role_id,
              cc_email: user.email,
            });
          });
        }
      }
    }

    // Proses email manual jika ada
    if (emails && emails.length > 0) {
      // Tambahkan email manual ke array
      emails.forEach((item: any) => {
        ccEmails.push({
          id: uuid(),
          batch_id,
          role_id: null, // Null karena dimasukkan manual
          cc_email: item.cc_email,
        });
      });
    }

    // Jika tidak ada data yang akan disimpan
    if (ccEmails.length === 0) {
      res.status(400).json({ message: "Tidak ada email yang akan disimpan" });
    }

    // Simpan ke database
    await storeEmailCC(ccEmails);

    res.status(200).json({
      message: "Success!",
      data: ccEmails,
    });
  } catch (e) {
    next(e);
  }
};

export const handleDeleteCCEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.params.batchId;
    const id = req.params.id;
    await deleteEmailCC(batchId, id);

    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const getInternalAssesseeData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("masuk oy");
    console.log("testing1");
    console.log(req.file);
    let assesseeData = null;
    let invalidAssesse = null;
    if (req.body.assessee_nik) {
      const assesseeNIK = String(req.body.assessee_nik);
      console.log(assesseeNIK);
      assesseeData = await getAssesseeByDarwinNIK(assesseeNIK);
    } else if (req.file) {
      console.log("Processing uploaded file");

      // Read the uploaded Excel file
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Extract NIKs from the file
      const nikList: any = jsonData
        .map((row: any) => {
          // Check if assessee_nik exists in the row
          if (!row.assessee_nik) {
            console.warn("Row missing assessee_nik:", row);
            return null;
          }
          return String(row.assessee_nik); // Convert to string to ensure consistency
        })
        .filter(Boolean); // Remove null values

      if (nikList.length === 0) {
        res.status(400).send({
          message: "No valid NIKs found in the uploaded file",
        });
      }

      console.log("NIKs from file:", nikList);
      // [
      //   '01122110013',
      //   '01122110013',
      //   '01120020025',
      //   '01123010012',
      //   '01123010014'
      // ]

      // Buat jadi set biar arraynya menyimpan data-data yang unik
      // Process the extracted NIKs
      assesseeData = await getAssesseeByDarwinNIK(nikList);
      console.log(assesseeData);

      // Create a Set to store unique NIKs
      const uniqueNiks: any = [...new Set(nikList)];
      console.log("Unique NIKs:", uniqueNiks);

      // Get data from Darwin API
      assesseeData = await getAssesseeByDarwinNIK(uniqueNiks);

      // Find invalid NIKs (those in the file but not returned from Darwin)
      // Make sure we're comparing against the correct property from assesseeData
      const validNikSet = new Set(assesseeData.map((assessee: any) => assessee.assessee_nik));

      invalidAssesse = uniqueNiks
        .filter((nik: any) => !validNikSet.has(nik))
        .map((nik: any) => ({ assessee_nik: nik, reason: "NIK not found in Darwin system" }));
    } else {
      // Handle when neither condition is met
      throw new ResponseError(400, "No assessee_nik provided and no file uploaded");
    }

    res.status(200).send({
      message: "Success!",
      data: {
        valid_assessee: assesseeData,
        invalid_assessee: invalidAssesse,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("test");
    const payload = req.body;
    const tmCode = payload.tm_code;
    const buCode = payload.bu_code;

    const month = moment().format("MMM").toUpperCase();
    const year = moment().format("YYYY");

    const checkIfCodeIsExist = await getBatchCode(tmCode, buCode, month, year);

    console.log("keluar");
    let currentBatch;
    if (checkIfCodeIsExist?.batch != null) {
      currentBatch = checkIfCodeIsExist.batch + 1;
    } else {
      currentBatch = 1;
    }

    const currentCode = `${tmCode}/${buCode}/${month}/${year}/${currentBatch}`;

    res.status(200).send({
      message: "Success!",
      data: {
        batch_code: currentCode,
      },
    });
  } catch (e) {
    next(e);
  }
};
