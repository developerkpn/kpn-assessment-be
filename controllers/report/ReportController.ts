import { Request, Response, NextFunction } from "express";
import {
  assignReportDesign,
  generateReportForWholeBatch,
  getAssesseeListForReport,
  getBatchInformationForReport,
  getCategoryCriteriaModel,
  getGenerateStatus,
  getIntroData,
  getPersonalReportData,
  getReportDesignDetail,
  getReportDetail,
  getReportGuide,
  getReportProctoring,
  getSpecificBatchInformationForReport,
  getTestCriteriaModel,
  storeReportGuide,
  storeReportPDF,
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
import moment from "moment";
import { getSubTestDetail } from "#dep/models/SubTestModel";
import path from "path";
import fs from "fs";
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
    const guide = await getReportGuide();
    res.status(200).send({
      message: "Success!",
      data: guide,
    });
  } catch (e) {
    next(e);
  }
};

export const handleStoreReportGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      id: uuid(),
      content: req.body.content,
      created_at: new Date().toISOString(),
    };

    await storeReportGuide(payload);
    res.status(201).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

export const handleUpdateReportGuide = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reportGuideId = req.params.id;
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
    console.log("alltest", allTests);
    const getReportIntro: any = await getIntroData(batchId);
    const getReportDetail: any = await getReportDesignDetail(batchId);

    // Pastikan bentuknya array
    // const getReportIntro: any[] = Array.isArray(getReportIntroRaw) ? getReportIntroRaw : [];
    // const getReportDetail: any[] = Array.isArray(getReportDetailRaw) ? getReportDetailRaw : [];

    const testsByCategory: any = {
      uncategorized: {
        name: "Uncategorized",
        code: "uncategorized",
        tests: [],
      },
    };

    const groupedTests: Record<string, Record<string, any>> = {};

    allTests.forEach((test) => {
      const categoryCode = test.category_code || "uncategorized";
      const testId = test.test_id;

      if (!groupedTests[categoryCode]) {
        groupedTests[categoryCode] = {};
      }

      if (!groupedTests[categoryCode][testId]) {
        groupedTests[categoryCode][testId] = {
          id: testId, // ini harus sama persis dengan yang ada di getReportDetail
          name: test.test_name,
          code: test.test_code,
          subtests: [],
        };
      }

      groupedTests[categoryCode][testId].subtests.push({
        id: test.subtest_id,
        name: test.subtest_name,
        code: test.subtest_code,
        is_criteria: test.is_criteria,
      });
    });

    for (const [categoryCode, testsMap] of Object.entries(groupedTests)) {
      if (categoryCode === "uncategorized" && Object.keys(testsMap).length === 0) continue;

      const categoryInfo = allTests.find((t) => t.category_code === categoryCode);
      const categoryId = categoryInfo?.category_id || null;

      // Ambil summary berdasarkan category_id dari getReportIntro
      const categorySummary = getReportIntro.find((intro: any) => intro.category_id === categoryId);

      console.log("map test", Object.values(testsMap));
      console.log("getReportdetails", getReportDetail);
      const tests = Object.values(testsMap).map((test: any) => {
        const detail = getReportDetail.intro.find((d: any) => d.test_id === test.id);

        return {
          ...test,
          summary_type: detail?.summary_type || null,
          summary_view: detail?.summary_view || null,
          summary_formula: detail?.summary_formula || null,
        };
      });

      console.log("testmap", testsMap);

      testsByCategory[categoryCode] = {
        id: categoryId,
        name: categoryInfo?.category_name || "Uncategorized",
        code: categoryCode,
        tests,
        testCount: Object.keys(testsMap).length,
        summary_type: categorySummary?.summary_type || null,
        summary_view: categorySummary?.summary_view || null,
        summary_formula: categorySummary?.summary_formula || null,
      };
    }

    if (testsByCategory["uncategorized"].tests.length === 0) {
      delete testsByCategory["uncategorized"];
    }

    const categories = Object.values(testsByCategory);

    const batchInfo =
      allTests.length > 0
        ? {
            name: allTests[0].batch_name,
            code: allTests[0].batch_code,
          }
        : {};

    console.log("getReportIntro", getReportIntro);

    res.status(200).send({
      message: "Success!",
      data: {
        guide: {
          content: getReportIntro[0].content,
        },
        batch: batchInfo,
        categories,
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
      content: body.content,
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

const transformResponseFormat = async (batchInfo: any, reportDesign: any) => {
  if (!batchInfo || !batchInfo.length) {
    return { batch: {}, categories: [] };
  }

  // Extract batch information from the first item
  const firstBatch = batchInfo[0];
  const transformedBatch: any = {
    guide: {
      content: reportDesign.intro[0].content,
    },
    batch: {
      id: firstBatch.id,
      name: firstBatch.batch_name,
      code: firstBatch.batch_code,
      type: firstBatch.type,
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
};

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

const proceedLog = async (batchId: string) => {
  try {
    // const log = await ;
  } catch (e) {
    throw e;
  }
};

const proceedProctoring = "";

const proceedIntro = async (batchId: string, detail: any) => {
  try {
    let intro = [];
    const reportIntroData = await getIntroData(batchId);
    console.log("cek report intro", reportIntroData);

    for (const category of reportIntroData) {
      const data: any = {
        category_id: category.category_id,
        category_name: category.category_name,
        category_code: category.category_code,
        summary_type: category.summary_type,
        summary_code: category.summary_code,
        summary_view: category.summary_view,
        summary_formula: category.summary_formula,
        norm: [],
        subtests: [],
        tests: [],
      };

      // Ambil criteria categorynya untuk norm
      let norm = await getCriteriaForReport(category.criteria_id);
      console.log("norm final", norm);
      if (norm.criterias.length !== 0) {
        data.norm.push(...norm.criterias);
      }

      // Ambil detail berdasarkan category_id
      const categoryDetails: any = detail.flat().filter((d: any) => d.category_id === category.category_id);

      if (category.summary_type === "summary") {
        for (const test of categoryDetails) {
          // data.norm.push(...(test.norm || []));

          if (test.summary_type === "subtest") {
            const subtests = test.subtests || [];
            // data.subtests.push(...subtests);
            data.tests.push({
              test_id: test.test_id,
              test_name: test.test_name,
              test_code: test.test_code,
              description: test.description,
              test_result: test.result,
            });
          } else if (test.summary_type === "category") {
            let mergedResult = "";
            for (const subtest of test.subtests) {
              for (const key in subtest) {
                const sub = subtest[key];
                const categories = sub.result?.categories || [];
                const names = categories.map((c: any) => c.category_name);
                mergedResult += names.join(",") + ",";
              }
            }
            data.tests.push({
              test_id: test.test_id,
              test_name: test.test_name,
              test_code: test.test_code,
              description: test.description,
              test_result: { merged_category_result: mergedResult.slice(0, -1) }, // remove trailing comma
              subtests: [],
            });
          }
        }
      } else if (category.summary_type === "detail") {
        for (const test of categoryDetails) {
          data.norm.push(...(test.norm || []));

          if (test.summary_type === "subtest") {
            const subtests = test.subtests || [];
            data.subtests.push(...subtests);
          } else if (test.summary_type === "category") {
            for (const subtest of test.subtests) {
              for (const key in subtest) {
                const sub: any = subtest[key];
                data.subtests.push(sub);
              }
            }
          }
        }
      }
      intro.push(data);
    }

    return intro;
  } catch (e) {
    throw e;
  }
};

const proceedSubtestCriteria = async (criteriaId: string, subtestPoint: number) => {
  try {
    console.log("Criteria id adalah", criteriaId);
    console.log("point adlah", subtestPoint);
    const criteria = await getCriteriaForReport(criteriaId);
    const matchingCriteria = criteria.criterias.find((criteria: any) => {
      return subtestPoint >= Number(criteria.minimum_score) && subtestPoint <= Number(criteria.maximum_score);
    });
    console.log("testing subtest criteria");
    console.log("subtest point");
    console.log(subtestPoint);
    console.log(matchingCriteria);
    return matchingCriteria;
  } catch (e) {
    throw e;
  }
};

const proceedDetail = async (batchId: string, assesseeEmail: string) => {
  try {
    const reportDetailData: any = await getReportDetail(batchId);
    let detail = [];

    for (const test of reportDetailData) {
      const testMapping: Record<string, any> = {};
      const testId = test.test_id;
      const subtestMapping: Record<string, any> = {};
      if (!testMapping[testId]) {
        testMapping[testId] = {
          category_id: test.category_id,
          category_name: test.category_name,
          category_code: test.category_code,
          test_id: testId,
          test_name: test.test_name,
          test_code: test.test_code,
          description: test.description,
          summary_type: test.summary_type,
          summary_formula: test.summary_formula,
          summary_view: test.summary_view,
          result: {},
          norm: [],
          subtests: [],
        };

        const norm = await getCriteriaForReport(test.criteria_id);
        testMapping[testId].norm.push(...norm.criterias);

        if (test.summary_type === "subtest") {
          const resultBySubtest: any = await getPersonalReportData(batchId, assesseeEmail, "subtest", test.test_id);
          let sumSubtestPoint = 0;
          let countSubtest = 0;

          for (const subtest of resultBySubtest) {
            const result = await proceedSubtestCriteria(subtest.criteria_id, Number(subtest.subtest_point));
            console.log("cek subtest point", subtest.subtest_point);
            if (!isNaN(Number(subtest.subtest_point))) {
              sumSubtestPoint = sumSubtestPoint + Number(subtest.subtest_point);
              countSubtest++;
            }
            console.log("cek sum subtest point", sumSubtestPoint);
            console.log("point tiap subtest", subtest.subtest_point);
            const proceedSubtest = {
              subtest_id: subtest.subtest_id,
              subtest_name: subtest.subtest_name,
              subtest_code: subtest.subtest_code,
              description: subtest.description ? subtest.description : null,
              result: {
                subtest_point: !isNaN(Number(subtest.subtest_point)) ? Number(subtest.subtest_point) : 0,
                subtest_criteria: result ? result.criteria_name : "Undefined",
                criteria_color: result ? result.hex_code : "#CCCCCC",
                categories: [],
              },
            };
            testMapping[testId].subtests.push(proceedSubtest);
          }

          console.log("masuk formula");
          // Formula
          let testResult;
          console.log("sub Subtest Point");
          console.log(sumSubtestPoint);
          let finalTestPoint: number = Number(sumSubtestPoint);

          if (test.summary_type === "sum") {
            finalTestPoint *= 1;
          } else if (test.summary_type === "average") {
            finalTestPoint = countSubtest > 0 && !isNaN(sumSubtestPoint) ? finalTestPoint / countSubtest : 0;
          }

          console.log("cek final test result");
          // Cek criteria test
          console.log(test.criteria_id);
          const testCriteria = await proceedSubtestCriteria(test.criteria_id, finalTestPoint);
          console.log("test criteria hay");
          console.log(testCriteria);
          testResult = {
            test_point: !isNaN(finalTestPoint) ? finalTestPoint : 0,
            criteria: testCriteria.criteria_name ? testCriteria.criteria_name : null,
            criteria_color: testCriteria.criteria_color ? testCriteria.criteria_color : 0,
            description: testCriteria.description ? testCriteria.description : null,
          };

          console.log("FIX BANGET YA ALLAH");
          console.log(finalTestPoint);
          console.log(testResult);

          testMapping[testId].result = testResult;
        } else if (test.summary_type === "category") {
          console.log("masuk category coy");
          const resultByCategory: any = await getPersonalReportData(batchId, assesseeEmail, "category", test.test_id);
          let maxPoint = -Infinity;
          let bestCategory = null;
          let bestCriteria = null;

          for (const category of resultByCategory) {
            const subtestId = category.subtest_id;

            if (!subtestMapping[subtestId]) {
              subtestMapping[subtestId] = {
                subtest_id: subtestId,
                subtest_name: category.subtest_name,
                subtest_code: category.subtest_code,
                result: {
                  subtest_point: null,
                  subtest_criteria: null,
                  criteria_color: null,
                  categories: [],
                },
              };
            }

            const categoryPoint = Number(category.category_point);
            const matchedCriteria = await proceedSubtestCriteria(category.category_criteria_id, categoryPoint);

            subtestMapping[subtestId].result.categories.push({
              category_id: category.category_id,
              category_name: category.category_name,
              category_code: category.category_code,
              category_point: categoryPoint,
              description: matchedCriteria?.description ?? null,
            });

            // Cari kategori dengan point tertinggi
            if (categoryPoint > maxPoint) {
              maxPoint = categoryPoint;
              bestCategory = category;
              bestCriteria = matchedCriteria;
            }
          }

          // Setelah loop selesai, isi hasil utama
          if (bestCategory) {
            const subtestId = bestCategory.subtest_id;
            subtestMapping[subtestId].result.subtest_point = Number(bestCategory.category_point);
            subtestMapping[subtestId].result.subtest_criteria = bestCategory.category_name;
            subtestMapping[subtestId].result.criteria_color = bestCriteria?.hex_code ?? "#CCCCCC";
          }

          testMapping[testId].subtests.push(subtestMapping);
        }
      }

      const values = Object.values(testMapping);
      detail.push(...values);
    }
    return detail;
  } catch (e) {
    throw e;
  }
};

const proceeedProfile = async (type: string, assesseeId: string, assesseeEmail: string) => {
  try {
    console.log("type", type);
    console.log("assesseeId", assesseeId);
    const assesseeData: any =
      type === "internal" ? await getDarwinUser(String(assesseeId)) : await getAssesseeExternalProfile(assesseeEmail);

    console.log("cek assessee data");
    console.log(assesseeData);
    const profile = {
      assessee_id: type === "internal" ? assesseeData.employee_id : assesseeData.id,
      assessee_name: type === "internal" ? assesseeData.full_name : assesseeData.name,
      assessee_email: type === "internal" ? assesseeData.company_email_id : assesseeData.email,
      assessee_gender: type === "internal" ? assesseeData.gender : assesseeData.gender,
      work_place: type === "internal" ? assesseeData.group_company : assesseeData.institution,
    };

    return profile;
  } catch (e) {
    throw e;
  }
};

const proceedReportDesign = async (batchId: string) => {
  try {
    const batchInformation = await getBatchInformationForReport(batchId);
    const design = await getReportDesignDetail(batchId);
    console.log("transformasi");
    const reportDesign = await transformResponseFormat(batchInformation, design);
    console.log("cek report design");
    console.log(reportDesign);
    return reportDesign;
  } catch (e) {
    throw e;
  }
};

const getCriteriaForReport = async (criteriaId: string) => {
  try {
    const rawData = await getCriteriaDetail(criteriaId);

    const groupedData = {
      value_name: rawData[0]?.value_name ? rawData[0].value_name : null,
      value_code: rawData[0]?.value_code ? rawData[0].value_code : null,
      criterias: rawData.reduce(
        (acc, row) => {
          if (row.criteria_name) {
            acc.push({
              criteria_id: row.criteria_id,
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
        [] as Array<{
          criteria_id: string;
          criteria_name: string;
          minimum_score: number;
          maximum_score: number;
          description: string;
          color_id?: string | null;
          color_name?: string | null;
          hex_code?: string | null;
        }>
      ),
    };

    return groupedData;
  } catch (e) {
    throw e;
  }
};

export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("Processing personal report request");
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;
    const assesseeEmail = req.body.assessee_email;

    const generatingStatus = await getGenerateStatus(batchId, assesseeId);
    console.log(generatingStatus);
    if (generatingStatus.is_generate === false) {
      // Get Report Guide
      // const reportGuide = await proceedGuide();

      const batchInformation = await getSpecificBatchInformationForReport(batchId, assesseeId);
      // Get Report Design
      console.log("masuk report design");
      console.log(batchInformation);
      // const reportDesign = await proceedReportDesign(batchId);

      // console.log("HALOOOO");
      // console.log("cek report design", reportDesign);

      console.log("masuk profile");
      // Get Profile Assessee
      const profile = await proceeedProfile(batchInformation.type, assesseeId, assesseeEmail);

      // Get Report Detail
      const reportDetail = await proceedDetail(batchId, assesseeEmail);

      // Get Report Intro
      const reportIntro = await proceedIntro(batchId, reportDetail);

      // Get Report Proctoring

      // Get Report Log
      const reportProctoting = await getReportProctoring(batchId, assesseeId);
      console.log("report proctoring", reportProctoting);
      res.status(200).send({
        message: "Success!",
        data: {
          guide: {
            content: batchInformation.content,
          },
          batch: {
            name: batchInformation.batch_name,
            code: batchInformation.batch_code,
            type: batchInformation.type,
            taken_at: batchInformation.taken_at,
          },
          profile: profile,
          intro: reportIntro,
          detail: reportDetail,
          proctoring: reportProctoting,
        },
      });
    } else if (generatingStatus.is_generate === true) {
      // Kirim file PDF langsung jika sudah digenerate
      const filePath = path.join(process.cwd(), "uploads", "report", batchId, `${assesseeId}.pdf`);

      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename="${assesseeId}.pdf"`); // atau gunakan 'attachment' jika ingin diunduh
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.status(404).json({ message: "Generated report not found." });
      }
    }
  } catch (e) {
    next(e);
  }
};

export const handleUploadReportPDF = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;
    const file = req.file;

    if (!batchId || !assesseeId || !file) {
      res.status(400).json({
        message: "Missing 'batch_id', 'assessee_id', or 'report' file in form-data",
      });
    }

    const uploadDir = path.join(process.cwd(), "uploads", "report", batchId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${assesseeId}.pdf`;
    const filePath = path.join(uploadDir, fileName);

    // Tulis file dari buffer
    fs.writeFileSync(filePath, file!.buffer);

    // Simpan ke database
    const report = {
      is_generate: true,
      report_path: `${batchId}/${fileName}`,
    };
    await storeReportPDF(report, batchId, assesseeId);

    res.status(201).json({
      message: "PDF uploaded successfully",
      file_name: fileName,
      path: filePath,
    });
  } catch (e) {
    next(e);
  }
};

export const handleGetAssesseeListForReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let assesseeList = await getAssesseeListForReport(req.params.id);

    if (req.query.taken === "true") {
      assesseeList = assesseeList.filter(
        (assessee) => assessee.first_taken_subtest_at !== null || assessee.last_finished_subtest_at !== null
      );
    } else if (req.query.taken === "false") {
      assesseeList = assesseeList;
    }

    res.status(200).send({
      message: "Success!",
      data: assesseeList,
    });
  } catch (e) {
    next(e);
  }
};
