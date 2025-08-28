import React from "react";
import { View, Text } from "@react-pdf/renderer";
// src/components/report/styles/chartStyles.ts
import { StyleSheet } from "@react-pdf/renderer";
import { ReportDetailSubtest } from "@/types/Report.js";

export const chartStyles = StyleSheet.create({
  container: {
    marginVertical: 8, // jarak antar subtest
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5, // jarak ke bar
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  minMaxWrapper: {
    width: 35,
    height: 14, // Tinggi sama dengan barContainer
    justifyContent: "center", // Menengahkan teks di dalamnya secara vertikal
  },
  minMaxText: {
    fontSize: 8,
    textAlign: "center" as const,
  },
  barContainer: {
    flex: 1,
    height: 14,
    position: "relative",
    marginHorizontal: 8, // spasi kiri/kanan antara bar dan teks min/max
    justifyContent: "center",
  },
  barTrack: {
    position: "absolute",
    width: "100%",
    height: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  barFill: {
    position: "absolute",
    height: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end", // Rata kanan untuk teks di dalamnya
    overflow: "hidden", // Sembunyikan teks jika barnya terlalu pendek
  },
  pointValueInner: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
    paddingHorizontal: 5, // Jarak teks dari tepi kanan bar
  },
});

export const SubtestChartSection: React.FC<{ subtests: ReportDetailSubtest[] }> = ({ subtests }) => (
  <View style={{ margin: "15 30" }}>
    {subtests.map((st, i) => {
      const point = st.result.subtest_point || 0;
      const MIN_POINT = st.result.scale.minimum_score || 0;
      const MAX_POINT = st.result.scale.maximum_score || 100;
      const pct = Math.min(100, Math.max(0, (point / MAX_POINT) * 100));
      const barColor = st.result.criteria_color || "#d32f2f";
      return (
        <View key={i} style={chartStyles.container}>
          <Text style={chartStyles.title}>
            {st.subtest_name} ({st.subtest_code})
          </Text>

          <View style={chartStyles.barRow}>
            <Text style={chartStyles.minMaxText}>min:{MIN_POINT}</Text>

            <View style={chartStyles.barContainer}>
              <View style={chartStyles.barTrack} />

              <View style={[chartStyles.barFill, { width: `${pct}%`, backgroundColor: barColor }]}>
                <Text style={chartStyles.pointValueInner}>{point}</Text>
              </View>
            </View>

            <View style={chartStyles.minMaxWrapper}>
              <Text style={chartStyles.minMaxText}>max:{MAX_POINT}</Text>
            </View>
          </View>
        </View>
      );
    })}
  </View>
);
