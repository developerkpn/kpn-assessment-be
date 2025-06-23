import { ReportDetailSubtest } from "@/types/Report";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
const chartWidth = 550;
const chartHeight = 300;

export const BarChartSummaryCategory = async (subtest: ReportDetailSubtest) => {
  const categories = subtest.result.categories;
  const ChartLabels = categories.map((cat) => cat.category_code);
  const ChartValues = categories.map((cat) => cat.category_point ?? 0);
  const chart = new ChartJSNodeCanvas({ width: chartWidth, height: chartHeight });

  const config = {
    type: "bar" as const,
    data: {
      ChartLabels,
      datasets: [
        {
          label: "Scores",
          data: ChartValues,
          backgroundColor: "rgba(247, 14, 14, 0.4)",
          borderColor: "rgba(1, 4, 7, 0)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
    },
  };
  const result = await chart.renderToBuffer(config);
  return result;
};
