import path from "path";
import fs from "fs";
import { parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";
import React from "react";
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from "chart.js";
import { Canvas } from "skia-canvas";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
Chart.register(CategoryScale, LineController, LineElement, LinearScale, PointElement);

async function generatePDF(counter: number) {
  const canvas = new Canvas(400, 300);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#a0d8f1";
  ctx.fillRect(0, 0, 400, 300);
  ctx.fillStyle = "black";
  ctx.fillText(`Chart #${counter}`, 150, 150);
  const pngBuffer = await canvas.toBuffer("png", { matte: "white" });

  const styles = StyleSheet.create({
    page: { flexDirection: "row", backgroundColor: "#E4E4E4" },
    section: { margin: 10, padding: 10, flexGrow: 1 },
  });

  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text>PDF Section #1 (Job {counter})</Text>
        </View>
        <Image src={pngBuffer} />
        <View style={styles.section}>
          <Text>PDF Section #2</Text>
        </View>
      </Page>
    </Document>
  );

  const outputDir = path.resolve(__dirname, "../../uploads/test_report_parallel");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const { renderToFile } = await import("@react-pdf/renderer");
  const filePath = path.resolve(outputDir, `test-${counter}.pdf`);
  await renderToFile(MyDocument, filePath);

  return filePath;
}

// --- Worker main function ---
async function runWorker() {
  const jobs: number[] = workerData.jobs;
  for (const counter of jobs) {
    try {
      const filePath = await generatePDF(counter);
      parentPort?.postMessage(`✅ PDF #${counter} generated: ${filePath}`);
    } catch (err: any) {
      parentPort?.postMessage({ error: err.message, job: counter });
    }
  }
}

await runWorker();
