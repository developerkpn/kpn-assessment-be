import { Request, Response, NextFunction } from "express";
import {
  assignReportDesign,
  generateReportForWholeBatch,
  getBatchInformationForReport,
  getCategoryCriteriaModel,
  getPersonalReportData,
  getReportDesignDetail,
  getReportGuide,
  getTestCriteriaModel,
  // storeReportGuide,
  updateReportGuide,
} from "#dep/models/report/ReportModel";
import ExcelJS from "exceljs";
import { v7 as uuid } from "uuid";
import { getBatch, getBatchDetail, getDarwinUser } from "#dep/models/BatchModel";
import { async } from "rxjs";
import { REPORT_GUIDE_ID } from "#dep/constant";
import { getAssesseeExternalProfile } from "#dep/models/transactions/AssesseeModel";
import { ResponseError } from "#dep/error/response-error";
import { getCriteriaDetail } from "#dep/models/CriteriaModel";

/**
 * Controller to get batch information with test count by category
 */

export const handleReportPreview = async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).send({
    message: "Success!",
    data: {
      profile: {
        assessee_name: "John Doe",
        assessee_age: "22",
        assessee_gender: "Male",
        work_location: "KPN",
      },
      guide: {
        content:
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      },
      batch: {
        name: "Batch Testing",
        code: "OD/DWS/MAY/2025/23",
      },
      intro: [
        {
          category_id: "1",
          category_name: "Kognitif",
          category_code: "KOG",
          summary_type: "summary",
          summary_view: "bar",
          summary_formula: "sum",
          subtests: [],
          tests: [
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8291",
              name: "KPN Kognitif Test",
              description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
              result: {
                test_point: 80,
                norm: [
                  {
                    id: "ac0003d5-34c7-4036-b942-9b4f68cb8291",
                    criteria_name: "Very Low",
                    minimum_score: 0,
                    maximum_score: 20,
                  },
                  {
                    id: "ac0003d5-34c7-4036-b942-9b4f68cb8292",
                    criteria_name: "Low",
                    minimum_score: 21,
                    maximum_score: 40,
                  },
                  {
                    id: "ac0003d5-34c7-4036-b942-9b4f68cb8293",
                    criteria_name: "Average",
                    minimum_score: 41,
                    maximum_score: 60,
                  },
                  {
                    id: "ac0003d5-34c7-4036-b942-9b4f68cb8294",
                    criteria_name: "High",
                    minimum_score: 61,
                    maximum_score: 80,
                  },
                  {
                    id: "ac0003d5-34c7-4036-b942-9b4f68cb8295",
                    criteria_name: "Very High",
                    minimum_score: 80,
                    maximum_score: 100,
                  },
                ],
              },
            },
          ],
        },
        {
          category_id: 2,
          category_name: "Personality",
          category_code: "PERSON",
          summary_type: "detail",
          summary_view: "bar",
          summary_formula: "sum",
          tests: [],
          subtests: [
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb829a",
              name: "KPN Assessment OCEAN (Sub Test)",
              description: "Mengukur jenis kepribadian seseorang dengan menggunakan teori OCEAN",
              result: {
                type: "Openness",
              },
            },
          ],
        },
      ],
      detail: [
        {
          category_id: 1,
          category_name: "Kognitif",
          category_code: "KOG",
          test_id: "ac0003d5-34c7-4036-b942-9b4f68cb8291",
          test_name: "KPN Assessment Kognitif 1",
          test_code: "KOG 1",
          taken_at: "2025-05-06 13:47:31.669 +0700",
          summary_type: "subtest",
          summary_view: "bar",
          summary_formula: "sum",
          result: {
            test_point: 100,
            criteria: "Very High",
            description: "Criteria kalau dapat nilai 100",
          },
          norm: [
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8291",
              criteria_name: "Very Low",
              minimum_score: 0,
              maximum_score: 20,
            },
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8292",
              criteria_name: "Low",
              minimum_score: 21,
              maximum_score: 40,
            },
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8293",
              criteria_name: "Average",
              minimum_score: 41,
              maximum_score: 60,
            },
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8294",
              criteria_name: "High",
              minimum_score: 61,
              maximum_score: 80,
            },
            {
              id: "ac0003d5-34c7-4036-b942-9b4f68cb8295",
              criteria_name: "Very High",
              minimum_score: 80,
              maximum_score: 100,
            },
          ],
          subtests: [
            {
              subtest_id: "ac0003d5-34c7-4036-b942-9b4f68cb829n",
              subtest_name: "Matematika",
              subtest_code: "MTK",
              description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
              result: {
                subtest_point: 80,
                subtest_criteria: "High",
                criteria_color: "#00FF00",
                category: [],
              },
            },
            {
              subtest_id: "ac0003d5-34c7-4036-b942-9b4f68cb829o",
              subtest_name: "Bahasa Indonesia",
              subtest_code: "BHS",
              description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
              result: {
                subtest_point: 50,
                subtest_criteria: "Medium",
                criteria_color: "#FFFF00",
                categories: [],
              },
            },
            {
              subtest_id: "ac0003d5-34c7-4036-b942-9b4f68cb829p",
              subtest_name: "English",
              subtest_code: "ENG",
              description:
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
              result: {
                subtest_point: 20,
                subtest_criteria: "Low",
                criteria_color: "#FF0000",
                categories: [],
              },
            },
          ],
        },
        {
          test_id: "ac0003d5-34c7-4036-b942-9b4f68cb829a",
          test_name: "Personality",
          test_code: "PERSON",
          taken_at: "2025-05-07 09:32:22.369 +0700",
          summary_type: "category",
          summary_view: "bar",
          summary_formula: "sum",
          result: {
            test_point: null,
            criteria: null,
            description: null,
          },
          norm: [],
          subtests: [
            {
              subtest_id: "7af29352-fbf7-4263-93c9-73047831ff41",
              subtest_name: "OCEAN",
              subtest_code: "OCEAN",
              result: {
                subtest_point: null,
                subtest_criteria: null,
                criteria_color: null,
                categories: [
                  {
                    category_id: 3,
                    category_name: "Openness",
                    category_code: "O",
                    category_point: 20,
                    description:
                      "Openness menggambarkan sejauh mana seseorang terbuka terhadap ide-ide baru, pengalaman unik, dan pemikiran kreatif. Individu dengan skor tinggi dalam aspek ini cenderung imajinatif, memiliki rasa ingin tahu yang tinggi, dan tertarik untuk mencoba hal-hal baru. Sebaliknya, individu dengan skor rendah lebih menyukai rutinitas, berpikir secara konkret, dan cenderung lebih praktis dalam pendekatan mereka terhadap kehidupan.",
                  },
                  {
                    category_id: 4,
                    category_name: "Conscientiousness",
                    category_code: "C",
                    point: 8,
                    description:
                      "Aspek ini mencerminkan tingkat disiplin, organisasi, dan tanggung jawab seseorang dalam menyelesaikan tugas. Individu dengan tingkat conscientiousness yang tinggi dikenal sebagai orang yang teliti, dapat diandalkan, serta memiliki tujuan yang jelas dalam hidupnya. Mereka cenderung terstruktur dalam pekerjaan dan kehidupan sehari-hari. Sementara itu, individu dengan skor rendah lebih spontan, fleksibel, dan terkadang kurang memperhatikan detail atau cenderung menunda pekerjaan.",
                  },
                  {
                    category_id: 4,
                    category_name: "Extraversion",
                    category_code: "E",
                    point: 20,
                    description:
                      "Ekstroversi mengukur tingkat energi seseorang dalam berinteraksi dengan lingkungan sosial. Individu dengan tingkat ekstroversi yang tinggi biasanya ramah, bersemangat, dan menikmati berada di tengah-tengah orang lain. individu dengan tingkat ekstroversi yang rendah lebih introvert, menikmati waktu sendiri, cenderung lebih pendiam, dan merasa lebih nyaman dalam lingkungan yang tenang atau dalam interaksi yang lebih intim.",
                  },
                  {
                    category_id: 5,
                    category_name: "Agreeableness",
                    category_code: "A",
                    point: 10,
                    description:
                      "Ekstroversi mengukur tingkat energi seseorang dalam berinteraksi dengan lingkungan sosial. Individu dengan tingkat ekstroversi yang tinggi biasanya ramah, bersemangat, dan menikmati berada di tengah-tengah orang lain. individu dengan tingkat ekstroversi yang rendah lebih introvert, menikmati waktu sendiri, cenderung lebih pendiam, dan merasa lebih nyaman dalam lingkungan yang tenang atau dalam interaksi yang lebih intim.",
                  },
                  {
                    category_id: 6,
                    category_name: "Neuroticism",
                    category_code: "N",
                    point: 15,
                    description:
                      "Neuroticism mengukur seberapa stabil emosi seseorang dalam menghadapi tekanan atau tantangan hidup. Individu dengan skor tinggi dalam aspek ini cenderung lebih mudah merasa cemas, khawatir, dan mengalami perubahan suasana hati yang lebih sering. Di sisi lain, individu dengan skor rendah memiliki tingkat ketenangan yang lebih tinggi,lebih tahan terhadap tekanan, dan mampu mengelola emosinya dengan lebih baik.",
                  },
                ],
              },
            },
          ],
        },
      ],
      proctoring: {
        picture: {
          candidate: [
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
          ],
          screen: [
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
            {
              image_url: "www.google.png",
            },
          ],
        },
        log_activity: [
          {
            id: "ac0003d5-34c7-4036-b942-9b4f68cb829x",
            timestamp: "2025-03-27 09:58:26.764 +0700",
            activity: "berada di halaman dengan path: /device",
            type: "subtest",
          },
        ],
      },
    },
  });
  try {
  } catch (e) {
    next(e);
  }
};

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

// export const summaryBySubTest = async (batchId: string, testId: string, assesseeEmail: string) => {
//   try {
//
//     if()
//   } catch (e) {
//     throw e;
//   }
// };

const countSubTestFormula = async () => {};

const countDetailFormula = "";

const countIntroFormula = "";

const proceedDetail = "";

const proceedIntro = "";

const proceeedProfile = "";

const proceedGuide = "";

const getCriteriaForReport = async (criteriaId: string) => {
  try {
    const rawData = await getCriteriaDetail(criteriaId);

    const groupedData = {
      value_name: rawData[0].value_name,
      value_code: rawData[0].value_code,
      criterias: rawData.reduce(
        (acc, row) => {
          if (row.criteria_name) {
            acc.push({
              criteria_name: row.criteria_name,
              minimum_score: row.minimum_score,
              maximum_score: row.maximum_score,
              description: row.description,
              color_id: row.color_id,
              color_name: row.color_name,
              hex_code: row.hex_code,
            });
          }
          return acc;
        },
        [] as Array<{ criteria_name: string; minimum_score: number; maximum_score: number; description: string }>
      ),
    };

    return groupedData;
  } catch (e) {
    throw e;
  }
};

const getTestCriteria = async (testId: string) => {
  const testCriteria = await getTestCriteriaModel(testId);
  const getCriteria = await getCriteriaForReport(testCriteria.id);
  return getCriteria;
};

const getCategoryCriteriaReport = async (categoryId: string) => {
  const categoryCriteria = await getCategoryCriteriaModel(categoryId);
  const getCriteria = await getCriteriaForReport(categoryCriteria.id);
  return getCriteria;
};

export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Processing personal report request");
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;
    const assesseeEmail = req.body.assessee_email;

    // Get Report Guide
    const guideId = REPORT_GUIDE_ID;
    const guide = await getReportGuide(guideId);

    // Check batch type
    const { batch } = await getBatchDetail(batchId);

    // Get Assessee Profile
    const assessee =
      batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);

    const assesseeProfile = {
      assessee_name: assessee.assessee_name,
      assessee_age: assessee.assessee_age,
      assessee_gender: assessee.assessee_gender,
      work_location: assessee.work_location,
    };

    const batchInformation = await getBatchInformationForReport(batchId);
    const design = await getReportDesignDetail(batchId);
    // Transform the response to the desired format
    const reportDesign = transformResponseFormat(batchInformation, design);

    // Define the types for intro and detail results arrays
    const detailResults: Array<any> = [];
    const introResults: Array<any> = [];

    // Process all categories in the reportDesign
    for (const category of reportDesign.categories) {
      const categoryData: {
        category_id: string | number;
        category_name: string;
        category_code: string;
        summary_type: string;
        summary_view: string;
        summary_formula: string;
        tests: Array<any>; // Define tests as Array<any> to allow pushing any test objects
        subtests: Array<any>; // Define subtests as Array<any>
      } = {
        category_id: category.id,
        category_name: category.name,
        category_code: category.code,
        summary_type: category.summary_type || "summary",
        summary_view: category.summary_view || "bar",
        summary_formula: category.summary_formula || "sum",
        tests: [],
        subtests: [],
      };

      // Process all tests in this category for the intro section
      for (const test of category.tests) {
        // Create a simplified test object for the intro section
        const introTest = {
          id: test.id,
          name: test.name,
          description: test.description || "No description available",
          result: {},
        };

        // Get test criteria to determine overall test score and norm
        const testCriteria = await getTestCriteria(test.id);

        // For intro section, we just need basic test information
        if (test.summary_type === "subtest") {
          // Get overall test score for intro section
          const subtestResultsArray = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.id);

          // Calculate test point based on summary formula
          let testPoint = 0;
          if (subtestResultsArray && subtestResultsArray.length > 0) {
            if (test.summary_formula === "sum") {
              testPoint = subtestResultsArray.reduce((total, subtest) => {
                return total + (Number(subtest.subtest_point) || 0);
              }, 0);
            } else if (test.summary_formula === "average") {
              testPoint =
                subtestResultsArray.reduce((total, subtest) => {
                  return total + (Number(subtest.subtest_point) || 0);
                }, 0) / (subtestResultsArray.length || 1);
            }
          }

          // Add norm information to the intro test
          introTest.result = {
            test_point: testPoint,
            norm: testCriteria.criterias.map((criteria: any) => ({
              id: criteria.id,
              criteria_name: criteria.criteria_name,
              minimum_score: Number(criteria.minimum_score),
              maximum_score: Number(criteria.maximum_score),
            })),
          };
        } else if (test.summary_type === "category") {
          // For category-based tests in intro, we may need less detailed info
          introTest.result = {
            type: test.name, // Simplified for category tests
          };
        }

        categoryData.tests.push(introTest);
      }

      introResults.push(categoryData);

      // Now process detailed information for each test
      for (const test of category.tests) {
        let testResult;

        // Process based on summary type
        if (test.summary_type === "subtest") {
          // Get detailed subtest data
          const subtestResultsArray: any = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.id);

          // Process each subtest and match with appropriate criteria
          const processedSubtests = [];

          for (const subtestResult of subtestResultsArray) {
            // Get criteria for this subtest
            const subtestCriteria = await getCriteriaForReport(subtestResult.criteria_id);

            // Convert subtest_point to number
            const subtestPoint = Number(subtestResult.subtest_point) || 0;

            // Find matching criteria based on score
            const matchingCriteria = subtestCriteria.criterias.find((criteria: any) => {
              return subtestPoint >= Number(criteria.minimum_score) && subtestPoint <= Number(criteria.maximum_score);
            });

            processedSubtests.push({
              subtest_id: subtestResult.subtest_id,
              subtest_name: subtestResult.subtest_name,
              subtest_code: subtestResult.subtest_code,
              description:
                subtestResult.description ||
                "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
              result: {
                subtest_point: subtestPoint,
                subtest_criteria: matchingCriteria ? matchingCriteria.criteria_name : "Undefined",
                criteria_color: matchingCriteria ? matchingCriteria.hex_code : "#CCCCCC",
                categories: [], // Empty array for categories as specified in expected output
              },
            });
          }

          // Get test criteria for overall result
          const testCriteria = await getTestCriteria(test.id);

          // Calculate overall test score
          let testPoint = 0;
          if (test.summary_formula === "sum") {
            testPoint = processedSubtests.reduce((total, subtest) => {
              return total + subtest.result.subtest_point;
            }, 0);
          } else if (test.summary_formula === "average") {
            testPoint =
              processedSubtests.reduce((total, subtest) => {
                return total + subtest.result.subtest_point;
              }, 0) / (processedSubtests.length || 1);
          }

          // Find matching test criteria
          const matchingTestCriteria = testCriteria.criterias.find((criteria: any) => {
            return testPoint >= Number(criteria.minimum_score) && testPoint <= Number(criteria.maximum_score);
          });

          testResult = {
            test_point: testPoint,
            criteria: matchingTestCriteria ? matchingTestCriteria.criteria_name : "Undefined",
            description: matchingTestCriteria ? matchingTestCriteria.description : "No description available",
            norm: testCriteria.criterias.map((criteria: any) => ({
              id: criteria.id,
              criteria_name: criteria.criteria_name,
              minimum_score: Number(criteria.minimum_score),
              maximum_score: Number(criteria.maximum_score),
            })),
          };

          // Create the detailed test object
          const detailTest = {
            category_id: category.id,
            category_name: category.name,
            category_code: category.code,
            test_id: test.id,
            test_name: test.name,
            test_code: test.code,
            taken_at: new Date().toISOString(),
            summary_type: test.summary_type,
            summary_view: test.summary_view,
            summary_formula: test.summary_formula,
            result: testResult,
            subtests: processedSubtests,
          };

          detailResults.push(detailTest);
        } else if (test.summary_type === "category") {
          // Fetch all categories for this test
          const fetchedCategoryResults = await getPersonalReportData(batchId, assesseeEmail, "category", test.id);

          if (!Array.isArray(fetchedCategoryResults)) {
            throw new Error("Expected array from getPersonalReportData for category");
          }

          // Process categories for this test
          const processedCategories = await Promise.all(
            fetchedCategoryResults.map(async (item) => {
              const categoryId = item.category_id;
              if (!categoryId) {
                throw new Error("Missing category_id in category result");
              }

              // Get criteria for this category
              const criteriaCategory = await getCategoryCriteriaReport(categoryId);

              // Convert category_point to number
              const categoryPoint = Number(item.category_point) || 0;

              // Find matching criteria based on score
              let matchingCriteria = null;
              if (criteriaCategory && Array.isArray(criteriaCategory.criterias)) {
                matchingCriteria = criteriaCategory.criterias.find((criteria) => {
                  const min = Number(criteria.minimum_score) || 0;
                  const max = Number(criteria.maximum_score) || Infinity;
                  return categoryPoint >= min && categoryPoint <= max;
                });
              }

              return {
                category_id: item.category_id,
                category_name: item.category_name || "Unknown Category",
                category_code: item.category_code || "",
                category_point: categoryPoint,
                description: matchingCriteria ? matchingCriteria.description : "No matching criteria found",
                color: matchingCriteria ? matchingCriteria.hex_code : "#CCCCCC",
              };
            })
          );

          // Create a subtest entry for category-based test
          const subtest = {
            subtest_id: test.id, // Using test ID as subtest ID for simplicity
            subtest_name: test.name,
            subtest_code: test.code,
            result: {
              subtest_point: null,
              subtest_criteria: null,
              criteria_color: null,
              categories: processedCategories,
            },
          };

          // Create the detailed test object
          const detailTest = {
            test_id: test.id,
            test_name: test.name,
            test_code: test.code,
            taken_at: new Date().toISOString(),
            summary_type: test.summary_type,
            summary_view: test.summary_view,
            summary_formula: test.summary_formula,
            result: {
              test_point: null,
              criteria: null,
              description: null,
            },
            norm: [],
            subtests: [subtest],
          };

          detailResults.push(detailTest);
        } else {
          throw new ResponseError(400, "Invalid summary type in test");
        }
      }
    }

    // Generate final report data
    const reportData = {
      profile: {
        ...assesseeProfile,
        test_date: new Date().toLocaleDateString("id-ID"),
      },
      guide: {
        content: guide.content,
      },
      batch: {
        name: batch.name,
        code: batch.code || `${batch.type.toUpperCase()}/${batch.id}`,
      },
      intro: introResults,
      detail: detailResults,
    };

    res.status(200).send({
      message: "Success!",
      data: reportData,
    });
  } catch (e) {
    next(e);
  }
};

// export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("masuk coys");
//     const batchId = req.body.batch_id;
//     const assesseeId = req.body.assessee_id;
//     const assesseeEmail = req.body.assessee_email;
//
//     // Get Report Guide
//     const guideId = REPORT_GUIDE_ID;
//     const guide = await getReportGuide(guideId);
//     console.log(guide);
//
//     // Cek batch type
//     const { batch } = await getBatchDetail(batchId);
//
//     // Get Profilenya
//     const assessee =
//       batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);
//
//     console.log(assessee);
//
//     const assesseeProfile = {
//       assessee_name: assessee.assessee_name,
//       assessee_age: assessee.assessee_age,
//       assessee_gender: assessee.assessee_gender,
//       work_location: assessee.work_location,
//     };
//
//     const batchInformation = await getBatchInformationForReport(batchId);
//     const design = await getReportDesignDetail(batchId);
//     // Transform the response to the desired format
//     const reportDesign = transformResponseFormat(batchInformation, design);
//
//     // Memproses data berdasarkan kategori dan subtest
//     const categoryResults: any = [];
//
//     // Loop melalui semua kategori dalam reportDesign
//     for (const category of reportDesign.categories) {
//       const categoryData: any = {
//         category_test_id: category.id,
//         category_test_name: category.name,
//         category_test_code: category.code,
//         tests: [],
//       };
//
//       // Loop melalui semua test dalam kategori
//       for (const test of category.tests) {
//         let testResult;
//
//         // Check summary type untuk menentukan jenis data yang diambil
//         if (test.summary_type === "subtest") {
//           console.log("cek test");
//           console.log(test);
//
//           // Dapatkan data report untuk subtest
//           const subtestResultsArray: any = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.id);
//           console.log("cek subtest result");
//           console.log(subtestResultsArray);
//
//           // Proses setiap subtest dan cocokkan dengan kriteria yang sesuai
//           const processedSubtests = [];
//
//           for (const subtestResult of subtestResultsArray) {
//             // Dapatkan kriteria untuk subtest
//             const subtestCriteria: any = await getCriteriaForReport(subtestResult.criteria_id);
//             console.log("cek subtest criteria 1");
//             console.log(subtestCriteria);
//             // Nilai subtest_point bisa berupa string, konversi ke number
//             const subtestPoint = Number(subtestResult.subtest_point) || 0;
//
//             // Temukan kriteria yang cocok berdasarkan nilai subtest_point
//             const matchingCriteria = subtestCriteria.criterias.find((criteria: any) => {
//               return subtestPoint >= Number(criteria.minimum_score) && subtestPoint <= Number(criteria.maximum_score);
//             });
//
//             processedSubtests.push({
//               subtest_id: subtestResult.subtest_id,
//               subtest_name: subtestResult.subtest_name,
//               subtest_code: subtestResult.subtest_code,
//               description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.", // Bisa diganti dengan deskripsi dari API jika tersedia
//               result: {
//                 subtest_point: subtestPoint,
//                 subtest_criteria: matchingCriteria ? matchingCriteria.criteria_name : "Undefined",
//                 criteria_color: matchingCriteria ? matchingCriteria.hex_code : "#CCCCCC",
//                 categories: [], // Sesuai dengan struktur yang diinginkan
//               },
//             });
//           }
//
//           console.log("coba masuk sini");
//           // Dapatkan kriteria test untuk menentukan hasil keseluruhan test
//           const testCriteria: any = await getTestCriteria(test.id);
//           console.log(testCriteria);
//           console.log("test criteria");
//           // Hitung total skor berdasarkan summary_formula
//           let testPoint = 0;
//           if (test.summary_formula === "sum") {
//             testPoint = processedSubtests.reduce((total: number, subtest: any) => {
//               return total + subtest.result.subtest_point;
//             }, 0);
//           } else if (test.summary_formula === "average") {
//             testPoint =
//               processedSubtests.reduce((total: number, subtest: any) => {
//                 return total + subtest.result.subtest_point;
//               }, 0) / processedSubtests.length || 1; // Prevent division by zero
//           }
//
//           // Temukan kriteria test yang sesuai dengan testPoint
//           const matchingTestCriteria = testCriteria.criterias.find((criteria: any) => {
//             return testPoint >= Number(criteria.minimum_score) && testPoint <= Number(criteria.maximum_score);
//           });
//
//           testResult = {
//             test_point: testPoint,
//             criteria: matchingTestCriteria ? matchingTestCriteria.criteria_name : "Undefined",
//             description: matchingTestCriteria ? matchingTestCriteria.description : "No description available",
//             norm: testCriteria.criterias.map((criteria: any) => ({
//               id: criteria.id,
//               criteria_name: criteria.criteria_name,
//               minimum_score: Number(criteria.minimum_score),
//               maximum_score: Number(criteria.maximum_score),
//             })),
//             subtests: processedSubtests,
//           };
//         } else if (test.summary_type === "category") {
//           console.log("Processing test with category summary type:", test.name);
//
//           // Fetch all categories for this test
//           const fetchedCategoryResults: any = await getPersonalReportData(batchId, assesseeEmail, "category", test.id);
//           console.log("Raw category results:", fetchedCategoryResults);
//
//           // Validate if response is an array
//           if (!Array.isArray(fetchedCategoryResults)) {
//             throw new Error("Expected array from getPersonalReportData for category");
//           }
//
//           // Process each category in the array
//           const processedCategories = await Promise.all(
//             fetchedCategoryResults.map(async (item) => {
//               // Ensure category_id is available
//               const categoryId = item.category_id;
//               if (!categoryId) {
//                 throw new Error("Missing category_id in category result");
//               }
//
//               console.log(`Processing category ID: ${categoryId}, Name: ${item.category_name}`);
//
//               // Get criteria for this category
//               const criteriaCategory = await getCategoryCriteriaReport(categoryId);
//               console.log(`Criteria for category ${categoryId}:`, criteriaCategory);
//
//               // Ensure criteriaCategory has a "criterias" property
//               if (!criteriaCategory || !Array.isArray(criteriaCategory.criterias)) {
//                 console.warn(`No criteria found for category ${categoryId}, using default values`);
//                 return {
//                   category_id: item.category_id,
//                   category_name: item.category_name || "Unknown Category",
//                   category_code: item.category_code || "",
//                   category_point: Number(item.category_point) || 0,
//                   description: "No criteria defined for this category",
//                   color: "#CCCCCC", // Default gray color
//                 };
//               }
//
//               // Convert category_point to Number
//               const categoryPoint = Number(item.category_point) || 0;
//
//               // Find matching criteria based on score
//               const matchingCriteria = criteriaCategory.criterias.find((criteria: any) => {
//                 const min = Number(criteria.minimum_score) || 0;
//                 const max = Number(criteria.maximum_score) || Infinity;
//                 return categoryPoint >= min && categoryPoint <= max;
//               });
//
//               // Return object with description and color from matching criteria
//               return {
//                 category_id: item.category_id,
//                 category_name: item.category_name || "Unknown Category",
//                 category_code: item.category_code || "",
//                 category_point: categoryPoint,
//                 description: matchingCriteria ? matchingCriteria.description : "No matching criteria found",
//                 color: matchingCriteria ? matchingCriteria.hex_code : "#CCCCCC", // Default color if no match
//                 criteria_details: matchingCriteria || null, // Include full criteria details if needed
//               };
//             })
//           );
//
//           // Save final result with all processed categories
//           testResult = {
//             categories: processedCategories,
//           };
//         } else {
//           throw new ResponseError(400, "There's invalid summary type in a test");
//         }
//
//         const testData = {
//           category_id: test.category_id, // Changed from category.id to test.category_id
//           category_name: test.category_name, // Changed from category.name
//           category_code: test.category_code, // Changed from category.code
//           test_id: test.id,
//           test_name: test.name,
//           test_code: test.code,
//           taken_at: new Date().toISOString(),
//           summary_type: test.summary_type,
//           summary_view: test.summary_view,
//           summary_formula: test.summary_formula,
//           result: testResult,
//         };
//
//         categoryResults.push(testData);
//       }
//
//       // Generate report dengan data profil dan hasil test
//       const reportData = {
//         report_guide: {
//           content: guide.content,
//         },
//         profile: {
//           ...assesseeProfile,
//           test_date: new Date().toLocaleDateString("id-ID"),
//         },
//         detail: categoryResults,
//       };
//
//       res.status(200).send({
//         message: "Success!",
//         data: reportData,
//       });
//     }
//   } catch (e) {
//     next(e);
//   }
// };

// export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("masuk coys");
//     const batchId = req.body.batch_id;
//     const assesseeId = req.body.assessee_id;
//     const assesseeEmail = req.body.assessee_email;
//
//     // Get Report Guide
//     const guideId = REPORT_GUIDE_ID;
//     const guide = await getReportGuide(guideId);
//     console.log(guide);
//
//     // Cek batch type
//     const { batch } = await getBatchDetail(batchId);
//
//     // Get Profilenya
//     const assessee =
//       batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);
//
//     console.log(assessee);
//
//     const assesseeProfile = {
//       assessee_name: assessee.assessee_name,
//       assessee_age: assessee.assessee_age,
//       assessee_gender: assessee.assessee_gender,
//       work_location: assessee.work_location,
//     };
//
//     const batchInformation = await getBatchInformationForReport(batchId);
//     const design = await getReportDesignDetail(batchId);
//     // Transform the response to the desired format
//     const reportDesign = transformResponseFormat(batchInformation, design);
//
//     // Memproses data berdasarkan kategori dan subtest
//     const categoryResults: any = [];
//
//     let detail;
//
//     // Loop melalui semua kategori dalam reportDesign
//     for (const category of reportDesign.categories) {
//       const categoryData: any = {
//         category_test_id: category.id,
//         category_test_name: category.name,
//         category_test_code: category.code,
//         tests: [],
//       };
//
//       // Loop melalui semua test dalam kategori
//       for (const test of category.tests) {
//         let testResult;
//
//         // Check summary type untuk menentukan jenis data yang diambil
//         if (test.summary_type === "subtest") {
//           console.log("cek test");
//           console.log(test);
//           // Dapatkan data report untuk subtest
//           /*
//           [
//   {
//     batch_id: '0196e6ab-81e3-7110-8519-e342df7968c6',
//     grouptest_id: '808f0c0d-bfca-4489-8f2f-ee33cae7c9b1',
//     test_id: '50b2e9e8-5601-4e53-b2ed-e0bd5455aa90',
//     test_name: 'Kognitif Test 13 Mei',
//     test_code: 'KGT13MEI',
//     subtest_id: '47ea2220-4bf9-4a0d-bc6e-a1342e388b19',
//     subtest_name: 'Matematika Dasar Subtest 13 Mei',
//     subtest_code: 'MTKD13MEI',
//     criteria_id: null,
//     assessee_name: 'Muhammad Ilham Hakim',
//     assessee_email: 'muhammadilhamhakimsuherman@gmail.com',
//     assessee_nik: '0196c7b3-d9d6-7331-8f13-e335696f6aed',
//     progress_head_id: '0196e6ab-8567-7110-851a-3a8a3497efea',
//     assessee_id: '0196c7b3-d9d6-7331-8f13-e335696f6aed',
//     det_id: '0196e6ac-2a57-7110-851a-505ef2b0a506',
//     taken_test_id: '50b2e9e8-5601-4e53-b2ed-e0bd5455aa90',
//     taken_subtest_id: '47ea2220-4bf9-4a0d-bc6e-a1342e388b19',
//     status: 'Completed',
//     taken_at: 2025-05-20T06:46:13.367Z,
//     should_be_finished_at: 2025-05-20T07:46:13.367Z,
//     submit_at: 2025-05-20T06:46:23.314Z,
//     subtest_point: '20',
//     test_point: '20'
//   }
// ]
//           * */
//           console.log(test);
//           const subtestResults: any = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.id);
//           console.log("cek subtest result");
//           console.log(subtestResults);
//           /*
//           [
//   {
//     batch_id: '0196e6ab-81e3-7110-8519-e342df7968c6',
//     grouptest_id: '808f0c0d-bfca-4489-8f2f-ee33cae7c9b1',
//     test_id: '50b2e9e8-5601-4e53-b2ed-e0bd5455aa90',
//     test_name: 'Kognitif Test 13 Mei',
//     test_code: 'KGT13MEI',
//     subtest_id: '47ea2220-4bf9-4a0d-bc6e-a1342e388b19',
//     subtest_name: 'Matematika Dasar Subtest 13 Mei',
//     subtest_code: 'MTKD13MEI',
//     criteria_id: '3e18c96c-f4a9-49ef-aec9-ad3f28d59b86',
//     assessee_name: 'Muhammad Ilham Hakim',
//     assessee_email: 'muhammadilhamhakimsuherman@gmail.com',
//     assessee_nik: '0196c7b3-d9d6-7331-8f13-e335696f6aed',
//     progress_head_id: '0196e6ab-8567-7110-851a-3a8a3497efea',
//     assessee_id: '0196c7b3-d9d6-7331-8f13-e335696f6aed',
//     det_id: '0196e6ac-2a57-7110-851a-505ef2b0a506',
//     taken_test_id: '50b2e9e8-5601-4e53-b2ed-e0bd5455aa90',
//     taken_subtest_id: '47ea2220-4bf9-4a0d-bc6e-a1342e388b19',
//     status: 'Completed',
//     taken_at: 2025-05-20T06:46:13.367Z,
//     should_be_finished_at: 2025-05-20T07:46:13.367Z,
//     submit_at: 2025-05-20T06:46:23.314Z,
//     subtest_point: '20',
//     test_point: '20'
//   }
// ]
//
//           * */
//           // Olah subtest pada test satu per satu
//           subtest_point: subtestResults.subtest_points = subtestResults.subtest_points ? subtestResults : 0;
//           // Dapatkan kriteria untuk subtest
//           const subtestCriteria: any = await getSubtestCriteria(subtestResults.criteria_id);
//
//           // Proses setiap subtest dan cocokkan dengan kriteria yang sesuai
//           const processedSubtests = subtestResults.subtests.map((subtest: any) => {
//             // Temukan kriteria yang cocok berdasarkan nilai subtest_point
//             const matchingCriteria = subtestCriteria.criteria.find((criteria: any) => {
//               return subtest.subtest_point >= criteria.minimum_score && subtest.subtest_point <= criteria.maximum_score;
//             });
//
//             return {
//               subtest_id: subtest.subtest_id,
//               subtest_name: subtest.subtest_name,
//               subtest_code: subtest.subtest_code,
//               result: {
//                 subtest_point: subtest.subtest_point,
//                 subtest_criteria: matchingCriteria ? matchingCriteria.criteria_name : "Undefined",
//                 criteria_color: matchingCriteria ? matchingCriteria.hex_code : "#CCCCCC",
//                 description: matchingCriteria ? matchingCriteria.description : "No description available",
//               },
//             };
//           });
//
//           // Dapatkan kriteria test untuk menentukan hasil keseluruhan test
//           //   const testCriteria = await getTestCriteria(test.id);
//           //
//           //   // Hitung total skor berdasarkan summary_formula
//           //   let testPoint = 0;
//           //   if (test.summary_formula === "sum") {
//           //     testPoint = processedSubtests.reduce((total: number, subtest: any) => {
//           //       return total + subtest.result.subtest_point;
//           //     }, 0);
//           //   } else if (test.summary_formula === "average") {
//           //     testPoint =
//           //       processedSubtests.reduce((total: number, subtest: any) => {
//           //         return total + subtest.result.subtest_point;
//           //       }, 0) / processedSubtests.length;
//           //   }
//           //
//           //   // Temukan kriteria test yang sesuai dengan testPoint
//           //   const matchingTestCriteria = testCriteria.find((criteria: any) => {
//           //     return testPoint >= criteria.minimum_score && testPoint <= criteria.maximum_score;
//           //   });
//           //
//           //   testResult = {
//           //     test_point: testPoint,
//           //     result_criteria: matchingTestCriteria ? matchingTestCriteria.criteria_name : "Undefined",
//           //     description: matchingTestCriteria ? matchingTestCriteria.description : "No description available",
//           //     norm: testCriteria.map((criteria: any) => ({
//           //       criteria_name: criteria.criteria_name,
//           //       minimum_score: criteria.minimum_score,
//           //       maximum_score: criteria.maximum_score,
//           //       color: criteria.hex_code,
//           //     })),
//           //     subtests: processedSubtests,
//           //   };
//           // } else if (test.summary_type === "category") {
//           //   // Dapatkan data report untuk kategori
//           //   const categoryResults: any = await getPersonalReportData(batchId, assesseeEmail, "category", test.id);
//           //
//           //   // Format for category type is different from subtest type
//           //   const processedCategories = categoryResults.categories.map((category: any) => {
//           //     return {
//           //       category_id: category.category_id,
//           //       category_name: category.category_name,
//           //       category_code: category.category_code,
//           //       category_point: category.category_point,
//           //       description: category.description,
//           //       color: category.hex_code,
//           //     };
//           //   });
//           //
//           //   testResult = {
//           //     categories: processedCategories,
//           //   };
//         } else {
//           throw new ResponseError(400, "There's invalid summary type in a test");
//         }
//
//         const testData = {
//           test_id: test.id,
//           test_name: test.name,
//           test_code: test.code,
//           test_description: test.description || "Deskripsi test",
//           summary_type: test.summary_type,
//           summary_formula: test.summary_formula,
//           summary_view: test.summary_view,
//           result: testResult,
//         };
//
//         categoryData.tests.push(testData);
//       }
//
//       categoryResults.push(categoryData);
//     }
//
//     // Generate report dengan data profil dan hasil test
//     const reportData = {
//       report_guide: {
//         content: guide.content,
//       },
//       profile: {
//         ...assesseeProfile,
//         test_date: new Date().toLocaleDateString("id-ID"),
//       },
//       results: categoryResults,
//     };
//
//     res.status(200).send({
//       message: "Success!",
//       data: reportData,
//     });
//   } catch (e) {
//     next(e);
//   }
// };

// export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log("masuk coys");
//     const batchId = req.body.batch_id;
//     const assesseeId = req.body.assessee_id;
//     const assesseeEmail = req.body.assessee_email;
//     // Get Report Guide
//     const guideId = REPORT_GUIDE_ID;
//     const guide = await getReportGuide(guideId);
//     console.log(guide);
//     // Cek batch type
//     const { batch } = await getBatchDetail(batchId);
//     // Get Profilenya
//     const assessee: any =
//       batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);
//
//     console.log(assessee);
//
//     const assesseeProfile = {
//       assessee_name: assessee.assessee_name,
//       assessee_age: assessee.assessee_age,
//       assessee_gender: assessee.assessee_gender,
//       work_location: assessee.work_location,
//     };
//
//     // Cek report design Detail
//     const reportDesign = await getReportDesignDetail(batchId);
//     console.log("Cek report design");
//     console.log(reportDesign);
//     /*
//     {
//     "message": "Success!",
//     "data": {
//         "batch": {
//             "name": "Report Personal Testing 19 Mei 1",
//             "code": "OD/DWS/MAY/2025/23"
//         },
//         "categories": [
//             {
//                 "id": 37,
//                 "name": "Kognitif",
//                 "code": "KOGS",
//                 "summary_view": "bar",
//                 "summary_type": "summary",
//                 "summary_formula": "sum",
//                 "tests": [
//                     {
//                         "id": "50b2e9e8-5601-4e53-b2ed-e0bd5455aa90",
//                         "name": "Kognitif Test 13 Mei",
//                         "code": "KGT13MEI",
//                         "summary_view": "bar",
//                         "summary_type": "subtest",
//                         "summary_formula": "sum"
//                     }
//                 ],
//                 "testCount": 1
//             },
//             {
//                 "id": 35,
//                 "name": "Personality",
//                 "code": "PERSONALITY",
//                 "summary_view": "bar",
//                 "summary_type": "summary",
//                 "summary_formula": "sum",
//                 "tests": [
//                     {
//                         "id": "c760f05c-d156-468d-a8f3-7fb0a86753e5",
//                         "name": "Personality Test 13 Mei",
//                         "code": "PT13MEI",
//                         "summary_view": "bar",
//                         "summary_type": "category",
//                         "summary_formula": "sum"
//                     }
//                 ],
//                 "testCount": 1
//             },
//             {
//                 "id": 28,
//                 "name": "Ini Category Name May25",
//                 "code": "NOEL",
//                 "summary_view": "bar",
//                 "summary_type": "summary",
//                 "summary_formula": "sum",
//                 "tests": [
//                     {
//                         "id": "bb15b5bf-f59d-42f8-83fa-9a005a445404",
//                         "name": "TEST 2 7 MEI2025",
//                         "code": "7MEI20252",
//                         "summary_view": "bar",
//                         "summary_type": "subtest",
//                         "summary_formula": "sum"
//                     },
//                     {
//                         "id": "8750d642-337c-405e-957b-c805ea7fe678",
//                         "name": "TEST 1 7 MEI2025",
//                         "code": "7MEI20251",
//                         "summary_view": "bar",
//                         "summary_type": "subtest",
//                         "summary_formula": "sum"
//                     }
//                 ],
//                 "testCount": 2
//             },
//             {
//                 "id": 29,
//                 "name": "Contoh KPT",
//                 "code": "CKPT",
//                 "summary_view": "bar",
//                 "summary_type": "summary",
//                 "summary_formula": "sum",
//                 "tests": [
//                     {
//                         "id": "454b50b8-6ac2-43ad-a681-a28f148b4768",
//                         "name": "test subtest wo duration",
//                         "code": "TWOS",
//                         "summary_view": "bar",
//                         "summary_type": "subtest",
//                         "summary_formula": "sum"
//                     }
//                 ],
//                 "testCount": 1
//             }
//         ]
//     }
// }
//
//     // // Cek dulu apakah test tersebut summarynya by
//     // * */
//     // if (reportDesign.detail.test.summary_type === "subtest") {
//     //   const resultBySubtest = await getPersonalReportData(batchId, assesseeEmail, "subtest");
//     //   console.log("result by subtest");
//     //   console.log(resultBySubtest);
//     //
//     // } else if ()
//     //
//     // console.log("result by category");
//     // const resultByCategory = await getPersonalReportData(batchId, assesseeEmail, "category");
//     // console.log(resultByCategory);
//     // /*
//
//     // * */
//     // // const reportDataBySubtest = await gePersonalReportBySubtest
//     // {
//     // }
//     // // Cek ada test apa aja
//     // {
//     // }
//     // // Cek tipe summarynya apa
//     // // Kalo by Subtest dia ambil getBySubtest
//     // // Kelola by formulanya
//     // // Dapatkan hasilnya
//     // // Ambil criteria subtestnya
//     // // Cocokkan batasannya
//     //
//     // {
//     //   category_test_id: 1;
//     //   category_test_name: 1;
//     //   category_test_code: 1;
//     //   test_id: 1;
//     //   test_name: 1;
//     //   test_code: "abc";
//     //   result: {
//     //     test_point: 80;
//     //     result_criteria: "High";
//     //     description: "Mendapatkan skor tinggi";
//     //   }
//     //   norm: [
//     //     {
//     //       criteria_name: "Low",
//     //       min_value: 0,
//     //       max_value: 30,
//     //     },
//     //     {
//     //       criteria_name: "Mid",
//     //       min_value: 31,
//     //       max_value: 60,
//     //     },
//     //     {
//     //       criteria_name: "High",
//     //       min_value: 61,
//     //       max_value: 100,
//     //     },
//     //   ];
//     //   subtests: [
//     //     {
//     //       subtest_id: "uuid",
//     //       subtest_name: "Subtest 1",
//     //       subtest_code: "ABC",
//     //       result: {
//     //         subtest_point: 50,
//     //         subtest_criteria: "Medium",
//     //         criteria_color: "hex_code",
//     //       },
//     //     },
//     //     {
//     //       subtest_id: "uuid",
//     //       subtest_name: "Subtest 1",
//     //       subtest_code: "ABC",
//     //       result: {
//     //         subtest_point: 30,
//     //         subtest_criteria: "Medium",
//     //         criteria_color: "hex_code",
//     //       },
//     //     },
//     //   ];
//     // }
//
//     //Kalo dia by category
//     // ambil getByCategory
//     // Ambil category
//     // Ambil criteria tiap category
//     // Cocokkan hasilnya
//     {
//       category_test_id: 1;
//       category_test_name: 1;
//       category_test_code: 1;
//       test_id: 1;
//       test_name: 1;
//       test_code: "abc";
//       test_description: "Ini Test";
//       result: {
//         test_point: 80;
//         result_criteria: "High";
//         description: "Mendapatkan skor tinggi";
//       }
//       subtests: [
//         {
//           subtest_id: "uuid",
//           subtest_name: "Subtest",
//           subtest_code: "Subtest Code",
//           result: [
//             {
//               category_id: 1,
//               category_name: "Openness",
//               category_code: "O",
//               category_point: 20,
//               description: "Orang ini open banget",
//             },
//             {
//               category_id: 2,
//               category_name: "C",
//               category_code: "C",
//               category_point: 20,
//               description: "Orang ini ceria banget",
//             },
//             {
//               category_id: 3,
//               category_name: "E",
//               category_code: "E",
//               category_point: 20,
//               description: "Orang ini ember bocor banget",
//             },
//           ],
//         },
//       ];
//     }
//     // // Generate intronya
//     // const report = await report;
//     // Generate dahulu detailnya
//
//     res.status(200).send({
//       message: `Success!`,
//       data: {
//         // subtest: resultBySubtest,
//         // category: resultByCategory,
//       },
//       // data: {
//       //   report_guide: {
//       //     content: guide.content,
//       //   },
//       //   profile: {
//       //     assessee_name: "John Doe",
//       //     assessee_age: 22,
//       //     assessee_gender: "Male",
//       //     test_date: "15/05/2025",
//       //     work_location: "KPN Corp",
//       //   },
//       //   intro: {},
//       //   detail: {},
//       // //   proctoring: {},
//       // //   log: {},
//       // },
//     });
//   } catch (e) {
//     throw e;
//   }
// };

/*
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
    const assessee =
      batch.type === "internal" ? await getDarwinUser(assesseeId) : await getAssesseeExternalProfile(assesseeEmail);

    console.log(assessee);

    const assesseeProfile = {
      assessee_name: assessee.assessee_name,
      assessee_age: assessee.assessee_age,
      assessee_gender: assessee.assessee_gender,
      work_location: assessee.work_location,
    };

    const batchInformation = await getBatchInformationForReport(batchId);
    const design = await getReportDesignDetail(batchId);
    // Transform the response to the desired format
    const reportDesign = transformResponseFormat(batchInformation, design);
    // Memproses data berdasarkan kategori dan subtest
    const categoryResults: any = [];

    // Loop melalui semua kategori dalam reportDesign
    for (const category of reportDesign.categories) {
      const categoryData: any = {
        category_test_id: category.id,
        category_test_name: category.name,
        category_test_code: category.code,
        tests: [],
      };

      // Loop melalui semua test dalam kategori
      for (const test of category.tests) {
        let testResult;

        // Check summary type untuk menentukan jenis data yang diambil
        if (test.summary_type === "subtest") {
          testResult = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.id);
          // Cek setiap subtestnya
          const subtestCriteria = getCriteriaDetail();
          // Hasil subtestCriteria
          {
            "value_code": "SCT",
            "value_name": "Subtest Criteria Testing",
            "value_id": "3e18c96c-f4a9-49ef-aec9-ad3f28d59b86",
            "criteria": [
                {
                    "id": "44d6f659-510e-4618-b0d9-1ca4e9463bd7",
                    "category_fk": "3e18c96c-f4a9-49ef-aec9-ad3f28d59b86",
                    "criteria_name": "Low",
                    "minimum_score": 0,
                    "maximum_score": 40,
                    "is_active": null,
                    "created_by": "99910a5d-f29b-46d7-b1ed-c2a08ce232e2",
                    "created_date": "2025-05-20",
                    "updated_by": null,
                    "updated_date": null,
                    "description": "Subtest Criteria Testing (LOW)",
                    "color_id": 3,
                    "color_name": "Red",
                    "hex_code": "#FF0000"
                },
                {
                    "id": "ec30e498-45a9-469f-aa7f-d91f0086df9c",
                    "category_fk": "3e18c96c-f4a9-49ef-aec9-ad3f28d59b86",
                    "criteria_name": "Middle",
                    "minimum_score": 41,
                    "maximum_score": 75,
                    "is_active": null,
                    "created_by": "99910a5d-f29b-46d7-b1ed-c2a08ce232e2",
                    "created_date": "2025-05-20",
                    "updated_by": null,
                    "updated_date": null,
                    "description": "Subtest Criteria Testing (MID)",
                    "color_id": 6,
                    "color_name": "Yellow",
                    "hex_code": "#FFFF00"
                },
                {
                    "id": "96a3e5fc-008b-421c-8017-cf32333d828b",
                    "category_fk": "3e18c96c-f4a9-49ef-aec9-ad3f28d59b86",
                    "criteria_name": "High",
                    "minimum_score": 76,
                    "maximum_score": 100,
                    "is_active": null,
                    "created_by": "99910a5d-f29b-46d7-b1ed-c2a08ce232e2",
                    "created_date": "2025-05-20",
                    "updated_by": null,
                    "updated_date": null,
                    "description": "Subtest Criteria Testing (HIGH)",
                    "color_id": 4,
                    "color_name": "Lime",
                    "hex_code": "#00FF00"
                }
            ]
        },

          //Periksa subtest pointnya di criteria yang mana, dapatkan criteria_name, color_name, dan hex_codenya saja
          if (subtest_point > subtestCriteria

          // Kalau subtestnya sudah selesai sekarang dapatkan data-data testnya

          {
            category_test_id: 1;
            category_test_name: 1;
            category_test_code: 1;
            test_id: 1;
            test_name: 1;
            test_code: "abc";
            summary_type: "subtest",
            summary_formula: "sum",
            summary_view: "bar",
            result: {
              test_point: 80;
              result_criteria: "High";
              description: "Mendapatkan skor tinggi";
            }
            norm: [
              {
                criteria_name: "Low",
                minimum_score: 0,
                minimum_score: 30,
              },
              {
                criteria_name: "Mid",
                minimum_score: 31,
                minimum_score: 60,
              },
              {
                criteria_name: "High",
                minimum_score: 61,
                minimum_score: 100,
              },
            ];
            subtests: [
              {
                subtest_id: "uuid",
                subtest_name: "Subtest 1",
                subtest_code: "ABC",
                result: {
                  subtest_point: 50,
                  subtest_criteria: "Medium",
                  criteria_color: "hex_code",
                },
              },
              {
                subtest_id: "uuid",
                subtest_name: "Subtest 1",
                subtest_code: "ABC",
                result: {
                  subtest_point: 30,
                  subtest_criteria: "Medium",
                  criteria_color: "hex_code",
                },
              },
            ];
          }
        } else if (test.summary_type === "category") {
          testResult = await getPersonalReportData(batchId, assesseeEmail, "category", test.id);
        } else {
          throw new ResponseError(400, "There's invalid summary type in a test")
        }

        const testData = {
          test_id: test.id,
          test_name: test.name,
          test_code: test.code,
          test_description: "Deskripsi test",
          result: testResult,
          summary_view: test.summary_view,
          summary_formula: test.summary_formula,
        };

        categoryData.tests.push(testData);
      }

      categoryResults.push(categoryData);
    }

    // Generate report dengan data profil dan hasil test
    const reportData = {
      report_guide: {
        content: guide.content,
      },
      profile: {
        ...assesseeProfile,
        test_date: new Date().toLocaleDateString("id-ID"),
      },
      results: categoryResults,
    };

    res.status(200).send({
      message: "Success!",
      data: reportData,
    });
  } catch (e) {
    next(e);
  }
};

* */

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
