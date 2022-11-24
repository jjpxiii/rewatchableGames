import { type Handlers } from "$fresh/server.ts";
import { renderChart } from "https://deno.land/x/fresh_charts@0.1.0/mod.ts";
import {
  ChartColors,
  transparentize,
} from "https://deno.land/x/fresh_charts@0.1.0/utils.ts";

export const handler: Handlers = {
  GET() {
    return renderChart({
      type: "line",
      data: {
        labels: ["1", "2", "3"],
        datasets: [
          {
            label: "Sessions",
            data: [123, 234, 234],
            borderColor: ChartColors.Red,
            backgroundColor: transparentize(ChartColors.Red, 0.5),
            borderWidth: 1,
          },
          {
            label: "Users",
            data: [346, 233, 123],
            borderColor: ChartColors.Blue,
            backgroundColor: transparentize(ChartColors.Blue, 0.5),
            borderWidth: 1,
          },
        ],
      },
      options: {
        devicePixelRatio: 1,
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
      },
    });
  },
};
