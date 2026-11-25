import React from "react";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";
import { Document, Font, Image, Page, StyleSheet, Text, View, renderToStream } from "@react-pdf/renderer";
import { ACCompetencyEvaluated, ACReportDetail } from "@/types/ACReportTypes.js";
import { AC_COMPETENCY_MASTER } from "@/helper/acCompetencyMaster.js";

// Matikan pemenggalan kata bahasa Inggris bawaan agar kata Bahasa Indonesia tetap utuh
Font.registerHyphenationCallback((word) => [word]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolveAssetBuffer = (fileName: string): Buffer | null => {
  const candidates = [
    path.join(__dirname, "../../assets", fileName),
    path.join(process.cwd(), "assets", fileName),
    path.join(process.cwd(), "dist/assets", fileName),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p);
    }
  }
  return null;
};

const C = {
  maroon: "#990000",
  bannerRed: "#b23430",
  pinkBox: "#f2dcdb",
  subHeaderPink: "#d99594",
  shadeGray: "#b8b8b8",
  borderBlack: "#000000",
  textDark: "#111111",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.textDark,
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    backgroundColor: C.white,
  },
  coverPage: {
    padding: 28,
    backgroundColor: C.white,
    justifyContent: "center",
    alignItems: "center",
  },
  framedContainer: {
    flex: 1,
    borderWidth: 1.2,
    borderColor: C.borderBlack,
    flexDirection: "column",
  },
  introBanner: {
    backgroundColor: C.bannerRed,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 18,
  },
  logoPill: {
    backgroundColor: C.white,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 92,
    marginBottom: 8,
  },
  bannerTitle: {
    color: C.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  introBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
  },
  introHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    paddingBottom: 4,
    borderBottomWidth: 1.2,
    borderBottomColor: C.borderBlack,
    marginBottom: 6,
    marginTop: 14,
  },
  introParagraph: {
    fontSize: 8.5,
    lineHeight: 1.45,
    textAlign: "left",
  },

  // Page 4 styles
  p4TopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  p4Title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    textAlign: "center",
    flex: 1,
  },
  confidentialBox: {
    borderWidth: 1,
    borderColor: C.borderBlack,
    paddingHorizontal: 10,
    paddingVertical: 3,
    alignItems: "center",
  },
  confidentialText: {
    fontFamily: "Helvetica-BoldOblique",
    fontSize: 7.5,
    textAlign: "center",
  },
  identityGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 14,
  },
  identityCol: {
    width: "49%",
  },
  idRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 2.5,
    minHeight: 11,
  },
  idLabel: {
    width: "46%",
    fontFamily: "Helvetica-BoldOblique",
    fontSize: 6.8,
  },
  idColon: {
    width: "3%",
    fontSize: 7,
  },
  idValue: {
    width: "51%",
    fontSize: 7.2,
    borderBottomWidth: 0.6,
    borderBottomColor: "#555555",
    paddingBottom: 1,
  },

  // Matrix Table Page 4
  tableOuter: {
    borderWidth: 0.8,
    borderColor: C.borderBlack,
  },
  matrixHeaderRow: {
    flexDirection: "row",
    backgroundColor: C.maroon,
    color: C.white,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  matrixRow: {
    flexDirection: "row",
    borderBottomWidth: 0.6,
    borderBottomColor: C.borderBlack,
    minHeight: 22,
  },
  colNo: {
    width: "5%",
    borderRightWidth: 0.6,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  colComp: {
    width: "20%",
    borderRightWidth: 0.6,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  colDef: {
    width: "55%",
    borderRightWidth: 0.6,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    paddingHorizontal: 4,
    paddingVertical: 2.5,
  },
  colPLGroup: {
    width: "20%",
    flexDirection: "column",
  },
  colPLCell: {
    width: "5%",
    borderRightWidth: 0.6,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    alignItems: "center",
  },
  colPLCellLast: {
    width: "5%",
    justifyContent: "center",
    alignItems: "center",
  },

  // Summary & Recommendation Page 4
  maroonBar: {
    backgroundColor: C.maroon,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  maroonBarText: {
    color: C.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    textAlign: "center",
  },
  summarySubHeader: {
    flexDirection: "row",
    backgroundColor: C.maroon,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  summaryHalfHead: {
    width: "50%",
    paddingVertical: 2.5,
    alignItems: "center",
  },
  summaryBodyRow: {
    flexDirection: "row",
    minHeight: 118,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  summaryHalfBody: {
    width: "50%",
    padding: 5,
    fontSize: 7.2,
    lineHeight: 1.35,
  },
  recRow: {
    flexDirection: "row",
    borderBottomWidth: 0.6,
    borderBottomColor: C.borderBlack,
    minHeight: 14,
    alignItems: "center",
  },
  recCheckCell: {
    width: "6%",
    borderRightWidth: 0.6,
    borderRightColor: C.borderBlack,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
  },
  recTextCell: {
    width: "94%",
    paddingHorizontal: 5,
    paddingVertical: 2,
    fontSize: 7,
  },
  p4Footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 3,
  },
  legendBox: {
    width: 18,
    height: 9,
    borderWidth: 0.7,
    borderColor: C.borderBlack,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 5,
  },

  // Pages 5-9 Competency Profile styles
  profMainBanner: {
    backgroundColor: C.maroon,
    borderWidth: 1,
    borderColor: C.borderBlack,
    paddingVertical: 6,
    marginBottom: 8,
  },
  profMainBannerText: {
    color: C.white,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    textAlign: "center",
  },
  clusterHeading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    marginBottom: 4,
    marginTop: 4,
  },
  compCard: {
    borderWidth: 1,
    borderColor: C.borderBlack,
    marginBottom: 12,
  },
  compCardHead: {
    flexDirection: "row",
    backgroundColor: C.maroon,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  compTitleCell: {
    width: "72%",
    borderRightWidth: 0.8,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  compLvlGroup: {
    width: "28%",
    flexDirection: "column",
  },
  compBodyTop: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  compLeftCol: {
    width: "72%",
    borderRightWidth: 0.8,
    borderRightColor: C.borderBlack,
    flexDirection: "column",
  },
  compDefBox: {
    padding: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    lineHeight: 1.35,
  },
  compKBBox: {
    padding: 6,
    fontSize: 7.8,
    lineHeight: 1.38,
    minHeight: 88,
  },
  compRightCols: {
    width: "28%",
    flexDirection: "row",
  },
  compNumCol: {
    width: "19%",
    borderRightWidth: 0.7,
    borderRightColor: C.borderBlack,
    justifyContent: "center",
    alignItems: "center",
  },
  compGapCol: {
    width: "24%",
    justifyContent: "center",
    alignItems: "center",
  },
  compNarrativeBox: {
    backgroundColor: C.pinkBox,
    padding: 7,
    minHeight: 82,
  },
  compNarrativeText: {
    fontSize: 8,
    lineHeight: 1.38,
  },

  // Page 10 Development Plan styles
  devOuter: {
    borderWidth: 1,
    borderColor: C.borderBlack,
  },
  devMainHead: {
    backgroundColor: C.maroon,
    paddingVertical: 5,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  devSubHead: {
    backgroundColor: C.subHeaderPink,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  devSubHeadText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
  },
  devContentBox: {
    padding: 7,
    minHeight: 135,
    borderBottomWidth: 0.8,
    borderBottomColor: C.borderBlack,
  },
  devItemText: {
    fontSize: 8,
    lineHeight: 1.42,
    marginBottom: 2,
  },
});

const formatDateID = (val?: string | null): string => {
  if (!val) return "-";
  const m = moment(val);
  return m.isValid() ? m.format("DD MMM YYYY") : String(val);
};

const CompetencyProfileBlock: React.FC<{ item: ACCompetencyEvaluated }> = ({ item }) => {
  const master = AC_COMPETENCY_MASTER.find((m) => m.code === item.competency_code);
  const fullDef = master?.pdfDefinition || item.definition;

  return (
    <View style={s.compCard} wrap={false}>
      {/* Header */}
      <View style={s.compCardHead}>
        <View style={s.compTitleCell}>
          <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 8.5 }}>
            {item.competency_name.toUpperCase()}
          </Text>
        </View>
        <View style={s.compLvlGroup}>
          <View
            style={{
              borderBottomWidth: 0.7,
              borderBottomColor: C.borderBlack,
              paddingVertical: 2.5,
              alignItems: "center",
            }}
          >
            <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
              LEVEL KOMPETENSI
            </Text>
          </View>
          <View style={{ flexDirection: "row" }}>
            {[1, 2, 3, 4].map((lvl) => (
              <View
                key={lvl}
                style={{
                  width: "19%",
                  borderRightWidth: 0.7,
                  borderRightColor: C.borderBlack,
                  paddingVertical: 2,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                  {lvl}
                </Text>
              </View>
            ))}
            <View style={{ width: "24%", paddingVertical: 2, alignItems: "center" }}>
              <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7 }}>
                GAP
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Definition + Key Behavior + Score Columns */}
      <View style={s.compBodyTop}>
        <View style={s.compLeftCol}>
          <View style={s.compDefBox}>
            <Text>{fullDef}</Text>
          </View>
          <View style={s.compKBBox}>
            <Text style={{ fontStyle: "italic", marginBottom: 2 }}>Key Behavior:</Text>
            <Text>{item.key_behavior}</Text>
          </View>
        </View>

        <View style={s.compRightCols}>
          {[1, 2, 3, 4].map((lvl) => {
            const isStd = item.required_level === lvl;
            const isAct = item.actual_level === lvl;
            return (
              <View
                key={lvl}
                style={[
                  s.compNumCol,
                  isStd ? { backgroundColor: C.shadeGray } : {},
                ]}
              >
                <Text style={{ fontSize: 8.5 }}>{isAct ? "X" : ""}</Text>
              </View>
            );
          })}
          <View style={s.compGapCol}>
            <Text style={{ fontSize: 8.5 }}>{item.gap}</Text>
          </View>
        </View>
      </View>

      {/* Uraian Kompetensi & Gap */}
      <View style={s.compNarrativeBox}>
        <Text style={[s.compNarrativeText, { marginBottom: 6 }]}>
          {"Uraian Kompetensi:\n"}
          {item.uraian_kompetensi || "-"}
        </Text>
        {item.is_pass ? (
          <Text style={s.compNarrativeText}>Gap: -</Text>
        ) : (
          <Text style={s.compNarrativeText}>
            {"Gap:\n"}
            {item.uraian_gap || "-"}
          </Text>
        )}
      </View>
    </View>
  );
};

export const buildACReportDocument = (report: ACReportDetail) => {
  const coverBuffer = resolveAssetBuffer("ac_report_cover.jpg");
  const logoBuffer = resolveAssetBuffer("KPN_CORP_NEW_LOGO.png");

  const byCode = (code: string) =>
    report.competencies.find((c) => c.competency_code === code)!;

  const targetGrade = report.target_grade || "6A";
  const gradeDigit = targetGrade.replace(/[^0-9]/g, "") || targetGrade;
  const evalGrade = report.evaluation_grade || targetGrade;
  const durationText = report.development_duration || "6 - 12 bulan";
  const signPlace =
    report.sign_place_date ||
    `${report.work_location || "Jakarta"}, ${
      report.review_date ? moment(report.review_date).format("MMMM YYYY") : moment().format("MMMM YYYY")
    }`;

  const gapItems = report.competencies.filter((c) => !c.is_pass);

  return (
    <Document title={`Report Assessment Center - ${report.assessee_name} (${report.assessee_nik})`}>
      {/* ================= PAGE 1: COVER ================= */}
      <Page size="A4" style={s.coverPage}>
        {coverBuffer ? (
          <Image
            src={coverBuffer}
            style={{ width: "88%", height: "88%", objectFit: "contain" }}
          />
        ) : (
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            {logoBuffer && <Image src={logoBuffer} style={{ width: 140, marginBottom: 30 }} />}
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 28, color: C.maroon }}>
              KPN CORP
            </Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 22, marginTop: 8 }}>
              ASSESSMENT REPORT
            </Text>
          </View>
        )}
      </Page>

      {/* ================= PAGE 2: PENDAHULUAN ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.framedContainer}>
          <View style={s.introBanner}>
            {logoBuffer && (
              <View style={s.logoPill}>
                <Image src={logoBuffer} style={{ width: "100%" }} />
              </View>
            )}
            <Text style={s.bannerTitle}>PENDAHULUAN</Text>
          </View>

          <View style={s.introBody}>
            <Text style={[s.introHeading, { marginTop: 4 }]}>TUJUAN</Text>
            <Text style={s.introParagraph}>
              Tujuan laporan asesmen ini adalah untuk menggambarkan kesesuaian antara kompetensi dan
              potensi asesi dengan kompetensi yang diharapkan oleh perusahaan. Laporan ini tidak
              mengukur kinerja saat ini, melainkan menilai profil kompetensi berdasarkan pengetahuan
              dan pengalaman kerja asesi yang diperoleh melalui Assessment Center oleh tim Talent
              Management KPN Corp. Hasil asesmen ini dimaksudkan untuk memberikan wawasan kepada
              pengguna dan manajemen mengenai kompetensi asesi sesuai dengan golongan jabatan yang
              ditetapkan, baik untuk posisi saat ini maupun posisi tujuan.
            </Text>

            <Text style={s.introHeading}>ISI LAPORAN</Text>
            <Text style={s.introParagraph}>
              Laporan ini menyajikan profil kompetensi asesi, termasuk keunggulan, kelemahan, dan
              rekomendasi pengembangan untuk mengoptimalkan kompetensi mereka. Laporan ini juga
              mencakup informasi rinci tentang kompetensi yang diperlukan untuk posisi saat ini,
              serta rencana pengembangan terarah untuk membantu mengembangkan karyawan yang
              berkualitas dan sesuai dengan kebutuhan perusahaan.
            </Text>

            <Text style={s.introHeading}>KERAHASIAAN</Text>
            <Text style={s.introParagraph}>
              Laporan hasil Assessment Center bersifat rahasia dan hanya boleh diakses oleh
              pihak-pihak yang berwenang. Kerahasiaan laporan ini harus dijaga untuk melindungi
              informasi sensitif dan memastikan data tidak disebarluaskan secara sembarangan.
            </Text>

            <Text style={s.introHeading}>DISCLAIMER</Text>
            <Text style={s.introParagraph}>
              Laporan hasil Assessment Center ini disusun sebagai salah satu bahan pertimbangan dalam
              pengambilan keputusan. Untuk memperoleh gambaran yang lebih objektif dan komprehensif,
              disarankan untuk menyelaraskan hasil laporan ini dengan penilaian kinerja, rekam jejak
              pengalaman, kompetensi teknis, serta referensi relevan lainnya. Karena validitas
              laporan dapat menurun seiring waktu, lakukan asesmen ulang jika laporan sudah lebih
              dari dua tahun, mengingat kemungkinan adanya perubahan dalam jabatan atau pengalaman
              peserta. Semua asesmen dilakukan oleh asesor bersertifikat dan berpengalaman.
            </Text>

            <Text style={s.introHeading}>AKURASI</Text>
            <Text style={s.introParagraph}>
              Laporan hasil Assessment Center ini dianggap valid untuk periode 18–24 bulan (maksimal
              2 tahun). Meskipun demikian, masa validitas tersebut dapat menjadi lebih singkat
              tergantung pada intensitas perubahan yang signifikan dalam lingkup pekerjaan,
              perkembangan karier, maupun aspek pengalaman asesi. Dengan pertimbangan tersebut,
              direkomendasikan untuk melakukan asesmen ulang terhadap laporan yang telah berusia
              lebih dari 2 (dua) tahun. Seluruh proses evaluasi dalam laporan ini dilaksanakan secara
              profesional oleh Asesor bersertifikat dan berpengalaman.
            </Text>
          </View>
        </View>
      </Page>

      {/* ================= PAGE 3: ALAT UKUR ASESMEN ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.framedContainer}>
          <View style={s.introBanner}>
            {logoBuffer && (
              <View style={s.logoPill}>
                <Image src={logoBuffer} style={{ width: "100%" }} />
              </View>
            )}
            <Text style={s.bannerTitle}>ALAT UKUR ASESMEN</Text>
          </View>

          <View style={s.introBody}>
            <Text style={[s.introHeading, { marginTop: 4 }]}>TES POTENSI & SIKAP KERJA</Text>
            <Text style={s.introParagraph}>
              Metode ini digunakan untuk mengukur intelegensi, sikap kerja, dan kepribadian asesi.
              Melalui tes ini, diperoleh gambaran tentang kemampuan intelektual serta karakteristik
              unik yang membentuk perilaku asesi, memberikan pandangan menyeluruh tentang potensi dan
              kesesuaian asesi dengan peran pekerjaan tertentu.
            </Text>

            <Text style={s.introHeading}>PROBLEM ANALYSIS</Text>
            <Text style={s.introParagraph}>
              Problem Analysis adalah tools dalam metode Asesmen Center di mana asesi diberikan kasus
              yang harus diselesaikan dengan mengelaborasi informasi berdasarkan pengalaman dan
              pengetahuan pribadi asesi. Dalam proses ini, asesi diharapkan untuk mengidentifikasi
              masalah dan menuliskan solusi yang tepat. Tools ini digunakan untuk mengukur kemampuan
              interpersonal dan analisis asesi melalui studi kasus yang disajikan dalam konteks
              pengelolaan perusahaan.
            </Text>

            <Text style={s.introHeading}>IN TRAY</Text>
            <Text style={s.introParagraph}>
              In-Tray adalah tools dalam metode Asesmen Center di mana asesi diberikan sejumlah
              dokumen berisi berbagai persoalan yang harus diselesaikan. Asesi dituntut untuk
              mengidentifikasi masalah, menentukan prioritas, dan memutuskan tindakan yang tepat
              untuk mengatasinya. Simulasi ini mereplikasi situasi nyata yang dihadapi asesi dalam
              tugas keseharian, dengan fokus pada respons terhadap masalah yang terdapat dalam
              dokumen tersebut.
            </Text>

            <Text style={s.introHeading}>LEADERLESS GROUP DISCUSSION</Text>
            <Text style={s.introParagraph}>
              Leaderless Group Discussion (LGD) adalah tools dalam metode Asesmen Center di mana para
              asesi bersama-sama menyelesaikan masalah dalam waktu yang ditentukan tanpa pimpinan
              kelompok. Dalam proses penyelesaian masalah ini, para asesi akan berdiskusi dan berbagi
              pengetahuan serta pengalaman, menyusun rekomendasi bersama, dan menunjukkan efektivitas
              kerja tim dalam situasi formal yang tidak terstruktur.
            </Text>

            <Text style={s.introHeading}>BEHAVIOURAL EVENT INTERVIEW</Text>
            <Text style={s.introParagraph}>
              Behavioral Event Interview (BEI) adalah metode wawancara berbasis kompetensi yang
              digunakan untuk menilai perilaku asesi melalui pengalaman konkret yang pernah dialami.
              Wawancara ini menggali perilaku asesi pada situasi tertentu serta mengkonfirmasi data
              dari simulasi sebelumnya untuk menilai kesesuaian kompetensi dengan kebutuhan
              perusahaan.
            </Text>
          </View>
        </View>
      </Page>

      {/* ================= PAGE 4: HASIL ASESMEN KARYAWAN ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.p4TopBar}>
          <View style={{ width: 78 }}>
            {logoBuffer && <Image src={logoBuffer} style={{ width: 74 }} />}
          </View>
          <Text style={s.p4Title}>HASIL ASESMEN KARYAWAN / EMPLOYEE ASSESSMENT RESULT</Text>
          <View style={s.confidentialBox}>
            <Text style={s.confidentialText}>{"Strictly\nConfidential"}</Text>
          </View>
        </View>

        {/* Identity Grid */}
        <View style={s.identityGrid}>
          <View style={s.identityCol}>
            <View style={s.idRow}>
              <Text style={s.idLabel}>NIK / Employee ID Number</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.assessee_nik || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Nama / Name</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.assessee_name || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Gender</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.gender || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Usia / Age</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.age || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Unit Bisnis / Business Unit</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.business_unit || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>{"Posisi dan Golongan Saat ini /\nCurrent Position and Grade"}</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.current_position_grade || "-"}</Text>
            </View>
          </View>

          <View style={s.identityCol}>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Assessor</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.assessor_name || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Departemen / Department</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.department || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Lokasi Kerja / Work Location</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{report.work_location || "-"}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Tgl. Masuk / Join Date</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{formatDateID(report.join_date)}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>Tgl. Review / Review Date</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>{formatDateID(report.review_date)}</Text>
            </View>
            <View style={s.idRow}>
              <Text style={s.idLabel}>{"Posisi dan Golongan Tujuan /\nProposed Position and Grade"}</Text>
              <Text style={s.idColon}>:</Text>
              <Text style={s.idValue}>
                {report.proposed_position
                  ? `${report.proposed_position} / ${targetGrade}`
                  : targetGrade}
              </Text>
            </View>
          </View>
        </View>

        {/* Main Table Container */}
        <View style={s.tableOuter}>
          {/* Matrix Header */}
          <View style={s.matrixHeaderRow}>
            <View style={s.colNo}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7 }}>No.</Text>
            </View>
            <View style={[s.colComp, { alignItems: "center" }]}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7, textAlign: "center" }}>
                {"Kompetensi /\nCompetencies"}
              </Text>
            </View>
            <View style={[s.colDef, { alignItems: "center" }]}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7 }}>
                Definisi / Definition
              </Text>
            </View>
            <View style={s.colPLGroup}>
              <View
                style={{
                  borderBottomWidth: 0.6,
                  borderBottomColor: C.borderBlack,
                  paddingVertical: 2,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 6.5, textAlign: "center" }}>
                  {"Level Profisiensi /\nProficiency Level"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", flex: 1 }}>
                {[1, 2, 3, 4].map((lvl) => (
                  <View
                    key={lvl}
                    style={{
                      width: "25%",
                      borderRightWidth: lvl < 4 ? 0.6 : 0,
                      borderRightColor: C.borderBlack,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 1.5,
                    }}
                  >
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7 }}>{lvl}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 9 Competency Rows */}
          {report.competencies.map((item) => (
            <View key={item.competency_code} style={s.matrixRow}>
              <View style={s.colNo}>
                <Text style={{ fontSize: 6.8 }}>{item.no}.</Text>
              </View>
              <View style={s.colComp}>
                <Text style={{ fontSize: 6.8 }}>{item.competency_name}</Text>
              </View>
              <View style={s.colDef}>
                <Text style={{ fontStyle: "italic", fontSize: 6.4, lineHeight: 1.25 }}>
                  {item.definition}
                </Text>
              </View>
              {[1, 2, 3, 4].map((lvl) => {
                const isStd = item.required_level === lvl;
                const isAct = item.actual_level === lvl;
                return (
                  <View
                    key={lvl}
                    style={[
                      lvl < 4 ? s.colPLCell : s.colPLCellLast,
                      isStd ? { backgroundColor: C.shadeGray } : {},
                    ]}
                  >
                    <Text style={{ fontSize: 7 }}>{isAct ? "X" : ""}</Text>
                  </View>
                );
              })}
            </View>
          ))}

          {/* RINGKASAN / SUMMARY */}
          <View style={s.maroonBar}>
            <Text style={s.maroonBarText}>RINGKASAN / SUMMARY</Text>
          </View>
          <View style={s.summarySubHeader}>
            <View
              style={[
                s.summaryHalfHead,
                { borderRightWidth: 0.8, borderRightColor: C.borderBlack },
              ]}
            >
              <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7 }}>
                KEKUATAN / STRENGTH
              </Text>
            </View>
            <View style={s.summaryHalfHead}>
              <Text style={{ color: C.white, fontFamily: "Helvetica-Bold", fontSize: 7 }}>
                AREA PENGEMBANGAN / AREA OF DEVELOPMENT
              </Text>
            </View>
          </View>
          <View style={s.summaryBodyRow}>
            <View
              style={[
                s.summaryHalfBody,
                { borderRightWidth: 0.8, borderRightColor: C.borderBlack },
              ]}
            >
              <Text>{report.strength || "-"}</Text>
            </View>
            <View style={s.summaryHalfBody}>
              <Text>{report.area_of_development || "-"}</Text>
            </View>
          </View>

          {/* REKOMENDASI / RECOMMENDATION */}
          <View style={[s.maroonBar, { alignItems: "flex-start" }]}>
            <Text style={[s.maroonBarText, { textAlign: "left" }]}>
              REKOMENDASI / RECOMMENDATION :
            </Text>
          </View>

          <View style={s.recRow}>
            <View style={s.recCheckCell}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                {report.recommendation_type === "Suitable" ? "X" : ""}
              </Text>
            </View>
            <View style={s.recTextCell}>
              <Text>
                {report.recommendation_type === "Suitable"
                  ? `Sesuai untuk golongan ${targetGrade} / Recommended for grade ${targetGrade}`
                  : "Sesuai untuk golongan x / Recommended for grade x"}
              </Text>
            </View>
          </View>

          <View style={s.recRow}>
            <View style={s.recCheckCell}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                {report.recommendation_type === "Need Development" ? "X" : ""}
              </Text>
            </View>
            <View style={s.recTextCell}>
              <Text>
                {report.recommendation_type === "Need Development"
                  ? `Perlu pengembangan dan evaluasi selama ${durationText} untuk golongan ${evalGrade} / Required ${durationText} of development and evaluation for grade ${evalGrade}`
                  : "Perlu pengembangan dan evaluasi selama x bulan untuk golongan y / Required x months of development and evaluation for grade y"}
              </Text>
            </View>
          </View>

          <View style={[s.recRow, { borderBottomWidth: 0 }]}>
            <View style={s.recCheckCell}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
                {report.recommendation_type === "Not Recommended" ? "X" : ""}
              </Text>
            </View>
            <View style={s.recTextCell}>
              <Text>
                {report.recommendation_type === "Not Recommended"
                  ? `Belum sesuai untuk golongan ${gradeDigit} / Not recommended for grade ${gradeDigit}`
                  : "Belum sesuai untuk golongan x / Not recommended for grade x"}
              </Text>
            </View>
          </View>
        </View>

        {/* Legend & Signature */}
        <View style={s.p4Footer}>
          <View>
            <View style={s.legendRow}>
              <View style={[s.legendBox, { backgroundColor: C.shadeGray }]} />
              <Text style={{ fontSize: 6.8 }}>: Standar kompetensi yang diharapkan</Text>
            </View>
            <View style={s.legendRow}>
              <View style={s.legendBox}>
                <Text style={{ fontSize: 6.5 }}>x</Text>
              </View>
              <Text style={{ fontSize: 6.8 }}>: Aktual kompetensi yang dicapai asesi</Text>
            </View>
          </View>

          <View style={{ alignItems: "center", width: 155 }}>
            <Text style={{ fontSize: 7.2, marginBottom: 22 }}>{signPlace}</Text>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5 }}>
              {report.assessor_name || "Asesor"}
            </Text>
            <Text style={{ fontSize: 7 }}>Asesor</Text>
          </View>
        </View>
      </Page>

      {/* ================= PAGE 5: S & I ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.profMainBanner}>
          <Text style={s.profMainBannerText}>PROFIL KOMPETENSI</Text>
        </View>
        <Text style={s.clusterHeading}>A. KOMPETENSI CULTURE</Text>
        <CompetencyProfileBlock item={byCode("S")} />
        <CompetencyProfileBlock item={byCode("I")} />
      </Page>

      {/* ================= PAGE 6: G & A ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.profMainBanner}>
          <Text style={s.profMainBannerText}>PROFIL KOMPETENSI</Text>
        </View>
        <Text style={s.clusterHeading}>A. KOMPETENSI CULTURE</Text>
        <CompetencyProfileBlock item={byCode("G")} />
        <CompetencyProfileBlock item={byCode("A")} />
      </Page>

      {/* ================= PAGE 7: P & MP ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.profMainBanner}>
          <Text style={s.profMainBannerText}>PROFIL KOMPETENSI</Text>
        </View>
        <Text style={s.clusterHeading}>A. KOMPETENSI CULTURE</Text>
        <CompetencyProfileBlock item={byCode("P")} />
        <Text style={[s.clusterHeading, { marginTop: 6 }]}>B. KOMPETENSI LEADERSHIP</Text>
        <CompetencyProfileBlock item={byCode("MP")} />
      </Page>

      {/* ================= PAGE 8: DM & DO ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.profMainBanner}>
          <Text style={s.profMainBannerText}>PROFIL KOMPETENSI</Text>
        </View>
        <Text style={s.clusterHeading}>B. KOMPETENSI LEADERSHIP</Text>
        <CompetencyProfileBlock item={byCode("DM")} />
        <CompetencyProfileBlock item={byCode("DO")} />
      </Page>

      {/* ================= PAGE 9: RB ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.profMainBanner}>
          <Text style={s.profMainBannerText}>PROFIL KOMPETENSI</Text>
        </View>
        <Text style={s.clusterHeading}>B. KOMPETENSI LEADERSHIP</Text>
        <CompetencyProfileBlock item={byCode("RB")} />
      </Page>

      {/* ================= PAGE 10: RENCANA PENGEMBANGAN 70:20:10 ================= */}
      <Page size="A4" style={s.page}>
        <View style={s.devOuter}>
          <View style={s.devMainHead}>
            <Text
              style={{
                color: C.white,
                fontFamily: "Helvetica-Bold",
                fontSize: 9.5,
                textAlign: "center",
              }}
            >
              RENCANA PENGEMBANGAN / DEVELOPMENT PLAN
            </Text>
          </View>

          {/* 10% Training */}
          <View style={s.devSubHead}>
            <Text style={s.devSubHeadText}>10% Training Soft Competencies:</Text>
          </View>
          <View style={s.devContentBox}>
            {gapItems.length === 0 ? (
              <Text style={s.devItemText}>
                - Seluruh kompetensi telah memenuhi standar nilai golongan tujuan.
              </Text>
            ) : (
              gapItems.map((g) => (
                <Text key={`tr-${g.competency_code}`} style={s.devItemText}>
                  {g.competency_name}: {g.training_recommendation || "-"}
                </Text>
              ))
            )}
          </View>

          {/* 20% Coaching */}
          <View style={s.devSubHead}>
            <Text style={s.devSubHeadText}>20% Sesi Coaching dengan Atasan:</Text>
          </View>
          <View style={s.devContentBox}>
            {gapItems.length === 0 ? (
              <Text style={s.devItemText}>-</Text>
            ) : (
              gapItems.map((g) => (
                <Text key={`co-${g.competency_code}`} style={s.devItemText}>
                  {g.competency_name}: {g.coaching_plan || "-"}
                </Text>
              ))
            )}
          </View>

          {/* 70% Penugasan / OJT */}
          <View style={s.devSubHead}>
            <Text style={s.devSubHeadText}>70% Penugasan :</Text>
          </View>
          <View style={[s.devContentBox, { borderBottomWidth: 0, minHeight: 165 }]}>
            {gapItems.length === 0 ? (
              <Text style={s.devItemText}>-</Text>
            ) : (
              gapItems.map((g) => (
                <Text key={`ojt-${g.competency_code}`} style={s.devItemText}>
                  {g.competency_name}: {g.ojt_plan || "-"}
                </Text>
              ))
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const streamACReportPDF = async (report: ACReportDetail) => {
  const doc = buildACReportDocument(report);
  return await renderToStream(doc);
};
