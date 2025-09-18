import React from "react";
import { generateReportIndividual } from "@/models/report/ReportModel.js";
// import { AssessmentReportPDFProps } from "@/types/Report";
import S3ClientUpload from "@/helper/S3UploadClass.js";
import { SubtestChartSection } from "@/models/report/ChartForSummarySubtest.js";
import { BarChartSummaryCategory } from "@/models/report/BarChartForSummaryCategory.js";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles, stylesheetrtc } from "@/models/report/report_styles.js";
import { ClientAction } from "@/helper/queryBuilder.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Html from "react-pdf-html";
import moment from "moment";
import pLimit from "p-limit";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename);

// Utility function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp; with space
    .replace(/&amp;/g, "&") // Replace &amp; with &
    .replace(/&lt;/g, "<") // Replace &lt; with <
    .replace(/&gt;/g, ">") // Replace &gt; with >
    .replace(/&quot;/g, '"') // Replace &quot; with "
    .replace(/&#39;/g, "'") // Replace &#39; with '
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim(); // Remove leading/trailing whitespace
};

export const ReportPDFTemplate = async (batchId: string, assesseeId: string) => {
  const rawDataReportIndividual = await generateReportIndividual(batchId, assesseeId);
  const dataReportIndividual = rawDataReportIndividual;
  const data = dataReportIndividual;

  const S3Client = new S3ClientUpload();
  // const logo = fs.readFileSync(path.join(__dirname, "../../assets/KPN_CORP_NEW_LOGO.png"));
  const placeholderImg = fs.readFileSync(path.join(__dirname, "../../assets/place-holder.jpg"));
  const testDate = moment(data.batch.taken_at).utcOffset("+14:00").locale("id").format("LLLL");

  const cover = await ClientAction(async (client) => {
    try {
      const { rows, rowCount: is_exist } = await client.query(`select file_name from mst_image_cover where uid = $1`, [
        dataReportIndividual.cover,
      ]);
      if (!is_exist) {
        throw new Error("Cover not found, please add cover");
      }
      const file_name = rows[0].file_name;

      //read file
      const dir_cover = path.join(__dirname, "../../uploads/cover/" + file_name);
      return fs.readFileSync(dir_cover);
    } catch (error) {
      throw error;
    }
  });

  // get images file
  let resultChart: Record<string, any> = {};
  const limit = pLimit(5); // Batasi ke max 5 request sekaligus

  const webcamurls = dataReportIndividual.proctoring.web_cam || [];
  const ssurls = dataReportIndividual.proctoring.screen || [];

  const promisesWebcam = webcamurls.map((webcam: any) => limit(() => S3Client.GetObjectAsBuffer(webcam.key)));
  const promisesSS = ssurls.map((ss: any) => limit(() => S3Client.GetObjectAsBuffer(ss.key)));

  const resultWebcam = await Promise.all(promisesWebcam);
  const resultSS = await Promise.all(promisesSS); //get charts
  const detailsChart = dataReportIndividual.detail;
  for (const detail of detailsChart) {
    // const sum_view = detail.summary_view
    const sum_view = "bar";
    const sum_type = detail.summary_type;
    let renderedChart: any;
    if (sum_type == "subtest") {
      if (sum_view == "bar") {
        renderedChart = SubtestChartSection({ subtests: detail.subtests });
        resultChart[detail.test_code] = renderedChart;
      } else {
        resultChart[detail.test_code] = null;
      }
    } else if (sum_type == "category") {
      for (const sub of detail.subtests) {
        if (sum_view == "bar") {
          renderedChart = await BarChartSummaryCategory(sub);
          resultChart[`${detail.test_code}-${sub.subtest_code}`] = renderedChart;
        } else {
          resultChart[`${detail.test_code}-${sub.subtest_code}`] = null;
        }
      }
    }
  }

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4">
        <View style={{ position: "relative", width: "100%", height: "100%" }}>
          <Image
            src={cover}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "auto",
              height: "100%",
            }}
          />
        </View>
      </Page>
      {/* Introduction Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            {/*<View style={styles.logo}>*/}
            {/*  /!*<Image src={logo} />*!/*/}
            {/*</View>*/}
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.headerTitle}>Introduction</Text>
        </View>

        {data.guide && data.guide.content && (
          <View style={styles.contentSection}>
            <Html stylesheet={stylesheetrtc}>{`<div className="container">${data.guide.content}</div>`}</Html>
          </View>
        )}
      </Page>

      {/* Psychograph Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.psychographHeader}>
          <View style={styles.headerTop}>
            {/*<View style={styles.logo}>*/}
            {/*  <Image src={logo} />*/}
            {/*</View>*/}
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.psychographTitle}>Psychograph</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileData}>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Name</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.assessee_name}</Text>
            </View>
            {data.profile.assessee_age && !isNaN(Number(data.profile.assessee_age)) && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{data.profile.assessee_age}</Text>
              </View>
            )}
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Gender</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{data.profile.assessee_gender}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Test Date</Text>
              <Text style={styles.profileColon}>:</Text>
              <Text>{testDate}</Text>
            </View>
            {data.profile.type == "internal" && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Work Location</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{data.profile.work_place}</Text>
              </View>
            )}
            {data.profile.type != "internal" && (
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Last Education</Text>
                <Text style={styles.profileColon}>:</Text>
                <Text>{data.profile.education}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileImageContainer}>
            <Image src={placeholderImg} />
          </View>
        </View>

        {data.intro.map((intro: any, index: any) => (
          <View key={index}>
            <View style={styles.subheaderContainer}>
              <Text style={styles.categoryTitle}>{intro.category_name}</Text>
            </View>
            <View style={{ display: "flex", gap: 10, margin: "0 25", flexDirection: "row" }}>
              {intro.summary_type === "summary" ? (
                <>
                  <View style={{ width: "30%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Assessment
                      </Text>
                    </View>
                    {intro.tests?.map((test: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>{test.test_name}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "50%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Definition
                      </Text>
                    </View>
                    {intro.tests?.map((test: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "justify" }}>
                          {stripHtmlTags(test.description) || "No description available"}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "20%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Score
                      </Text>
                    </View>
                    {intro.tests?.map((test: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>
                          {test.test_result?.test_point || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              ) : (
                <>
                  <View style={{ width: "30%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Assessment
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>{subtest.subtest_name}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "50%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Definition
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "justify" }}>
                          {stripHtmlTags(subtest.description) || "No description available"}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={{ width: "20%" }}>
                    <View style={{ backgroundColor: "#e7f0d9", padding: 10 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          textAlign: "center",
                        }}
                      >
                        Type
                      </Text>
                    </View>
                    {intro.subtests?.map((subtest: any, index: any) => (
                      <View key={index} style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                        <Text style={{ fontSize: 10, textAlign: "center" }}>
                          {subtest.result?.subtest_criteria || "N/A"}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        ))}
      </Page>

      {data.detail.map((detail: any, index: any) => (
        <Page key={index} size="A4" style={styles.page}>
          <View style={styles.psychographHeader}>
            <View style={styles.headerTop}>
              {/*<View style={styles.logo}>*/}
              {/*  /!*<Image src={logo} />*!/*/}
              {/*</View>*/}
              <View style={styles.confidentialBadge}>
                <Text>STRICTLY CONFIDENTIAL</Text>
              </View>
            </View>
            <Text
              style={{
                ...styles.psychographTitle,
                // fontSize: detail.test_name.length > 20 ? 16 : styles.psychographTitle.fontSize,
              }}
            >
              {detail.test_name} Result
            </Text>
          </View>
          {detail.summary_type === "subtest" ? (
            <>
              <View style={{ display: "flex", flexDirection: "row", gap: 10, margin: "10 25" }}>
                <View style={[styles.col60]}>
                  <View style={[styles.boxPrimary]}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      What We Measures
                    </Text>
                  </View>
                  <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                    <Text style={{ fontSize: 10, textAlign: "justify" }}>
                      {detail.result.description || "No description available"}
                    </Text>
                  </View>
                </View>

                <View style={[styles.col40]}>
                  <View style={[styles.boxPrimary]}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      {detail.category_name} Score
                    </Text>
                  </View>
                  <View style={[styles.boxLightPrimary, { marginTop: 5 }]}>
                    <Text style={{ fontSize: 32, fontWeight: "bold", textAlign: "center" }}>
                      {detail.result.test_point || "N/A"}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
                      {detail.result.criteria || "Not Available"}
                    </Text>
                  </View>
                </View>
              </View>

              <SubtestChartSection subtests={detail.subtests} />
              <View style={{ display: "flex", flexDirection: "row", gap: 5, justifyContent: "center" }}>
                {detail.norm?.map((norm: any, index: any) => (
                  <View key={index}>
                    <View style={{ padding: 10, backgroundColor: "#d74e4a" }}>
                      <Text style={{ fontSize: 10, textAlign: "center", color: "white" }}>{norm.criteria_name}</Text>
                    </View>
                    <View style={{ padding: 10, backgroundColor: "#f0f0f0", marginTop: 1 }}>
                      <Text style={{ fontSize: 10, textAlign: "center" }}>
                        {norm.minimum_score} - {norm.maximum_score}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              {detail.subtests.map((sub: any) => {
                return (
                  <View style={{ margin: "10 25" }} key={sub.subtest_id}>
                    <View style={{ padding: 10, backgroundColor: "#d74e4a" }}>
                      <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
                        Report Usage Guidelines
                      </Text>
                    </View>
                    <View style={{ padding: 10, backgroundColor: "#ffdcdc", marginTop: 2 }}>
                      <Text style={{ fontSize: 10, textAlign: "justify" }}>
                        {stripHtmlTags(detail.description) || "No description available"}
                      </Text>
                    </View>
                    <View style={{ margin: "15 25 0 25", display: "flex", flexDirection: "column" }}>
                      {resultChart && resultChart[`${detail.test_code}-${sub.subtest_code}`] ? (
                        <Image src={resultChart[`${detail.test_code}-${sub.subtest_code}`]} style={{ width: 500 }} />
                      ) : (
                        <Text>Loading chart...</Text>
                      )}
                    </View>

                    {(() => {
                      return sub.result.categories.map((cat: any, idx: any) => (
                        <View key={`${idx}-${sub.subtest_id}`}>
                          <View
                            style={{
                              padding: 10,
                              backgroundColor: "#d74e4a",
                              marginTop: idx === 0 ? 2 : 2,
                              marginBottom: 2,
                            }}
                          >
                            <Text
                              style={{
                                color: "white",
                                fontWeight: "bold",
                                textAlign: "center",
                                fontSize: 10,
                              }}
                            >
                              {cat.category_code} – {cat.category_name}
                            </Text>
                          </View>
                          <View style={{ padding: 10, backgroundColor: "#ffdcdc" }}>
                            <Text style={{ fontSize: 10, textAlign: "justify" }}>
                              {cat.description || "No description available"}
                            </Text>
                          </View>
                        </View>
                      ));
                    })()}
                  </View>
                );
              })}
            </>
            // <>
            //   <View style={{ margin: "10 25" }}>
            //     <View style={{ padding: 10, backgroundColor: "#d74e4a" }}>
            //       <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>
            //         Report Usage Guidelines
            //       </Text>
            //     </View>
            //     <View style={{ padding: 10, backgroundColor: "#ffdcdc", marginTop: 2 }}>
            //       <Text style={{ fontSize: 10, textAlign: "justify" }}>{detail.description}</Text>
            //     </View>
            //     <View style={{ margin: "15 25 0 25", display: "flex", flexDirection: "column" }}>
            //       {resultChart && resultChart[`${detail.test_code}-${detail..subtest_code}`] ? (
            //         <Image src={resultChart[detail.test_code]} style={{ width: 500 }} />
            //       ) : (
            //         <Text>Loading chart...</Text>
            //       )}
            //     </View>

            //     {(() => {
            //       const allCategories = detail.subtests.flatMap((subtest) => {
            //         return Array.isArray(subtest.result.categories) ? subtest.result.categories : [];
            //       });

            //       return allCategories.map((cat, idx) => (
            //         <View key={idx}>
            //           <View
            //             style={{
            //               padding: 10,
            //               backgroundColor: "#d74e4a",
            //               marginTop: idx === 0 ? 2 : 2,
            //               marginBottom: 2,
            //             }}
            //           >
            //             <Text
            //               style={{
            //                 color: "white",
            //                 fontWeight: "bold",
            //                 textAlign: "center",
            //                 fontSize: 10,
            //               }}
            //             >
            //               {cat.category_code} – {cat.category_name}
            //             </Text>
            //           </View>
            //           <View style={{ padding: 10, backgroundColor: "#ffdcdc" }}>
            //             <Text style={{ fontSize: 10, textAlign: "justify" }}>
            //               {cat.description || "No description available"}
            //             </Text>
            //           </View>
            //         </View>
            //       ));
            //     })()}
            //   </View>
            // </>
          )}
        </Page>
      ))}

      <Page size="A4" style={styles.page}>
        <View style={styles.psychographHeader}>
          <View style={styles.headerTop}>
            {/*<View style={styles.logo}>*/}
            {/*  <Image src={logo} />*/}
            {/*</View>*/}
            <View style={styles.confidentialBadge}>
              <Text>STRICTLY CONFIDENTIAL</Text>
            </View>
          </View>
          <Text style={styles.psychographTitle}>Proctoring</Text>
        </View>
        <View style={{ marginTop: 15, marginHorizontal: 25 }}>
          <Text style={styles.sectionTitle}>Log Activity</Text>
        </View>

        <View style={styles.logTable}>
          <View style={styles.logHeaderRow}>
            <Text style={styles.logHeaderCellDate}>Date and Time</Text>
            <Text style={styles.logHeaderCellActivity}>Activity</Text>
          </View>

          {data.log &&
            data.log.map((entry: any, idx: any) => {
              const formattedDate = moment(entry.created_at).format("DD-MMM-YYYY HH:mm:ss");
              const isEven = idx % 2 === 1;
              return (
                <View key={entry.id} style={[styles.logRow, ...(isEven ? [styles.logRowEven] : [])]}>
                  <Text style={styles.logCellDate}>{formattedDate}</Text>
                  <Text style={styles.logCellActivity}>{entry.log}</Text>
                </View>
              );
            })}
        </View>

        <View wrap style={{ marginTop: 20, marginHorizontal: 25 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>Webcam Proctoring</Text>
          {!resultWebcam && <Text style={{ fontSize: 10, fontStyle: "italic" }}>Tidak ada gambar webcam.</Text>}
          <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {resultWebcam &&
              resultWebcam.map((values, key) => (
                <View
                  key={`webcam-${key}`}
                  wrap={false}
                  style={{
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 4,
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={values}
                    style={{
                      width: "100px",
                      height: "auto",
                      marginTop: 4,
                    }}
                  />
                </View>
              ))}
          </View>
        </View>

        <View wrap style={{ marginTop: 20, marginHorizontal: 25, display: "flex", gap: 2 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>Screen Proctoring</Text>
          {!resultSS && <Text style={{ fontSize: 10, fontStyle: "italic" }}>Tidak ada gambar screen.</Text>}
          <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {resultSS &&
              resultSS.map((imgDataUrl, idx) => (
                <View
                  key={`screen-${idx}`}
                  wrap={false}
                  style={{
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    padding: 4,
                    alignItems: "center",
                  }}
                >
                  <Image
                    src={imgDataUrl}
                    style={{
                      width: "100px",
                      height: "auto",
                      marginTop: 4,
                    }}
                  />
                </View>
              ))}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const StreamReportPDF = async (batchId: string, assesseeId: string) => {
  const { renderToStream } = await import("@react-pdf/renderer");
  const Document = await ReportPDFTemplate(batchId, assesseeId);
  return await renderToStream(Document);
};
