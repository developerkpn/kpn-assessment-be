// // Create styles
// import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";
// import React from "react";
// // Create Document Component
// const MyDocument = async () => {
//   const rep = StyleSheet.create({
//     page: {
//       flexDirection: "row",
//       backgroundColor: "#E4E4E4",
//     },
//     section: {
//       margin: 10,
//       padding: 10,
//       flexGrow: 1,
//     },
//   });
//   return (
//     <Document>
//       <Page size="A4" style={rep.page}>
//         <View style={rep.section}>
//           <Text>Section #1</Text>
//         </View>
//         <View style={rep.section}>
//           <Text>Section #2</Text>
//         </View>
//       </Page>
//     </Document>
//   );
// };
//
// export const TryRenderPDF = async () => {
//   const { renderToStream } = await import("@react-pdf/renderer");
//   const Document = await MyDocument();
//   return await renderToStream(Document);
// };
