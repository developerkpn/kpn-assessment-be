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
  getFMandBUCode,
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

export const handleCreateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(BatchValidation.CREATE, req.body);
    console.log(validatedRequest);
    // Batch Head
    const batchId = uuid();
    const date = new Date();
    const month = moment().format("MMM").toUpperCase();
    const year = moment().format("YYYY");

    // Generate Batch Code
    const code = await getFMandBUCode(validatedRequest.function_id, validatedRequest.bu_id);
    console.log(code);
    const checkIfCodeIsExist = await getBatchCode(code.fmCode, code.buCode, month, year);
    console.log("keluar");
    let currentBatch;
    if (checkIfCodeIsExist?.batch != null) {
      currentBatch = checkIfCodeIsExist.batch + 1;
    } else {
      currentBatch = 1;
    }

    const currentCode = `${code.fmCode}/${code.buCode}/${month}/${year}/${currentBatch}`;

    const batchCode = {
      id: uuid(),
      tm_code: code.fmCode,
      bu_code: code.buCode,
      month: month,
      year: year,
      batch: currentBatch,
      taken_at: date,
    };

    // Create Batch
    const batchHeadPayload: any = {
      id: batchId,
      batch_name: validatedRequest.batch_name,
      grouptest_id: validatedRequest.grouptest_id,
      bu_id: validatedRequest.bu_id,
      function_id: validatedRequest.function_id,
      template_email_id: validatedRequest.template_email_id,
      is_mic: validatedRequest.is_mic,
      is_screenshot: validatedRequest.is_screenshot,
      note: validatedRequest.note,
      description: validatedRequest.description,
      type: validatedRequest.type,
      // is_published: validatedRequest.is_published,
      batch_code: currentCode,
      start_period: moment(validatedRequest.start_period).toISOString(),
      end_period: moment(validatedRequest.end_period).toISOString(),
      created_by: req.userDecode!.user_id,
      created_at: new Date(),
    };

    // Batch CC Email
    console.log(validatedRequest);
    const ccEmailData = validatedRequest.cc_email;
    let ccEmails: Array<{ id: string; batch_id: string; role_id: string | null; cc_email: string }> = [];
    console.log(ccEmailData);
    // Proses roles jika ada
    if (ccEmailData.roles && ccEmailData.roles.length > 0) {
      // Dapatkan email berdasarkan role_id
      for (const role of ccEmailData.roles) {
        const userEmails = await getUserEmailByRole(role.role_id);

        if (userEmails && userEmails.length > 0) {
          // Tambahkan email dari role ke array
          userEmails.forEach((user) => {
            ccEmails.push({
              id: uuid(),
              batch_id: batchId,
              role_id: role.role_id,
              cc_email: user.email,
            });
          });
        }
      }
    }

    // Proses email manual jika ada
    if (ccEmailData.emails && ccEmailData.emails.length > 0) {
      // Tambahkan email manual ke array
      ccEmailData.emails.forEach((item: any) => {
        ccEmails.push({
          id: uuid(),
          batch_id: batchId,
          role_id: null, // Null karena dimasukkan manual
          cc_email: item.cc_email,
        });
      });
    }

    // Jika tidak ada data yang akan disimpan
    if (ccEmails.length === 0) {
      res.status(400).json({ message: "Tidak ada email yang akan disimpan" });
    }

    //Batch Asssessee
    const batchAssessee = validatedRequest.assessees;
    const assessee = batchAssessee.map((row: any) => {
      const result = {
        id: uuid(),
        batch_id: batchId,
        assessee_nik: row.assessee_nik,
        assessee_name: row.assessee_name,
        assessee_email: row.assessee_email,
      };
      return result;
    });

    await createBatch(batchHeadPayload, batchCode, ccEmails, assessee);

    res.status(201).send({
      message: `Success!`,
      data: {
        batch_code: currentCode,
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

    const batchStatus: any = await getBatchDetail(validatedId);

    if (batchStatus.status === "Published") {
      throw new ResponseError(400, "This batch is already published!");
    }

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

    res.status(200).send({
      message: "Success!",
      data: {
        batch_code: "",
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleReadAssesseeFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Initialize response data
    let validAssessee: any[] = [];
    let invalidAssessee: any[] = [];

    if (req.file) {
      // Read the uploaded Excel file
      const workbook = XLSX.read(req.file?.buffer, { type: "buffer" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        res.status(400).send({
          message: "No data found in the uploaded file",
        });
      }

      // Track unique emails to identify duplicates
      const uniqueEmails = new Set<string>();

      // Process each row in the file
      jsonData.forEach((row: any) => {
        const assessee = {
          assessee_name: row.assessee_name || null,
          assessee_email: row.assessee_email || null,
        };

        // Validate required fields
        const validationErrors: string[] = [];
        if (!assessee.assessee_name) validationErrors.push("Missing name");
        if (!assessee.assessee_email) validationErrors.push("Missing email");

        // Check for email uniqueness
        if (assessee.assessee_email) {
          if (uniqueEmails.has(assessee.assessee_email)) {
            validationErrors.push("Duplicate email");
          }
        }

        // If there are validation errors, add to invalid list
        if (validationErrors.length > 0) {
          invalidAssessee.push({
            ...assessee,
            reason: validationErrors.join(", "),
          });
        } else {
          // Add to valid list and update tracking set
          validAssessee.push(assessee);
          if (assessee.assessee_email) uniqueEmails.add(assessee.assessee_email);
        }
      });

      console.log(`Found ${validAssessee.length} valid assessees and ${invalidAssessee.length} invalid assessees`);
    } else {
      res.status(400).send({
        message: "No file uploaded",
      });
    }

    res.status(200).send({
      message: "Success!",
      data: {
        valid_assessee: validAssessee,
        invalid_assessee: invalidAssessee,
      },
    });
  } catch (e) {
    next(e);
  }
};
