// import React from "react";
//
// // Factory function that returns JSX components after dynamic import
// export const createPDFComponents = async () => {
//   const { Page, Text, View, Document, StyleSheet } = await import("@react-pdf/renderer");
//
//   const styles = StyleSheet.create({
//     page: {
//       flexDirection: "column",
//       backgroundColor: "#ffffff",
//       padding: 30,
//     },
//     header: {
//       fontSize: 24,
//       marginBottom: 20,
//       textAlign: "center",
//       color: "#2563eb",
//       fontWeight: "bold",
//     },
//     section: {
//       margin: 10,
//       padding: 15,
//       backgroundColor: "#f1f5f9",
//       borderRadius: 8,
//       marginBottom: 15,
//     },
//     sectionTitle: {
//       fontSize: 16,
//       marginBottom: 8,
//       fontWeight: "bold",
//       color: "#1e40af",
//     },
//     text: {
//       fontSize: 12,
//       lineHeight: 1.6,
//       color: "#374151",
//     },
//     list: {
//       marginTop: 10,
//     },
//     listItem: {
//       fontSize: 11,
//       marginBottom: 4,
//       marginLeft: 15,
//     },
//   });
//
//   // Return an object with component creators
//   return {
//     styles,
//     Document,
//     Page,
//     View,
//     Text,
//
//     // Pre-configured components
//     createDocument: (children: React.ReactNode) => React.createElement(Document, null, children),
//
//     createPage: (children: React.ReactNode) => React.createElement(Page, { size: "A4", style: styles.page }, children),
//
//     createHeader: (title: string) => React.createElement(Text, { style: styles.header }, title),
//
//     createSection: (title: string, content: string) =>
//       React.createElement(
//         View,
//         { style: styles.section },
//         React.createElement(Text, { style: styles.sectionTitle }, title),
//         React.createElement(Text, { style: styles.text }, content)
//       ),
//
//     createList: (items: string[]) =>
//       React.createElement(
//         View,
//         { style: styles.list },
//         ...items.map((item, index) => React.createElement(Text, { key: index, style: styles.listItem }, `• ${item}`))
//       ),
//   };
// };
//
// // Usage example with the factory
// export const generateBusinessReport = async (reportData: {
//   title: string;
//   summary: string;
//   achievements: string[];
//   challenges: string[];
//   nextSteps: string[];
// }) => {
//   const { pdf } = await import("@react-pdf/renderer");
//   const components = await createPDFComponents();
//
//   const document = components.createDocument(
//     components.createPage([
//       components.createHeader(reportData.title),
//       components.createSection("Executive Summary", reportData.summary),
//       React.createElement(
//         components.View,
//         { style: components.styles.section },
//         React.createElement(components.Text, { style: components.styles.sectionTitle }, "Key Achievements"),
//         components.createList(reportData.achievements)
//       ),
//       React.createElement(
//         components.View,
//         { style: components.styles.section },
//         React.createElement(components.Text, { style: components.styles.sectionTitle }, "Challenges"),
//         components.createList(reportData.challenges)
//       ),
//       React.createElement(
//         components.View,
//         { style: components.styles.section },
//         React.createElement(components.Text, { style: components.styles.sectionTitle }, "Next Steps"),
//         components.createList(reportData.nextSteps)
//       ),
//     ])
//   );
//
//   return await pdf(document).toBuffer();
// };
//
// // Alternative approach: Class-based component factory
// export class PDFDocumentBuilder {
//   private components: any = null;
//
//   async initialize() {
//     if (!this.components) {
//       this.components = await createPDFComponents();
//     }
//     return this.components;
//   }
//
//   async createSimpleDocument(title: string, sections: Array<{ title: string; content: string }>) {
//     const { pdf } = await import("@react-pdf/renderer");
//     const comp = await this.initialize();
//
//     const document = comp.createDocument(
//       comp.createPage([
//         comp.createHeader(title),
//         ...sections.map((section: any, index: number) =>
//           React.createElement(React.Fragment, { key: index }, comp.createSection(section.title, section.content))
//         ),
//       ])
//     );
//
//     return await pdf(document).toBuffer();
//   }
//
//   async createInvoice(invoiceData: {
//     number: string;
//     date: string;
//     clientName: string;
//     items: Array<{ description: string; quantity: number; rate: number }>;
//     total: number;
//   }) {
//     const { pdf } = await import("@react-pdf/renderer");
//     const comp = await this.initialize();
//
//     const document = comp.createDocument(
//       comp.createPage([
//         comp.createHeader(`Invoice #${invoiceData.number}`),
//         comp.createSection("Bill To", invoiceData.clientName),
//         comp.createSection("Invoice Date", invoiceData.date),
//         React.createElement(
//           this.components.View,
//           { style: comp.styles.section },
//           React.createElement(this.components.Text, { style: comp.styles.sectionTitle }, "Items"),
//           ...invoiceData.items.map((item, index) =>
//             React.createElement(
//               this.components.Text,
//               { key: index, style: comp.styles.text },
//               `${item.description} - Qty: ${item.quantity} × $${item.rate} = $${(item.quantity * item.rate).toFixed(2)}`
//             )
//           )
//         ),
//         React.createElement(
//           this.components.View,
//           { style: [comp.styles.section, { alignItems: "flex-end" }] },
//           React.createElement(
//             this.components.Text,
//             { style: [comp.styles.sectionTitle, { fontSize: 18 }] },
//             `Total: $${invoiceData.total.toFixed(2)}`
//           )
//         ),
//       ])
//     );
//
//     return await pdf(document).toBuffer();
//   }
// }
//
// // Singleton instance
// export const pdfBuilder = new PDFDocumentBuilder();
//
// // Sample usage functions
// export const generateSampleReport = async () => {
//   const sampleData = {
//     title: "Q4 Business Performance Report",
//     summary:
//       "This quarter demonstrated exceptional growth across all business units with revenue increasing by 35% and customer satisfaction reaching an all-time high of 4.8/5.0.",
//     achievements: [
//       "Launched 3 new product features ahead of schedule",
//       "Expanded team by 40% with top-tier talent acquisition",
//       "Achieved 99.9% uptime across all systems",
//       "Secured 5 major enterprise contracts worth $2.5M total",
//     ],
//     challenges: [
//       "Supply chain disruptions caused minor delays in Q3",
//       "Increased competition in core market segments",
//       "Scaling customer support to match growth rate",
//     ],
//     nextSteps: [
//       "Implement AI-powered customer service automation",
//       "Expand to European markets in Q1 2025",
//       "Launch mobile application by end of Q1",
//       "Establish strategic partnerships with 3 key vendors",
//     ],
//   };
//
//   return await generateBusinessReport(sampleData);
// };
//
// export const generateSampleInvoice = async () => {
//   return await pdfBuilder.createInvoice({
//     number: "INV-2024-001",
//     date: new Date().toLocaleDateString(),
//     clientName: "Acme Corporation\n123 Business Street\nNew York, NY 10001",
//     items: [
//       { description: "Website Development", quantity: 1, rate: 5000 },
//       { description: "SEO Optimization", quantity: 1, rate: 1500 },
//       { description: "Monthly Maintenance", quantity: 6, rate: 500 },
//     ],
//     total: 9500,
//   });
// };
