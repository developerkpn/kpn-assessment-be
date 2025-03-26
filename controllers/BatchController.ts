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
  getBatch,
  getBatchAssesses,
  getBatchDetail,
  publishBatch,
  startProgress,
  updateBatch,
} from "#dep/models/BatchModel";
import fs from "fs";
import { AdminWebValidation } from "#dep/validation/AdminWebValidation";
import { BatchAssessee, BatchHeader, BatchHeadUpdate } from "#dep/types/BatchTypes";
import { handleGenerateEmailTemplate, handleSendEmail } from "#dep/controllers/EmailTemplateController";
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
    // const validatedId = Validation.validate(BatchValidation.ID, req.params.id);
    // const validatedRequest = Validation.validate(BatchValidation.ADDASSESSEEMANUALLY, req.body);
    //
    // const payload = {
    //   api_key: process.env.API_KEY,
    //   datasetKey: process.env.DATASET_KEY,
    //   employee_ids: [`${validatedRequest.assessee_nik}`],
    // };
    //
    // console.log(payload);
    //
    // // Encode Basic Auth (username:password) ke Base64
    // const username = process.env.BASIC_AUTH_USERNAME || "no";
    // console.log(username);
    // const password = process.env.BASIC_AUTH_PASSWORD || "no";
    // console.log(password);
    // const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
    // console.log(basicAuth);
    // const getAssessee = await axios.post(`${process.env.DARWIN_BASE_URL}`, payload, {
    //   headers: {
    //     Authorization: `Basic ${basicAuth}`, // Menambahkan header Authorization
    //     "Content-Type": "application/json",
    //   },
    // });
    //
    // console.log(getAssessee);
    // if (getAssessee.data.status! === 1) {
    //   const assessee = {
    //     id: uuid(),
    //     batch_id: validatedId,
    //     assessee_nik: getAssessee.data.employee_data[0].employee_id,
    //     assessee_name: getAssessee.data.employee_data[0].full_name,
    //     assessee_email: getAssessee.data.employee_data[0].company_email_id,
    //   };
    //
    //   console.log(assessee);
    //
    //   await addAssessee(assessee);
    //
    //   res.status(201).send({
    //     message: "Assessee is successfully added!",
    //     data: {
    //       assessee_nik: getAssessee.data.employee_data[0].employee_id,
    //       assessee_name: getAssessee.data.employee_data[0].full_name,
    //       assessee_email: getAssessee.data.employee_data[0].company_email_id,
    //     },
    //   });
    // } else {
    //   throw new ResponseError(400, getAssessee.data.message!);
    // }
    // console.log(getAssessee.status!);
    //
    // console.log(getAssessee.data);
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedId = Validation.validate(BatchValidation.ID, req.params.id);

    const result = await getBatchDetail(validatedId);

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
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
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
    const getAssessee = await axios.post(`${process.env.DARWIN_BASE_URL}`, payload, {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
    });

    console.log("fetch berhasil");
    console.log(getAssessee);
    console.log(getAssessee.data.employee_data);

    // Create a map of found employee IDs for quick lookup
    const foundEmployees = new Map(getAssessee.data.employee_data.map((emp: any) => [emp.employee_id, emp]));

    // Process each row and update status
    const processedData = jsonData.map((row: any) => {
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
    const batchDetail = await getBatchDetail(validatedId);
    const assesseeList = await getBatchAssesses(validatedId);

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

    await startProgress(progressHead);

    res.status(200).send({
      message: "Batch is successfully published and email's sent to assessee",
    });
  } catch (e) {
    next(e);
  }
};
