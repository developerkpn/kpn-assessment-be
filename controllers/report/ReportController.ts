import { Request, Response, NextFunction } from "express";
import {
  assignReportDesign,
  generateReportForWholeBatch,
  getBatchInformationForReport,
  getReportDesignDetail,
  getReportGuide,
  // storeReportGuide,
  updateReportGuide,
} from "#dep/models/report/ReportModel";
import ExcelJS from "exceljs";
import { v7 as uuid } from "uuid";
import { getBatch, getBatchDetail, getDarwinUser } from "#dep/models/BatchModel";
import { async } from "rxjs";
import { REPORT_GUIDE_ID } from "#dep/constant";
import { getAssesseeExternalProfile } from "#dep/models/transactions/AssesseeModel";

/**
 * Controller to get batch information with test count by category
 */

export const handleGetReportGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportGuideId = REPORT_GUIDE_ID;
    const guide = await getReportGuide(reportGuideId);
    res.status(200).send({
      message: "Success!",
      data: guide,
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateReportGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportGuideId = REPORT_GUIDE_ID;
    const payload = {
      content: req.body.content,
      created_at: new Date().toISOString(),
    };

    await updateReportGuide(payload, reportGuideId);
    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetBatchInformationForReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.params.batchId;
    const allTests = await getBatchInformationForReport(batchId);

    // Group tests by category
    const testsByCategory: any = {};

    // Add special category for uncategorized tests
    testsByCategory["uncategorized"] = {
      name: "Uncategorized",
      code: "uncategorized",
      tests: [],
    };

    console.log("Cek All Test");
    console.log(allTests);

    allTests.forEach((test) => {
      // Focus on essential test information
      const testInfo = {
        id: test.test_id,
        name: test.test_name,
        code: test.test_code,
      };

      if (test.category_code) {
        // Create category if it doesn't exist
        if (!testsByCategory[test.category_code]) {
          testsByCategory[test.category_code] = {
            id: test.category_id,
            name: test.category_name,
            code: test.category_code,
            tests: [],
          };
        }

        // Add test to appropriate category
        testsByCategory[test.category_code].tests.push(testInfo);
      } else {
        // Add to uncategorized
        testsByCategory["uncategorized"].tests.push(testInfo);
      }
    });

    // Remove uncategorized category if empty
    if (testsByCategory["uncategorized"].tests.length === 0) {
      delete testsByCategory["uncategorized"];
    }

    // Convert to array format
    const categories = Object.values(testsByCategory);

    // Add test count to each category
    categories.forEach((category: any) => {
      category.testCount = category.tests.length;
    });

    // Batch basic info
    const batchInfo =
      allTests.length > 0
        ? {
            name: allTests[0].batch_name,
            code: allTests[0].batch_code,
          }
        : {};

    res.status(200).send({
      message: "Success!",
      data: {
        batch: batchInfo,
        categories: categories,
      },
    });
  } catch (e) {
    console.error("Error in handleGetSimpleTestDetailsByCategory:", e);
    next(e);
  }
};

export const handleCreateReportForBatch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: any = req.body;
    const reportId = uuid();
    const headPayload = {
      id: reportId,
      batch_id: body.batch_id,
    };

    console.log("Masuk create");

    const introPayload = body.intro.map((prev: any) => ({
      ...prev,
      id: uuid(),
      report_id: reportId,
    }));

    console.log(introPayload);

    const detailPayload = body.details.map((prev: any) => ({
      ...prev,
      id: uuid(),
      report_id: reportId,
    }));

    console.log(detailPayload);

    await assignReportDesign(headPayload, introPayload, detailPayload);
    await res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateReportDesign = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body: any = req.body;
  } catch (e) {
    next(e);
  }
};

export const handleGetReportDesignDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.params.batchId;
    const batchInformation = await getBatchInformationForReport(batchId);
    console.log("get batch info");
    console.log(batchInformation);
    const reportDesign = await getReportDesignDetail(batchId);
    console.log("get report design");
    console.log(reportDesign);

    // Transform the response to the desired format
    const transformedResponse = transformResponseFormat(batchInformation, reportDesign);

    res.status(200).send({
      message: "Success!",
      data: transformedResponse,
    });
  } catch (e) {
    next(e);
  }
};

function transformResponseFormat(batchInfo: any, reportDesign: any) {
  if (!batchInfo || !batchInfo.length) {
    return { batch: {}, categories: [] };
  }

  // Extract batch information from the first item
  const firstBatch = batchInfo[0];
  const transformedBatch: any = {
    batch: {
      name: firstBatch.batch_name,
      code: firstBatch.batch_code,
    },
    categories: [],
  };

  // Create a map to store categories
  const categoriesMap = new Map();

  // Process each batch item
  batchInfo.forEach((item: any) => {
    const categoryId = item.category_id;

    // If this category doesn't exist in our map yet, create it
    if (!categoriesMap.has(categoryId)) {
      // Find matching intro info from report
      const introInfo = reportDesign.intro.find((intro: any) => intro.category_id === categoryId.toString());

      const category = {
        id: categoryId,
        name: item.category_name,
        code: item.category_code,
        summary_view: introInfo ? introInfo.summary_view.toLowerCase() : "bar",
        summary_type: introInfo ? introInfo.summary_type : "summary",
        summary_formula: introInfo ? introInfo.summary_formula : "sum",
        tests: [],
      };

      categoriesMap.set(categoryId, category);
    }

    // Find test detail info
    const testDetails = reportDesign.detail.find((detail: any) => detail.test_id === item.test_id);

    // Add test to the category
    if (testDetails) {
      const test = {
        id: item.test_id,
        name: item.test_name,
        code: item.test_code,
        summary_view: testDetails.summary_view,
        summary_type: testDetails.summary_type,
        summary_formula: testDetails.summary_formula,
      };

      const category = categoriesMap.get(categoryId);

      // Check if test already exists in the category
      const testExists = category.tests.some((t: any) => t.id === test.id);
      if (!testExists) {
        category.tests.push(test);
      }
    }
  });

  // Convert map to array and calculate testCount
  transformedBatch.categories = Array.from(categoriesMap.values()).map((category) => {
    return {
      ...category,
      testCount: category.tests.length,
    };
  });

  return transformedBatch;
}

// Tipe untuk respons dari model
interface BatchReportRow {
  batch_id: string;
  batch_name: string;
  batch_code: string;
  start_period: Date;
  end_period: Date;
  type: string;
  test_id: string;
  test_name: string;
  test_code: string;
  subtest_id: string;
  subtest_name: string;
  subtest_code: string;
  question_id: string;
  q_input_text: string;
  assessee_nik: string;
  assessee_name: string;
  assessee_email: string;
  point: number | null;
}

export const handleDownloadBatchReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.params.batchId;

    // Mendapatkan data dari database
    const result = await generateReportForWholeBatch(batchId);
    console.log(result);
    if (!result || result.length === 0) {
      res.status(404).send({
        message: "Data not found for the specified batch ID",
      });
    }

    // Membuat file Excel
    const excelBuffer = await createExcelReport(result);

    // Membuat nama file
    const currentDate = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
    const fileName = `${result[0].batch_name}-${result[0].batch_code}-${currentDate}.xlsx`;

    // Mengirimkan file Excel sebagai respons
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.status(200).send(excelBuffer);
  } catch (e) {
    console.error("Error generating report:", e);
    next(e);
  }
};

async function createExcelReport(data: BatchReportRow[]) {
  // Membuat workbook baru
  const workbook = new ExcelJS.Workbook();

  // Mengelompokkan data berdasarkan test_id dan subtest_id
  const groupedByTest = groupDataByTestAndSubtest(data);

  // Untuk setiap kelompok test dan subtest, buat sheet terpisah
  for (const testSubtestKey in groupedByTest) {
    const groupData = groupedByTest[testSubtestKey];

    if (groupData.length === 0) continue;

    const sheetName = `${groupData[0].test_code}-${groupData[0].subtest_code}`;
    const worksheet = workbook.addWorksheet(sheetName);

    // Ambil semua question_id dan q_input_text unik untuk kolom
    const uniqueQuestions = getUniqueQuestions(groupData);

    // Ambil semua assessee unik untuk baris
    const uniqueAssessees = getUniqueAssessees(groupData);

    // Buat headers - cell A1 kosong, lalu question_id di atasnya
    const headers = ["Assessee Name", "Assessee Email"];
    uniqueQuestions.forEach((q) => {
      headers.push(q.question_id);
    });

    worksheet.addRow(headers);

    // Baris kedua - kosong untuk Assessee Name dan Email, lalu q_input_text
    const subHeaders = ["", ""];
    uniqueQuestions.forEach((q) => {
      subHeaders.push(q.q_input_text);
    });

    worksheet.addRow(subHeaders);

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { italic: true };

    // Tambahkan data untuk setiap assessee
    uniqueAssessees.forEach((assessee) => {
      const rowData = [assessee.assessee_name, assessee.assessee_email];

      // Temukan point untuk setiap question
      uniqueQuestions.forEach((question) => {
        const matchingData: any = groupData.find(
          (item) => item.question_id === question.question_id && item.assessee_nik === assessee.assessee_nik
        );
        rowData.push(matchingData?.point !== null ? matchingData?.point?.toString() : "");
      });

      worksheet.addRow(rowData);
    });

    // Format lebar kolom
    worksheet.getColumn(1).width = 30; // Assessee Name
    worksheet.getColumn(2).width = 30; // Assessee Email

    // Set lebar untuk kolom question
    for (let i = 0; i < uniqueQuestions.length; i++) {
      worksheet.getColumn(i + 3).width = 15;
    }
  }

  // Tambahkan sheet ringkasan
  addSummarySheet(workbook, data);

  // Simpan ke buffer
  return await workbook.xlsx.writeBuffer();
}

/**
 * Mengelompokkan data berdasarkan test_id dan subtest_id
 */
function groupDataByTestAndSubtest(data: BatchReportRow[]): Record<string, BatchReportRow[]> {
  const groupedData: Record<string, BatchReportRow[]> = {};

  data.forEach((row) => {
    const key = `${row.test_id}_${row.subtest_id}`;

    if (!groupedData[key]) {
      groupedData[key] = [];
    }

    groupedData[key].push(row);
  });

  return groupedData;
}

/**
 * Mendapatkan daftar question yang unik dari kumpulan data
 */
interface UniqueQuestion {
  question_id: string;
  q_input_text: string;
}

function getUniqueQuestions(data: BatchReportRow[]): UniqueQuestion[] {
  const questionMap = new Map<string, UniqueQuestion>();

  data.forEach((row) => {
    if (!questionMap.has(row.question_id)) {
      questionMap.set(row.question_id, {
        question_id: row.question_id,
        q_input_text: row.q_input_text,
      });
    }
  });

  return Array.from(questionMap.values());
}

/**
 * Mendapatkan daftar assessee yang unik dari kumpulan data
 */
interface UniqueAssessee {
  assessee_nik: string;
  assessee_name: string;
  assessee_email: string;
}

function getUniqueAssessees(data: BatchReportRow[]): UniqueAssessee[] {
  const assesseeMap = new Map<string, UniqueAssessee>();

  data.forEach((row) => {
    if (!assesseeMap.has(row.assessee_nik)) {
      assesseeMap.set(row.assessee_nik, {
        assessee_nik: row.assessee_nik,
        assessee_name: row.assessee_name,
        assessee_email: row.assessee_email,
      });
    }
  });

  return Array.from(assesseeMap.values());
}

/**
 * Menambahkan sheet ringkasan dengan informasi batch
 */
function addSummarySheet(workbook: ExcelJS.Workbook, data: BatchReportRow[]): void {
  if (data.length === 0) return;

  // Ambil data batch dari baris pertama
  const batchInfo = data[0];

  const summarySheet = workbook.addWorksheet("Batch Summary", { properties: { tabColor: { argb: "FF00FF00" } } });

  // Tambahkan informasi batch
  summarySheet.addRow(["Batch Information"]);
  summarySheet.addRow(["Batch ID", batchInfo.batch_id]);
  summarySheet.addRow(["Batch Name", batchInfo.batch_name]);
  summarySheet.addRow(["Batch Code", batchInfo.batch_code]);
  summarySheet.addRow(["Start Period", formatDate(batchInfo.start_period)]);
  summarySheet.addRow(["End Period", formatDate(batchInfo.end_period)]);
  summarySheet.addRow(["Type", batchInfo.type]);

  // Tambahkan jarak
  summarySheet.addRow([]);

  // Hitung total test dan subtest
  const uniqueTests = new Set(data.map((row) => row.test_id));
  const uniqueSubtests = new Set(data.map((row) => row.subtest_id));
  const uniqueAssessees = new Set(data.map((row) => row.assessee_nik));
  const uniqueQuestions = new Set(data.map((row) => row.question_id));

  // Tambahkan statistik
  summarySheet.addRow(["Report Statistics"]);
  summarySheet.addRow(["Total Tests", uniqueTests.size.toString()]);
  summarySheet.addRow(["Total Subtests", uniqueSubtests.size.toString()]);
  summarySheet.addRow(["Total Assessees", uniqueAssessees.size.toString()]);
  summarySheet.addRow(["Total Questions", uniqueQuestions.size.toString()]);
  summarySheet.addRow(["Report Generated", new Date().toLocaleString()]);

  // Format
  summarySheet.getColumn(1).width = 20;
  summarySheet.getColumn(2).width = 50;

  // Style
  for (let i = 1; i <= 14; i++) {
    if (i === 1 || i === 9) {
      // Headers
      summarySheet.getRow(i).font = { bold: true, size: 14 };
      summarySheet.getRow(i).height = 25;
    } else if (i !== 8) {
      // Normal rows
      summarySheet.getRow(i).height = 20;
    }
  }
}

/**
 * Helper untuk memformat tanggal
 */
function formatDate(date: Date): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

// export const handleUpdateReportDesign = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const body = req.body;
//
//     const headerPayload;
//   } catch (e) {
//     next(e);
//   }
// };

// export const handleGetPersonalReportByAssessee = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const assesseeEmail = req.body.email;
//     const batchId = req.body.batchId;
//
//     const getPersonalReportData = await
//   } catch (e) {
//     next(e);
//   }
// };

// export const handleReportIntro = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const result = await getBatch();
//     const
//   } catch (e) {
//     throw e;
//   }
// };

export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;
    const assesseeEmail = req.body.assessee_email;

    // Cek batch type
    const { batch } = await getBatchDetail(batchId);
    // Get Profilenya
    const assessee = batch.type === "internal" ? getDarwinUser(assesseeId) : getAssesseeExternalProfile(assesseeEmail);
    console.log(assessee);
    // const assessee = {
    //   assessee_name: "Test",
    //   assessee_age: "",
    // }
    //
    // Cek tipe batch dulu
    // Kalo dia batch internal cek ke darwin
    // Kalo dia batch external cek ke mst_user_externo
    // const assesseeProfile =
    // // Cek report designnya
    // const reportDetail = ;
    //
    // // Generate report detail
    //
    // // Generate intronya
    // const report = await report;
    // Generate dahulu detailnya
  } catch (e) {
    throw e;
  }
};

export const handleReportPersonalIntro = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /*
    by summary
    {
     by_summary: {
      category_id
      category_name
      category_code
      criteria
      test
      }
     }
    * */
  } catch (e) {
    throw e;
  }
};

export const handleReportPersonalDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /*
    by subtest
    {
      category_test
      test_name
      test_code
      result: {
        point:,
        criteria_description
      }
      subtest: [
        {
        subtest_name
        subtest_code
        result: {
          result_point
          correct_answer
          total_question
        }
        }
      ]
    }
    by category
    {
      category_test
      test_name
      test_code
      subtest_name
      subtest_code
      result: [{
        question_category_id:
        question_category_name:
        question_category_code:
        question_category_point:
        criteria_description:
      }],
    }
    * */
  } catch (e) {
    throw e;
  }
};
