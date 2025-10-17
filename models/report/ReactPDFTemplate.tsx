// Create styles
import { Page, Text, View, Document, StyleSheet, Image } from "@react-pdf/renderer";
import { CategoryScale, Chart, LinearScale, LineController, LineElement, PointElement } from "chart.js";
import { Canvas } from "skia-canvas";
import React from "react";

Chart.register([CategoryScale, LineController, LineElement, LinearScale, PointElement]);

const canvas = new Canvas(400, 300);
const ctx = canvas.getContext("2d");
const pngBuffer = await canvas.toBuffer("png", { matte: "white" });

// Create Document Component
const MyDocument = async () => {
  const rep = StyleSheet.create({
    page: {
      flexDirection: "row",
      backgroundColor: "#E4E4E4",
    },
    section: {
      margin: 10,
      padding: 10,
      flexGrow: 1,
    },
  });
  return (
    <Document>
      <Page size="A4" style={rep.page}>
        <View style={rep.section}>
          <Text>Section #1</Text>
        </View>
        <Image src={pngBuffer} />
        <View style={rep.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
};

export const TryRenderPDF = async () => {
  const { renderToStream } = await import("@react-pdf/renderer");
  const Document = await MyDocument();
  return await renderToStream(Document);
};
