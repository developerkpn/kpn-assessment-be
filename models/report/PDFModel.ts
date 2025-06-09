// import { PDFService } from "./PDFService";
// // import { generateBusinessReport } from "./DocumentBuilder";
//
// const PDFModel = {
//   renderPdf: async () => {
//     try {
//       return await PDFService.renderToStream();
//     } catch (error) {
//       console.error("PDFModel renderPdf error:", error);
//       throw error;
//     }
//   },
//
//   renderPdfBuffer: async () => {
//     try {
//       return await PDFService.renderToBuffer();
//     } catch (error) {
//       console.error("PDFModel renderPdfBuffer error:", error);
//       throw error;
//     }
//   },
//
//   // If you need to generate business report
//   generateBusinessReport: async (data: any) => {
//     try {
//       // Add your business logic here
//       // const reportData = await generateBusinessReport(data);
//       return await PDFService.renderToBuffer();
//     } catch (error) {
//       console.error("PDFModel generateBusinessReport error:", error);
//       throw error;
//     }
//   },
// };
//
// export default PDFModel;
