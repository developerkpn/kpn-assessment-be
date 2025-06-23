import { StyleSheet } from "@react-pdf/renderer";

// Colors from the designs
const colors = {
  primary: "#d74e4a",
  lightPrimary: "#f7e8e8",
  white: "#ffffff",
  black: "#000000",
  green: "#a2c076",
  lightGreen: "#e7f0d9",
  lightBlue: "#d9effc",
  mediumGray: "#e6e6e6",
  lightGray: "#f5f5f5",
  darkGray: "#333333",
};

export const stylesheetrtc = {
  [".container"]: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  h1: {
    fontSize: 16,
    margin: "0 0 0 0",
  },
  h2: {
    fontSize: 15,
    margin: "0 0 4pt 0",
  },
  h3: {
    fontSize: 13,
    margin: "0 0 4pt 0",
  },
  h4: {
    fontSize: 11,
    margin: "0 0 4pt 0",
  },
  p: {
    fontSize: 10,
    margin: "0 0 4pt 0",
  },
};

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.darkGray,
  },

  // Header styles
  headerContainer: {
    backgroundColor: colors.primary,
    padding: 25,
    paddingBottom: 15,
    flexDirection: "column",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    backgroundColor: colors.white,
    borderRadius: 25,
    padding: 8,
    width: 110,
  },
  confidentialBadge: {
    backgroundColor: colors.white,
    color: colors.primary,
    padding: "5 10",
    fontWeight: "bold",
    fontSize: 10,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Section container styles
  contentSection: {
    margin: "25 40",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray,
    paddingBottom: 5,
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 10,
    lineHeight: 1.5,
    textAlign: "justify",
  },

  // Psychograph styles
  psychographHeader: {
    backgroundColor: colors.primary,
    padding: 25,
    paddingBottom: 15,
  },
  psychographTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  profileContainer: {
    backgroundColor: colors.white,
    margin: "0 25",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  profileData: {
    width: "60%",
  },
  profileImageContainer: {
    width: "20%",
  },
  profileRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  profileLabel: {
    width: 100,
  },
  profileColon: {
    width: 10,
  },

  subheaderContainer: {
    backgroundColor: colors.primary,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: "15 25",
  },

  // Category test styles
  categoryContainer: {
    backgroundColor: colors.primary,
    padding: 10,
    margin: "15 25",
  },
  categoryTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryType: {
    color: colors.black,
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    right: 10,
    top: 10,
  },

  // Chart section styles
  chartSection: {
    flexDirection: "row",
    margin: "0 25",
  },
  chartColumn: {
    width: "50%",
    backgroundColor: colors.lightPrimary,
    padding: 10,
  },
  chartTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    margin: "0 25",
    gap: 10, // React-PDF v3 supports gap
  },

  // Generic column wrapper for percentage widths
  col25: { width: "25%" },
  col33: { width: "33%" },
  col44: { width: "44%" },
  col40: { width: "40%" },
  col50: { width: "50%" },
  col60: { width: "60%" },
  col20: { width: "20%" },
  col23: { width: "23%" },

  // Boxes
  boxPrimary: {
    backgroundColor: colors.primary,
    padding: 10,
  },
  boxLightPrimary: {
    backgroundColor: colors.lightPrimary,
    padding: 10,
    flexGrow: 1,
  },
  boxLightGreen: {
    backgroundColor: colors.lightGreen,
    padding: 10,
  },

  // Text styles
  titleBold: {
    fontWeight: "bold",
  },
  titleCenter: {
    textAlign: "center",
  },

  // Norms table
  normsTable: {
    width: "100%",
    justifySelf: "center",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },
  normsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    margin: "0 auto",
  },
  normsLabel: { width: "50%" },
  normsValue: { width: "50%" },

  // Assessment block
  assessmentColumn: {
    padding: 10,
  },
  assessmentTitle: {
    fontWeight: "bold",
  },
  testDescription: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Assessment section styles
  assessmentSection: {
    flexDirection: "row",
    margin: "0 25",
  },
  assessmentLeft: {
    width: "33%",
  },
  assessmentMiddle: {
    width: "44%",
  },
  assessmentRight: {
    width: "23%",
  },

  logTable: {
    marginHorizontal: 25,
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.darkGray,
    borderRadius: 4,
  },

  // Baris header
  logHeaderRow: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  logHeaderCellDate: {
    width: "35%", // kolom tanggal+waktu sekitar 35% lebar
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  logHeaderCellActivity: {
    width: "65%", // kolom activity 65% lebar
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },

  // Setiap baris data (alternating background optional)
  logRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkGray,
  },
  logRowEven: {
    backgroundColor: colors.lightGray,
  },
  logCellDate: {
    width: "35%",
    fontSize: 9,
    color: colors.darkGray,
  },
  logCellActivity: {
    width: "65%",
    fontSize: 9,
    color: colors.darkGray,
  },
});
