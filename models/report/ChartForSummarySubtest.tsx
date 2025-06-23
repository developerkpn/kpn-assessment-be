import React from "react";
import { View, Text } from "@react-pdf/renderer";
// src/components/report/styles/chartStyles.ts
import { StyleSheet } from "@react-pdf/renderer";
import { ReportDetailSubtest } from "@/types/Report";

export const chartStyles = StyleSheet.create({
  container: {
    marginVertical: 8, // jarak antar subtest
  },
  title: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4, // jarak ke bar
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 8, // spasi kiri/kanan antara bar dan teks min/max
  },
  barFill: {
    height: "100%",
    backgroundColor: "#d32f2f",
  },
  minMaxText: {
    fontSize: 8,
    width: 30, // cukup untuk “min:0”
    textAlign: "center" as const,
  },
});

const MAX_POINT = 100;

export const SubtestChartSection: React.FC<{ subtests: ReportDetailSubtest[] }> = ({ subtests }) => (
  <View style={{ margin: "15 30" }}>
    {subtests.map((st, i) => {
      const point = st.result.subtest_point || 0;
      const pct = Math.min(100, Math.max(0, (point / MAX_POINT) * 100));
      return (
        <View key={i} style={chartStyles.container}>
          <Text style={chartStyles.title}>
            {st.subtest_name} ({st.subtest_code})
          </Text>

          <View style={chartStyles.barRow}>
            <Text style={chartStyles.minMaxText}>min:0</Text>

            <View style={chartStyles.barTrack}>
              <View style={[chartStyles.barFill, { width: `${pct}%` }]} />
            </View>

            <Text style={chartStyles.minMaxText}>max:{MAX_POINT}</Text>
          </View>
        </View>
      );
    })}
  </View>
);
