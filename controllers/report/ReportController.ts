import { Request, Response, NextFunction } from "express";
import {
  assignReportDesign,
  checkIsCoverUserbyOtherMod,
  deleteCoverData,
  generateReportForWholeBatch,
  generateReportIndividual,
  getAllDataCover,
  getAssesseeListForReport,
  GetAssessmentResultByUser,
  getBatchForReport,
  getBatchInformationForReport,
  getCategoryCriteriaModel,
  getCoverbyID,
  getCoverDetailData,
  getGenerateStatus,
  getIntroData,
  getPersonalReportData,
  getReportDesignDetail,
  getReportDetail,
  getReportGuide,
  getReportHead,
  getReportLog,
  getSpecificBatchInformationForReport,
  getTestCriteriaModel,
  storeReportGuide,
  storeReportPDF,
  // storeReportGuide,
  updateReportGuide,
  uploadCoverImage,
} from "@/models/report/ReportModel.js";
import ExcelJS from "exceljs";
import { v7 as uuid } from "uuid";
import path from "path";
import fs from "fs";
import { IncomingForm } from "formidable";
import { fileURLToPath } from "url";
import { error } from "console";
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
/**
 * Controller to get batch information with test count by category
 */

export const handleGetBatchForReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role_name = req.userDecode?.role_name as string;
    const user_id = req.userDecode?.user_id as string;
    console.log(req.userDecode);
    const batch = await getBatchForReport({ role_name, user_id });
    res.status(200).send({
      message: "Success!",
      data: batch,
    });
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

    const reportHead = await getReportHead(batchId);
    console.log(reportHead);
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

    allTests.forEach((test: any) => {
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

      const categoryInfo = allTests.find((t: any) => t.category_code === categoryCode);
      const categoryId = categoryInfo?.category_id || null;

      // Ambil summary berdasarkan category_id dari getReportIntro
      const categorySummary = getReportIntro.find((intro: any) => intro.category_id === categoryId);
      const tests = Object.values(testsMap).map((test: any) => {
        const detail = getReportDetail.intro.find((d: any) => d.test_id === test.id);

        return {
          ...test,
          summary_type: detail?.summary_type || null,
          summary_view: detail?.summary_view || null,
          summary_formula: detail?.summary_formula || null,
        };
      });

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

    res.status(200).send({
      message: "Success!",
      data: {
        report_id: reportHead ? reportHead.id : null,
        cover_id: reportHead?.cover_id,
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
      cover_id: body.cover_id,
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

    await assignReportDesign(introPayload, detailPayload, headPayload);
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
    const reportId: string = req.params.reportId;
    const batchId: string = req.body.batch_id;

    const headPayload = {
      cover_id: body.cover_id,
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

    const generateStatus = {
      is_generate: false,
      error_message: null,
    };

    await assignReportDesign(introPayload, detailPayload, headPayload, true, reportId, batchId, generateStatus);

    await res.status(201).send({
      message: "Success!",
    });
  } catch (e) {
    next(e);
  }
};

// Tipe untuk respons dari model (kembali ke original)
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

    if (!result || result.length === 0) {
      res.status(404).send({
        message: "Data not found for the specified batch ID",
      });
      return;
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
    return;
  } catch (e) {
    console.error("Error generating report:", e);
    next(e);
  }
};

/**
 * Membuat file Excel dari data batch
 * @param data Data hasil query dari database
 * @returns Buffer Excel
 */
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

    // Buat headers - cell A1 kosong, lalu question_id di atasnya, plus kolom total
    const headers = ["Assessee Name", "Assessee Email"];
    uniqueQuestions.forEach((q) => {
      headers.push(q.question_id);
    });
    headers.push("Subtest Total");

    worksheet.addRow(headers);

    // Baris kedua - kosong untuk Assessee Name dan Email, lalu q_input_text, plus label untuk total
    const subHeaders = ["", ""];
    uniqueQuestions.forEach((q) => {
      subHeaders.push(q.q_input_text);
    });
    subHeaders.push("Total Score");

    worksheet.addRow(subHeaders);

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(2).font = { italic: true };

    // Tambahkan data untuk setiap assessee
    uniqueAssessees.forEach((assessee) => {
      const rowData = [assessee.assessee_name, assessee.assessee_email];
      let totalScore = 0;

      // Temukan point untuk setiap question
      uniqueQuestions.forEach((question) => {
        const matchingData = groupData.find(
          (item) => item.question_id === question.question_id && item.assessee_nik === assessee.assessee_nik
        );
        const point = matchingData?.point || 0;
        rowData.push(point !== null ? point.toString() : "0");
        // Pastikan point diconvert ke number dulu sebelum di-sum
        totalScore += Number(point) || 0;
      });

      // Tambahkan total score untuk subtest sebagai number, bukan string
      rowData.push(String(totalScore));

      worksheet.addRow(rowData);
    });

    // Format lebar kolom
    worksheet.getColumn(1).width = 30; // Assessee Name
    worksheet.getColumn(2).width = 30; // Assessee Email

    // Set lebar untuk kolom question
    for (let i = 0; i < uniqueQuestions.length; i++) {
      worksheet.getColumn(i + 3).width = 15;
    }

    // Set lebar untuk kolom total
    worksheet.getColumn(uniqueQuestions.length + 3).width = 15;

    // Style kolom total dengan background kuning
    const totalColumnIndex = uniqueQuestions.length + 3;
    for (let i = 1; i <= uniqueAssessees.length + 2; i++) {
      worksheet.getCell(i, totalColumnIndex).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" }, // Kuning
      };
    }
  }

  // Tambahkan sheet ringkasan
  addSummarySheet(workbook, data);

  // Tambahkan sheet overall scores
  addOverallScoresSheet(workbook, data);

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
 * Menambahkan sheet overall scores untuk melihat total score setiap assessee
 */
function addOverallScoresSheet(workbook: ExcelJS.Workbook, data: BatchReportRow[]): void {
  if (data.length === 0) return;

  const overallSheet = workbook.addWorksheet("Overall Scores", { properties: { tabColor: { argb: "FF0000FF" } } });

  // Dapatkan data unik untuk setiap assessee
  const assesseeScores = new Map<
    string,
    {
      assessee_nik: string;
      assessee_name: string;
      assessee_email: string;
      total_overall_score: number;
      test_scores: Map<string, { test_name: string; test_code: string; total_test_score: number }>;
    }
  >();

  // Hitung scores untuk setiap assessee
  data.forEach((row) => {
    if (!row.assessee_nik || !row.test_id) return;

    if (!assesseeScores.has(row.assessee_nik)) {
      assesseeScores.set(row.assessee_nik, {
        assessee_nik: row.assessee_nik,
        assessee_name: row.assessee_name,
        assessee_email: row.assessee_email,
        total_overall_score: 0,
        test_scores: new Map(),
      });
    }

    const assesseeData = assesseeScores.get(row.assessee_nik)!;

    // Inisialisasi test score jika belum ada
    if (!assesseeData.test_scores.has(row.test_id)) {
      assesseeData.test_scores.set(row.test_id, {
        test_name: row.test_name,
        test_code: row.test_code,
        total_test_score: 0,
      });
    }

    // Tambahkan point ke test score - pastikan convert ke number dulu
    const point = Number(row.point) || 0;
    assesseeData.test_scores.get(row.test_id)!.total_test_score += point;
  });

  // Hitung total overall score
  assesseeScores.forEach((assessee) => {
    assessee.total_overall_score = Array.from(assessee.test_scores.values()).reduce(
      (sum, test) => sum + test.total_test_score,
      0
    );
  });

  // Buat header
  const uniqueTests = Array.from(new Set(data.map((row) => row.test_id).filter((id) => id)));
  const testHeaders = uniqueTests.map((testId) => {
    const testData = data.find((row) => row.test_id === testId);
    return `${testData?.test_code} (${testData?.test_name})`;
  });

  const headers = ["Assessee Name", "Assessee Email", ...testHeaders, "Total Overall Score"];
  overallSheet.addRow(headers);

  // Style header
  overallSheet.getRow(1).font = { bold: true };
  overallSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" }, // Abu-abu terang
  };

  // Tambahkan data untuk setiap assessee
  Array.from(assesseeScores.values()).forEach((assessee) => {
    const rowData = [assessee.assessee_name, assessee.assessee_email];

    // Tambahkan score untuk setiap test
    uniqueTests.forEach((testId) => {
      const testScore = assessee.test_scores.get(testId);
      rowData.push(testScore?.total_test_score?.toString() || "0");
    });

    // Tambahkan total overall score
    rowData.push(assessee.total_overall_score.toString());

    overallSheet.addRow(rowData);
  });

  // Format lebar kolom
  overallSheet.getColumn(1).width = 30; // Assessee Name
  overallSheet.getColumn(2).width = 30; // Assessee Email

  // Set lebar untuk kolom test scores
  for (let i = 0; i < uniqueTests.length; i++) {
    overallSheet.getColumn(i + 3).width = 20;
  }

  // Set lebar untuk kolom total overall score
  overallSheet.getColumn(uniqueTests.length + 3).width = 20;

  // Style kolom total dengan background hijau
  const totalColumnIndex = uniqueTests.length + 3;
  for (let i = 1; i <= assesseeScores.size + 1; i++) {
    overallSheet.getCell(i, totalColumnIndex).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF90EE90" }, // Hijau terang
    };
  }
}

/**
 * Helper untuk memformat tanggal
 */
function formatDate(date: Date): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString();
}

export const handleReportPersonal = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const batchId = req.body.batch_id;
    const assesseeId = req.body.assessee_id;

    const generatingStatus = await getGenerateStatus(batchId, assesseeId);
    console.log(generatingStatus);
    // if (generatingStatus.is_generate === false) {
    // console.log("report proctoring", reportProctoting);
    const generateDataReport = await generateReportIndividual(batchId, assesseeId);
    res.status(200).send({
      message: "Success!",
      data: generateDataReport,
    });
    // } else if (generatingStatus.is_generate === true) {
    //   // Kirim file PDF langsung jika sudah digenerate
    //   const filePath = path.join(process.cwd(), "uploads", "report", batchId, `${assesseeId}.pdf`);

    //   if (fs.existsSync(filePath)) {
    //     res.setHeader("Content-Type", "application/pdf");
    //     res.setHeader("Content-Disposition", `inline; filename="${assesseeId}.pdf"`); // atau gunakan 'attachment' jika ingin diunduh
    //     fs.createReadStream(filePath).pipe(res);
    //   } else {
    //     res.status(404).json({ message: "Generated report not found." });
    //   }
    // }
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
        (assessee: any) => assessee.first_taken_subtest_at !== null || assessee.last_finished_subtest_at !== null
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

export const handleUploadCover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req);
    const formdata = new IncomingForm();
    const [fields, files] = await formdata.parse(req);
    const file_name = files?.cover?.[0].originalFilename as string;
    const file = fs.readFileSync(files?.cover?.[0].filepath as string);
    const metadata = files?.cover?.[0].mimetype as string;
    const user_id = req.userDecode?.user_id ?? "N/A";
    const result = await uploadCoverImage(file_name, file, metadata, user_id);
    res.status(200).send(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const handleGetCover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const stream_img = await getCoverbyID(id);
    if (!stream_img) {
      throw new Error("Data not found");
    }
    // res.setHeader("content-type", "image/jpg");
    stream_img.pipe(res);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const handleGetAllCover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getAllDataCover();
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: (error as Error).message,
    });
  }
};

export const checkIsCoverUserbyOther = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { batch_id, cover_id } = req.query;
    const is_exist = await checkIsCoverUserbyOtherMod(batch_id as string, cover_id as string);
    res.status(200).send({
      data: { is_used: is_exist.is_exist > 0 ? true : false, batch_using: is_exist.existed_batch },
    });
  } catch (error) {
    throw error;
  }
};

export const handleDeleteCover = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("masuk");
    const dir = path.join(__dirname, `../../uploads/cover/`);
    const { file_name, uid } = await getCoverDetailData(req.params.id);
    console.log("filename", file_name);
    fs.readdir(dir, async (err, files) => {
      if (err) {
        console.error(err);
        return;
      }

      const matchingFile = files.find((file) => file === `${file_name}`);
      console.log("matching", matchingFile);
      if (matchingFile) {
        const filePath = path.join(dir, matchingFile);

        fs.unlink(filePath, (err) => {
          if (err) {
            throw err;
          }
        });
      }
    });
    await deleteCoverData(uid);
    res.status(200).send({
      message: "Success!",
    });
  } catch (e) {
    console.error(e);
    next(e);
  }
};

export const handleGetAssessmentResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id, batch_id } = req.query;
    if (!user_id) {
      throw new Error("No user_id found");
    }
    const result = await GetAssessmentResultByUser(user_id as string, batch_id as string);
    res.status(200).send({
      data: result,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
