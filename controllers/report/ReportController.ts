import { Request, Response, NextFunction } from "express";
import {
  assignReportDesign,
  generateReportForWholeBatch,
  getBatchInformationForReport,
  getPersonalReportData,
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

    // Group tests by category and test
    const testsByCategory: any = {};

    // Add special category for uncategorized tests
    testsByCategory["uncategorized"] = {
      name: "Uncategorized",
      code: "uncategorized",
      tests: [],
    };

    // First pass: Group tests by category and then by test ID
    const groupedTests: Record<string, Record<string, any>> = {};

    allTests.forEach((test) => {
      const categoryCode = test.category_code || "uncategorized";
      const testId = test.test_id;

      // Initialize category if needed
      if (!groupedTests[categoryCode]) {
        groupedTests[categoryCode] = {};
      }

      // Initialize test if needed
      if (!groupedTests[categoryCode][testId]) {
        groupedTests[categoryCode][testId] = {
          id: testId,
          name: test.test_name,
          code: test.test_code,
          subtests: [],
        };
      }

      // Add subtest to the test with only required fields
      groupedTests[categoryCode][testId].subtests.push({
        id: test.subtest_id,
        name: test.subtest_name,
        code: test.subtest_code,
        is_criteria: test.is_criteria,
      });
    });

    // Second pass: Organize into the final format
    for (const [categoryCode, testsMap] of Object.entries(groupedTests)) {
      // Skip if category is uncategorized and has no tests
      if (categoryCode === "uncategorized" && Object.keys(testsMap).length === 0) {
        continue;
      }

      // Get category details from any test in this category
      const categoryInfo = allTests.find((test) => test.category_code === categoryCode);

      testsByCategory[categoryCode] = {
        id: categoryInfo?.category_id || null,
        name: categoryInfo?.category_name || "Uncategorized",
        code: categoryCode,
        tests: Object.values(testsMap),
        testCount: Object.keys(testsMap).length,
      };
    }

    // Remove uncategorized category if empty
    if (testsByCategory["uncategorized"].tests.length === 0) {
      delete testsByCategory["uncategorized"];
    }

    // Convert to array format
    const categories = Object.values(testsByCategory);

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
    console.error("Error in handleGetBatchInformationForReport:", e);
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

    console.log(body);
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
    console.log("putus");
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
    console.log("masuk coys");
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;
    const assesseeEmail = req.body.assessee_email;
    // Get Report Guide
    const guideId = REPORT_GUIDE_ID;
    const guide = await getReportGuide(guideId);
    console.log(guide);
    // Cek batch type
    const { batch } = await getBatchDetail(batchId);
    // Get Profilenya
    const assessee: any =
      batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);

    console.log(assessee);

    const assesseeProfile = {
      assessee_name: assessee.assessee_name,
      assessee_age: assessee.assessee_age,
      assessee_gender: assessee.assessee_gender,
      work_location: assessee.work_location,
    };

    // Cek report design Detail
    const reportDesign = await getReportDesignDetail(batchId);
    console.log("Cek report design");
    console.log(reportDesign);
    /*
    {
    "message": "Success!",
    "data": {
        "batch": {
            "name": "Report Personal Testing 19 Mei 1",
            "code": "OD/DWS/MAY/2025/23"
        },
        "categories": [
            {
                "id": 37,
                "name": "Kognitif",
                "code": "KOGS",
                "tests": [
                    {
                        "id": "50b2e9e8-5601-4e53-b2ed-e0bd5455aa90",
                        "name": "Kognitif Test 13 Mei",
                        "code": "KGT13MEI",
                        "subtests": [
                            {
                                "name": "Matematika Dasar Subtest 13 Mei",
                                "code": "MTKD13MEI",
                                "is_criteria": null
                            }
                        ]
                    }
                ],
                "testCount": 1
            },
            {
                "id": 35,
                "name": "Personality",
                "code": "PERSONALITY",
                "tests": [
                    {
                        "id": "c760f05c-d156-468d-a8f3-7fb0a86753e5",
                        "name": "Personality Test 13 Mei",
                        "code": "PT13MEI",
                        "subtests": [
                            {
                                "name": "DISC Subtest 13 Mei",
                                "code": "DISC13MEI",
                                "is_criteria": null
                            }
                        ]
                    }
                ],
                "testCount": 1
            },
            {
                "id": 28,
                "name": "Ini Category Name May25",
                "code": "NOEL",
                "tests": [
                    {
                        "id": "bb15b5bf-f59d-42f8-83fa-9a005a445404",
                        "name": "TEST 2 7 MEI2025",
                        "code": "7MEI20252",
                        "subtests": [
                            {
                                "name": "Subtest 1 7 Mei 2025",
                                "code": "7MEI20251",
                                "is_criteria": null
                            },
                            {
                                "name": "Subtest 2 7 Mei 2025",
                                "code": "7MEI20252",
                                "is_criteria": null
                            }
                        ]
                    },
                    {
                        "id": "8750d642-337c-405e-957b-c805ea7fe678",
                        "name": "TEST 1 7 MEI2025",
                        "code": "7MEI20251",
                        "subtests": [
                            {
                                "name": "Subtest 1 7 Mei 2025",
                                "code": "7MEI20251",
                                "is_criteria": null
                            },
                            {
                                "name": "Subtest 2 7 Mei 2025",
                                "code": "7MEI20252",
                                "is_criteria": null
                            }
                        ]
                    }
                ],
                "testCount": 2
            },
            {
                "id": 29,
                "name": "Contoh KPT",
                "code": "CKPT",
                "tests": [
                    {
                        "id": "454b50b8-6ac2-43ad-a681-a28f148b4768",
                        "name": "test subtest wo duration",
                        "code": "TWOS",
                        "subtests": [
                            {
                                "name": "test wo duration",
                                "code": "TWO2",
                                "is_criteria": null
                            },
                            {
                                "name": "test wo duration",
                                "code": "TWO",
                                "is_criteria": null
                            }
                        ]
                    }
                ],
                "testCount": 1
            }
        ]
    }
}

    // // Cek dulu apakah test tersebut summarynya by
    // * */
    // if (reportDesign.detail.test.summary_type === "subtest") {
    //   const resultBySubtest = await getPersonalReportData(batchId, assesseeEmail, "subtest");
    //   console.log("result by subtest");
    //   console.log(resultBySubtest);
    //
    // } else if ()
    //
    // console.log("result by category");
    // const resultByCategory = await getPersonalReportData(batchId, assesseeEmail, "category");
    // console.log(resultByCategory);
    // /*

    // * */
    // // const reportDataBySubtest = await gePersonalReportBySubtest
    // {
    // }
    // // Cek ada test apa aja
    // {
    // }
    // // Cek tipe summarynya apa
    // // Kalo by Subtest dia ambil getBySubtest
    // // Kelola by formulanya
    // // Dapatkan hasilnya
    // // Ambil criteria subtestnya
    // // Cocokkan batasannya
    //
    // {
    //   category_test_id: 1;
    //   category_test_name: 1;
    //   category_test_code: 1;
    //   test_id: 1;
    //   test_name: 1;
    //   test_code: "abc";
    //   result: {
    //     test_point: 80;
    //     result_criteria: "High";
    //     description: "Mendapatkan skor tinggi";
    //   }
    //   norm: [
    //     {
    //       criteria_name: "Low",
    //       min_value: 0,
    //       max_value: 30,
    //     },
    //     {
    //       criteria_name: "Mid",
    //       min_value: 31,
    //       max_value: 60,
    //     },
    //     {
    //       criteria_name: "High",
    //       min_value: 61,
    //       max_value: 100,
    //     },
    //   ];
    //   subtests: [
    //     {
    //       subtest_id: "uuid",
    //       subtest_name: "Subtest 1",
    //       subtest_code: "ABC",
    //       result: {
    //         subtest_point: 50,
    //         subtest_criteria: "Medium",
    //         criteria_color: "hex_code",
    //       },
    //     },
    //     {
    //       subtest_id: "uuid",
    //       subtest_name: "Subtest 1",
    //       subtest_code: "ABC",
    //       result: {
    //         subtest_point: 50,
    //         subtest_criteria: "Medium",
    //         criteria_color: "hex_code",
    //       },
    //     },
    //   ];
    // }

    //Kalo dia by category
    // ambil getByCategory
    // Ambil category
    // Ambil criteria tiap category
    // Cocokkan hasilnya

    {
      category_test_id: 1;
      category_test_name: 1;
      category_test_code: 1;
      test_id: 1;
      test_name: 1;
      test_code: "abc";
      test_description: "Ini Test";
      result: {
        test_point: 80;
        result_criteria: "High";
        description: "Mendapatkan skor tinggi";
      }
      subtests: [
        {
          subtest_id: "uuid",
          subtest_name: "Subtest",
          subtest_code: "Subtest Code",
          result: [
            {
              category_id: 1,
              category_name: "Openness",
              category_code: "O",
              category_point: 20,
              description: "Orang ini open banget",
            },
            {
              category_id: 2,
              category_name: "C",
              category_code: "C",
              category_point: 20,
              description: "Orang ini ceria banget",
            },
            {
              category_id: 3,
              category_name: "E",
              category_code: "E",
              category_point: 20,
              description: "Orang ini ember bocor banget",
            },
          ],
        },
      ];
    }
    // // Generate intronya
    // const report = await report;
    // Generate dahulu detailnya

    res.status(200).send({
      message: `Success!`,
      data: {
        // subtest: resultBySubtest,
        // category: resultByCategory,
      },
      // data: {
      //   report_guide: {
      //     content: guide.content,
      //   },
      //   profile: {
      //     assessee_name: "John Doe",
      //     assessee_age: 22,
      //     assessee_gender: "Male",
      //     test_date: "15/05/2025",
      //     work_location: "KPN Corp",
      //   },
      //   intro: {},
      //   detail: {},
      // //   proctoring: {},
      // //   log: {},
      // },
    });
  } catch (e) {
    throw e;
  }
};

export const handleReportPersonalIntro = async (req: Request, res: Response, next: NextFunction) => {
  try {
    /*
    {
    {
      category_id
      category_name
      category_code
      category_norm
      summary_view
      summary_type
      summary_formula
      tests: [
        {
          test_id
          test_name
          test_code
          test_description
          result
        }
      ]
    }
     by_summary: {
      category_id
      category_name
      category_code
      category_norm
      test: [
      {
        test_id
        test_name
        test_code
        test_description
        result
      }
      by_detail: {
        subtest_id
        subtest_name
        subtest_code
        subtest_description
        result
     }
    * */
  } catch (e) {
    throw e;
  }
};

export const handleReportPersonalDetail = async (testId: string, type: string, formula: string) => {
  try {
    let detail;

    return detail;
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
