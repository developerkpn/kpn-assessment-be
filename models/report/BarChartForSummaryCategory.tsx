import { ReportDetailSubtest } from "@/types/Report.js";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";

const chartWidth = 550;
const chartHeight = 200;

export const BarChartSummaryCategory = async (subtest: ReportDetailSubtest) => {
  const categories = subtest.result.categories;
  console.log(categories);

  const ChartLabels = categories.map((cat) => cat.category_code);
  const ChartValues = categories.map((cat) => cat.category_point ?? 0);

  // Debug logging
  console.log("ChartLabels:", ChartLabels);
  console.log("ChartValues:", ChartValues);

  const chart = new ChartJSNodeCanvas({
    width: chartWidth,
    height: chartHeight,
    backgroundColour: "white",
    chartCallback: (ChartJS) => {
      ChartJS.defaults.font.family = "Arial";
      ChartJS.defaults.color = "#000";
    },
  });

  chart.registerFont("./assets/fonts/ARIAL.TTF", { family: "Arial" });

  const config = {
    type: "bar" as const,
    data: {
      labels: ChartLabels,
      datasets: [
        {
          label: "Scores",
          data: ChartValues,
          backgroundColor: "rgba(247, 14, 14, 0.6)",
          borderColor: "rgba(247, 14, 14, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 7,
          ticks: {
            stepSize: 1,
            font: {
              family: "Arial",
              size: 10,
            },
          },
          grid: {
            display: true,
            color: "rgba(0, 0, 0, 0.1)",
          },
        },
        x: {
          ticks: {
            font: {
              family: "Arial",
              size: 10,
            },
            maxRotation: 0,
            minRotation: 0,
          },
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              family: "Arial",
              size: 12,
            },
            usePointStyle: true,
            pointStyle: "rect",
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "white",
          bodyColor: "white",
          borderColor: "rgba(247, 14, 14, 1)",
          borderWidth: 1,
          callbacks: {
            title: function (context: any) {
              return context[0].label || "";
            },
            label: function (context: any) {
              const categoryIndex = context.dataIndex;
              const category = categories[categoryIndex];
              return [
                `Score: ${context.parsed.y.toFixed(2)}`,
                `Category: ${category.category_name}`,
                `Code: ${category.category_code}`,
              ];
            },
            afterLabel: function (context: any) {
              const categoryIndex = context.dataIndex;
              const category = categories[categoryIndex];
              const description = category.description;
              if (description && description.length > 100) {
                return description.substring(0, 100) + "...";
              }
              return description || "";
            },
          },
        },
      },
    },
    animation: false, // Penting untuk PDF generation

    // Plugin untuk menampilkan nilai di atas bar
    plugins: [
      {
        id: "dataLabels",
        afterDatasetsDraw: function (chart: any) {
          const ctx = chart.ctx;

          // Set font untuk nilai di atas bar
          ctx.font = "bold 11px Arial";
          ctx.fillStyle = "#000";
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";

          // Loop through setiap dataset
          chart.data.datasets.forEach((dataset: any, datasetIndex: any) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar: any, index: any) => {
              const value = dataset.data[index];
              // Tampilkan nilai di atas bar dengan padding 5px
              ctx.fillText(value.toFixed(1), bar.x, bar.y - 5);
            });
          });
        },
      },
    ],
  };

  try {
    const result = await chart.renderToBuffer(config);
    console.log("Chart rendered successfully, buffer size:", result.length);
    return result;
  } catch (error) {
    console.error("Error rendering chart:", error);
    throw error;
  }
};
