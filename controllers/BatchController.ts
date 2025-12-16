import { NextFunction, Request, Response } from "express";
import { v7 as uuid } from "uuid";
import { Validation } from "@/validation/Validation.js";
import { BatchValidation } from "@/validation/BatchValidation.js";
import * as XLSX from "xlsx";
import {
  addAssessee,
  createBatch,
  createBatchTranslation,
  deleteBatch,
  deleteBatchAssessee,
  deleteEmailCC,
  getAssesseeByDarwinNIK,
  getBatch,
  getBatchAssesses,
  getBatchCCEmail,
  getBatchCode,
  getBatchDetail,
  getBatchTranslation,
  getFMandBUCode,
  getLanguagesWithBatchTranslationStatus,
  getUserEmailByRole,
  publishBatch,
  startProgress,
  storeEmailCC,
  updateBatch,
  updateBatchTranslation,
  getDarwinUser,
} from "@/models/BatchModel.js";
import { translateFieldsBatch } from "@/models/TranslationModel.js";
import fs from "fs";
import { AdminWebValidation } from "@/validation/AdminWebValidation.js";
import { BatchAssessee, BatchHeader, BatchHeadUpdate } from "@/types/BatchTypes.js";
import {
  handleGenerateEmailTemplate,
  handleSendCCEmail,
  handleSendEmail,
} from "@/controllers/EmailTemplateController.js";
import { ResponseError } from "@/error/response-error.js";
import jwt, { Secret } from "jsonwebtoken";
const { sign } = jwt;
import { emailTemplateHTML } from "@/helper/email/emailnotifmgrprc.js";
// import { getTestFromChoosenGroupTest} from "@/models/GroupTestModel";
import moment from "moment";
import axios, { AxiosResponse } from "axios";
import { axiosDarwin } from "@/config/axiosDarwin.js";
import { DataEmpDarwin, XLSAssessee } from "@/types/MasterDataTypes.js";
import { ClientAction, insertQuery } from "@/helper/queryBuilder.js";
import { TRANSACTION } from "@/config/transaction.js";
export const handleCreateBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedRequest = Validation.validate(BatchValidation.CREATE, req.body);
    // Batch Head
    const batchId = uuid();
    const date = new Date();
    const month = moment().format("MMM").toUpperCase();
    const year = moment().format("YYYY");

    // Generate Batch Code
    const code = await getFMandBUCode(validatedRequest.function_id, validatedRequest.bu_id);
    const checkIfCodeIsExist = await getBatchCode(code.fmCode, code.buCode, month, year);
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

    const startPeriod = moment(validatedRequest.start_period).tz("Asia/Jakarta").toISOString();
    const endPeriod = moment(validatedRequest.end_period).tz("Asia/Jakarta").toISOString();

    console.log(startPeriod);
    console.log(endPeriod);

    // Handle multi-language descriptions - array structure
    let mainDescription = "";
    let mainLanguageId = "";
    let subLanguageDescriptions: Array<{
      language_id: string;
      description: string;
    }> = [];

    console.log("=== DEBUG: Received description data ===");
    console.log("Description array:", JSON.stringify(validatedRequest.description, null, 2));

    const descriptionArray = validatedRequest.description as Array<{
      language_id: string;
      description: string;
      language_type: "main" | "sub";
    }>;

    // Find main language entry
    const mainEntry = descriptionArray.find((entry: any) => entry.language_type === "main");
    if (mainEntry) {
      mainDescription = mainEntry.description;
      mainLanguageId = mainEntry.language_id;
    }

    // Find sub-language entries
    subLanguageDescriptions = descriptionArray
      .filter((entry: any) => entry.language_type === "sub")
      .map((entry: any) => ({
        language_id: entry.language_id,
        description: entry.description,
      }));

    console.log("Main language description:", mainDescription);
    console.log("Main language ID:", mainLanguageId);
    console.log("Sub-language descriptions:", JSON.stringify(subLanguageDescriptions, null, 2));
    console.log("Sub-language count:", subLanguageDescriptions.length);

    const batchHeadPayload: any = {
      id: batchId,
      batch_name: validatedRequest.batch_name,
      grouptest_id: validatedRequest.grouptest_id,
      bu_id: validatedRequest.bu_id,
      function_id: validatedRequest.function_id,
      template_email_id: validatedRequest.template_email_id,
      is_mic: validatedRequest.is_mic ?? false,
      is_screenshot: validatedRequest.is_screenshot ?? false,
      note: validatedRequest.note,
      description: mainDescription, // Use main language description for the main table
      language_id: mainLanguageId || null, // Add main language ID to the main table
      type: validatedRequest.type,
      // is_published: validatedRequest.is_published,
      batch_code: currentCode,
      start_period: startPeriod,
      end_period: endPeriod,
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
          userEmails.forEach((user: any) => {
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
      return;
    }

    //Batch Asssessee
    const batchAssessee = validatedRequest.assessees;
    let assessee = [];
    if (validatedRequest.type == "internal") {
      assessee = batchAssessee.map((row: any) => {
        const assesseeId = uuid();
        const result = {
          id: assesseeId,
          batch_id: batchId,
          assessee_nik: row.assessee_nik ? row.assessee_nik : assesseeId,
          assessee_name: row.assessee_name,
          assessee_email: row.assessee_email,
        };
        return result;
      });
    } else {
      const emails = batchAssessee.map((value: any) => value.assessee_email.trim());
      const emailq = emails.join(`','`);
      const result_email = await ClientAction<Map<string, any>>(async (client) => {
        try {
          const { rows } = await client.query(`select email, id from mst_user_extern where email in ('${emailq}')`);
          const map_emails = new Map(rows.map((value: any) => [value.email, value]));
          return map_emails;
        } catch (error) {
          throw new ResponseError(400, "Error");
        }
      });
      const result_assessee = await ClientAction<any>(async (client) => {
        let assessee_ext = [];
        try {
          await client.query(TRANSACTION.BEGIN);
          for (const ass of batchAssessee) {
            const data_ext = result_email.get(ass.assessee_email);
            const uid = uuid();
            const payload = {
              name: ass.assessee_name,
              email: ass.assessee_email,
              id: uuid(),
            };
            if (!data_ext) {
              const [valIns, queIns] = insertQuery("mst_user_extern", payload);
              await client.query(valIns, queIns);
            }
            assessee_ext.push({
              id: uid,
              batch_id: batchId,
              assessee_nik: data_ext ? data_ext.id : payload.id,
              assessee_name: ass.assessee_name,
              assessee_email: ass.assessee_email,
            });
          }
          await client.query(TRANSACTION.COMMIT);
          return assessee_ext;
        } catch (error) {
          await client.query(TRANSACTION.ROLLBACK);
          throw error;
        }
      });
      assessee = result_assessee;
    }

    await createBatch(batchHeadPayload, batchCode, ccEmails, assessee);

    // Create sub-language translations if any
    if (subLanguageDescriptions.length > 0) {
      console.log("=== DEBUG: Creating translation records ===");
      console.log("Number of translations to create:", subLanguageDescriptions.length);

      for (const subLang of subLanguageDescriptions) {
        console.log(`Creating translation for language_id: ${subLang.language_id}`);
        console.log(`Translation content: ${subLang.description?.substring(0, 100)}...`);

        const translationPayload = {
          batch_id: batchId,
          language_id: subLang.language_id,
          description: subLang.description,
          created_by: req.userDecode?.user_id,
          created_at: new Date(),
          updated_by: req.userDecode?.user_id,
          updated_at: new Date(),
        };

        await createBatchTranslation(translationPayload);
      }
    } else {
      console.log("=== DEBUG: No sub-language translations to create ===");
    }

    res.status(201).send({
      message: `Success!`,
      data: {
        batch_id: batchId,
        start_period: startPeriod,
        end_period: endPeriod,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { published } = req.query;
    const user_id = req.userDecode?.user_id as string;
    const role_name = req.userDecode?.role_name as string;
    let query: { published: boolean } = { published: false };
    if (published) {
      query.published = true;
    }

    const result = await getBatch(query, { role_name, user_id });

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
      throw new ResponseError(400, "Can't be edited. This batch is already published!");
    }

    // Handle language_type for translation support
    const languageType = validatedRequest.language_type;
    const languageId = validatedRequest.language_id;

    let result;
    let message;

    if (languageType === "sub") {
      // Handle sub language - save to translation table
      const translationPayload = {
        batch_id: validatedId,
        language_id: languageId,
        description: validatedRequest.description,
        updated_by: req.userDecode?.user_id,
        updated_at: new Date(),
        created_by: req.userDecode?.user_id,
        created_at: new Date(),
      };

      // Check if translation already exists
      const existingTranslation = await getBatchTranslation(validatedId, languageId);
      if (existingTranslation) {
        // Update existing translation
        result = await updateBatchTranslation(translationPayload, existingTranslation.id);
        message = "Batch translation successfully updated";
      } else {
        // Create new translation
        translationPayload.created_by = req.userDecode?.user_id;
        translationPayload.created_at = new Date();
        result = await createBatchTranslation(translationPayload);
        message = "Batch translation successfully created";
      }

      res.status(200).send({
        message: message,
      });
      return;
    }

    // Original existing logic for all cases (including main language updates and legacy)
    const batchHeadUpdate: any = {
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
      start_period: moment(validatedRequest.start_period).tz("Asia/Jakarta").toISOString(),
      end_period: moment(validatedRequest.end_period).tz("Asia/Jakarta").toISOString(),
      updated_by: req.userDecode?.user_id,
      updated_at: new Date(),
    };

    // Add language_id only if we're in main language mode
    if (languageType === "main") {
      batchHeadUpdate.language_id = languageId;
    }

    const deletedCCEmailByRole =
      validatedRequest.cc_email.roles.deleted_roles && validatedRequest.cc_email.roles.deleted_roles.length > 0
        ? validatedRequest.cc_email.roles.deleted_roles.map((prev: any) => ({
            ...prev,
            batch_id: validatedId,
          }))
        : [];

    console.log("deleted CC Role");
    console.log(deletedCCEmailByRole);

    // const selectedNewCCEmailByRole =
    //   validatedRequest.cc_email.roles.selected_roles && validatedRequest.cc_email.roles.selected_roles.length > 0
    //     ? validatedRequest.cc_email.roles.selected_roles.map((prev: any) => ({
    //         ...prev,
    //         batch_id: validatedId,
    //       }))
    //     : [];

    // Batch CC Email;
    const ccEmailData = validatedRequest.cc_email;
    let ccEmails: Array<{ id: string; batch_id: string; role_id: string | null; cc_email: string }> = [];
    console.log(ccEmailData);
    // Proses roles jika ada
    if (ccEmailData.roles.selected_roles && ccEmailData.roles.selected_roles.length > 0) {
      // Dapatkan email berdasarkan role_id
      for (const role of ccEmailData.roles.selected_roles) {
        const userEmails = await getUserEmailByRole(role.role_id);

        if (userEmails && userEmails.length > 0) {
          // Tambahkan email dari role ke array
          userEmails.forEach((user: any) => {
            ccEmails.push({
              id: uuid(),
              batch_id: validatedId,
              role_id: role.role_id,
              cc_email: user.email,
            });
          });
        }
      }
    }

    // Proses email manual jika ada
    if (ccEmailData.emails.selected_emails && ccEmailData.emails.selected_emails.length > 0) {
      // Tambahkan email manual ke array
      ccEmailData.emails.selected_emails.forEach((item: any) => {
        ccEmails.push({
          id: uuid(),
          batch_id: validatedId,
          role_id: null, // Null karena dimasukkan manual
          cc_email: item.cc_email,
        });
      });
    }

    console.log("selected CC Role");
    console.log(ccEmails);

    const deletedCCEmailByEmail =
      validatedRequest.cc_email.emails.deleted_emails && validatedRequest.cc_email.emails.deleted_emails.length > 0
        ? validatedRequest.cc_email.emails.deleted_emails.map((prev: any) => ({
            ...prev,
            batch_id: validatedId,
          }))
        : [];

    console.log("deleted CC Email");
    console.log(deletedCCEmailByEmail);

    // const selectedNewCCEmailByEmail =
    //   validatedRequest.cc_email.emails.selected_emails && validatedRequest.cc_email.emails.selected_emails.length > 0
    //     ? validatedRequest.cc_email.emails.selected_emails.map((prev: any) => ({
    //         ...prev,
    //         batch_id: validatedId,
    //       }))
    //     : [];

    // console.log("selected CC Email");
    // console.log(selectedNewCCEmailByEmail);

    const deletedAssessee =
      validatedRequest.assessees.deleted_assessees && validatedRequest.assessees.deleted_assessees.length > 0
        ? validatedRequest.assessees.deleted_assessees.map((prev: any) => ({
            ...prev,
            batch_id: validatedId,
          }))
        : [];
    console.log("deleted assessee");
    console.log(deletedAssessee);

    const selectedNewAssessee = validatedRequest.assessees.selected_assessees?.length
      ? validatedRequest.assessees.selected_assessees.map((prev: any) => {
          const assesseeId = uuid();
          return {
            ...prev,
            id: assesseeId,
            assessee_nik: prev.assessee_nik || assesseeId,
            batch_id: validatedId,
          };
        })
      : [];

    console.log("selected new Assesse");
    console.log(selectedNewAssessee);

    await updateBatch(
      validatedId,
      batchHeadUpdate,
      deletedCCEmailByRole,
      deletedCCEmailByEmail,
      ccEmails,
      deletedAssessee,
      selectedNewAssessee
    );

    message = message || "Batch with code is updated successfully!";

    res.status(201).send({
      message: message,
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
    await deleteBatchAssessee(validatedBatchId, validateAssesseeId);
    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleAddAssesseeByFile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).send("File tidak ditemukan.");
  }

  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
    const workbook = XLSX.read(req.file!.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Convert sheet to JSON
    const jsonData: XLSAssessee[] = XLSX.utils.sheet_to_json(worksheet, {
      defval: null,
      raw: false,
    });

    console.log("masuk payload");

    // Prepare payload for API request
    const payload = {
      api_key: process.env.API_KEY,
      datasetKey: process.env.DATASET_KEY,
      limit: "1000",
      employee_ids: jsonData.map((row: any) => `${row.NIK}`),
    };

    console.log(payload);
    console.log("keluar payload");

    // Prepare Basic Auth
    const username = process.env.BASIC_AUTH_USERNAME || "no";
    const password = process.env.BASIC_AUTH_PASSWORD || "no";
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");

    // Fetch employee data from API
    const getAssessee = await axios.post<any, AxiosResponse<{ employee_data: DataEmpDarwin[] }>>(
      `${process.env.DARWIN_BASE_URL}`,
      payload,
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("fetch berhasil");
    console.log(getAssessee);
    console.log(getAssessee.data.employee_data);

    // Create a map of found employee IDs for quick lookup
    const foundEmployees = new Map(getAssessee.data.employee_data.map((emp: any) => [emp.employee_id, emp]));

    // Process each row and update status
    const processedData = jsonData.map<XLSAssessee & { Status: string }>((row: any) => {
      const employee: any = foundEmployees.get(row.NIK);

      if (employee) {
        return {
          ...row,
          Status: "Success",
          Name: employee.full_name,
          Email: employee.company_email_id,
        };
      } else {
        return {
          ...row,
          Status: "Failed",
          Name: null,
          Email: null,
        };
      }
    });

    // Prepare data for database insertion
    const assesseeData = processedData
      .filter((row: any) => row.Status === "Success")
      .map((row: any) => ({
        id: uuid(),
        batch_id: validatedId,
        assessee_nik: row.NIK,
        assessee_name: row.Name,
        assessee_email: row.Email,
      }));

    const not_found_data = processedData
      .filter((row) => row.Status === "Failed")
      .map((row) => ({
        id: uuid(),
        batch_id: validatedId,
        assessee_nik: row.NIK,
        assessee_name: row.Name,
        assessee_email: row.Email,
      }));

    // Validate and add assessees to database
    if (assesseeData.length > 0) {
      const validatedAssessee = Validation.validate(BatchValidation.ASSESSEE, assesseeData);
      await addAssessee(validatedAssessee);
    }

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

    res.status(200).send({
      message: "Success!",
      not_found: not_found_data,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssesseebyDarwin = async (
  req: Request<{ nik: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { nik } = req.params;
    const result = await getDarwinUser(nik);
    console.log(result);
    res.status(200).send(result);
  } catch (error) {
    next(error);
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

export const handleCreateBatchToken = async (
  batchId: string,
  startPeriod: any,
  endPeriod: any,
  userId: string,
  assesseeEmail: string,
  type: string
) => {
  try {
    const batchTokenPayload = {
      user_id: userId,
      batch_id: batchId,
      start_period: startPeriod,
      end_period: endPeriod,
      email: assesseeEmail,
      type: type,
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
    console.log("assesseenya batch");
    console.log(assesseeList);
    if (batchDetail.status !== "Draft") {
      throw new ResponseError(400, "Batch's already submitted");
    }

    const progressHead = await Promise.all(
      assesseeList.map(async (assessee: any) => {
        const token = await handleCreateBatchToken(
          validatedId,
          batchDetail.start_period,
          batchDetail.end_period,
          assessee.assessee_nik,
          assessee.assessee_email,
          batchDetail.type
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
    const status = "Published";
    await publishBatch(validatedId, status);
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

export const handleGetLanguagesWithBatchTranslationStatus = async (
  req: Request<{ batchId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { batchId } = req.params;
    const validatedBatchId = Validation.validate(BatchValidation.ID, batchId);

    const languages = await getLanguagesWithBatchTranslationStatus(validatedBatchId);

    res.status(200).send({
      message: "Languages with translation status retrieved successfully!",
      data: languages,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGenerateBatchTranslation = async (
  req: Request<{ id: string; languageId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: batchId, languageId } = req.params;
    const { fields } = req.body; // Array of field names to translate

    // Get the main batch data for auto-translation
    const batchDetailResult = await getBatchDetail(batchId);
    if (!batchDetailResult || !batchDetailResult.batch) {
      res.status(404).send({
        message: "Batch not found",
      });
      return;
    }

    const mainBatch = batchDetailResult.batch;

    // Prepare fields for batch translation using generic service
    const sourceLanguageCode = mainBatch.language_id || "en"; // fallback to English if not set

    // Build fieldsToTranslate based on requested fields, or all fields if none specified
    const requestedFields = fields && fields.length > 0 ? fields : ["description"];
    const fieldsToTranslate: Record<string, string> = {};

    requestedFields.forEach((field: string) => {
      if (field === "description") {
        fieldsToTranslate.description = mainBatch.description || "";
      }
    });

    // Use generic batch translation service
    const translatedFields = await translateFieldsBatch(fieldsToTranslate, sourceLanguageCode, languageId);

    // Create a preview translation object with auto-translated content (only requested fields)
    const translation: any = {
      id: null, // No ID since it's not saved yet
      batch_id: batchId,
      language_id: languageId,
      created_by: null,
      created_date: null,
      updated_by: null,
      updated_date: null,
      auto_translated: true,
      translation_source: "google_translate",
      is_preview: true,
    };

    // Only include the fields that were requested and translated
    requestedFields.forEach((field: string) => {
      if (translatedFields[field] !== undefined) {
        translation[field] = translatedFields[field];
      }
    });

    res.status(200).send({
      message: `Batch translation generated successfully for: ${requestedFields.join(", ")}`,
      data: translation,
    });
  } catch (e) {
    next(e);
  }
};

export const handleBatchLanguageTypeSwitch = async (
  req: Request<{ batchId: string }, {}, {}, { languageType: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { batchId } = req.params;
    const { languageType } = req.query;

    if (!languageType || (languageType !== "main" && languageType !== "sub")) {
      res.status(400).send({
        message: "Invalid languageType. Must be 'main' or 'sub'",
      });
      return;
    }

    // Get all languages with translation status for this batch
    const languages = await getLanguagesWithBatchTranslationStatus(batchId);
    if (!languages || languages.length === 0) {
      res.status(404).send({
        message: "No languages found",
      });
      return;
    }

    let recommendedLanguage;
    if (languageType === "main") {
      // For main language, return the main language
      recommendedLanguage = languages.find((lang: any) => lang.translation_status === "main");
    } else {
      // For sub language, just get the first available language (excluding main)
      recommendedLanguage = languages.find((lang: any) => lang.translation_status !== "main");
    }

    if (!recommendedLanguage) {
      res.status(404).send({
        message: `No ${languageType} language found`,
      });
      return;
    }

    // For sub-language mode, also fetch translation data if it exists
    let translationData = null;
    let hasTranslation = false;
    if (languageType === "sub") {
      try {
        const translation = await getBatchTranslation(batchId, recommendedLanguage.language_code);
        if (translation) {
          hasTranslation = true;
          translationData = {
            id: translation.id,
            batch_id: translation.batch_id,
            language_id: translation.language_id,
            description: translation.description,
            created_by: translation.created_by,
            created_date: translation.created_date,
            updated_by: translation.updated_by,
            updated_date: translation.updated_date,
          };
        }
      } catch (error) {
        console.error("Error fetching translation:", error);
        // Translation doesn't exist, hasTranslation remains false
      }
    }

    res.status(200).send({
      message: "Success get language selection for batch",
      data: {
        language_code: recommendedLanguage.language_code,
        language_name: recommendedLanguage.language_name,
        translation_status: recommendedLanguage.translation_status,
        has_translation: hasTranslation,
        translation_data: translationData,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchTranslationForLanguage = async (
  req: Request<{ id: string; languageId?: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: batchId, languageId } = req.params;

    // Get existing translation(s)
    const translations = await getBatchTranslation(batchId, languageId);

    if (!translations || (Array.isArray(translations) && translations.length === 0)) {
      res.status(404).send({
        message: languageId ? "Translation not found for this language" : "No translations found for this batch",
      });
      return;
    }

    // Format the translation data
    let formattedResult: any;

    if (languageId) {
      // Single translation - return as object
      formattedResult = {
        id: translations.id,
        batch_id: translations.batch_id,
        language_id: translations.language_id,
        description: translations.description,
        created_by: translations.created_by,
        created_date: translations.created_date,
        updated_by: translations.updated_by,
        updated_date: translations.updated_date,
      };
    } else {
      // Multiple translations - return as key-value pair object where key is language_id
      formattedResult = {};
      translations.forEach((translation: any) => {
        formattedResult[translation.language_id] = {
          id: translation.id,
          batch_id: translation.batch_id,
          language_id: translation.language_id,
          description: translation.description,
          created_by: translation.created_by,
          created_date: translation.created_date,
          updated_by: translation.updated_by,
          updated_date: translation.updated_date,
        };
      });
    }

    res.status(200).send({
      message: languageId ? "Success get batch translation" : "Success get all batch translations",
      data: formattedResult,
    });
  } catch (e) {
    console.log(e, "error");
    next(e);
  }
};
