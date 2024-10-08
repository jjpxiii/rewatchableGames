// routes/games/[week].tsx

import { Handlers } from "$fresh/server.ts";
import { renderChart } from "https://deno.land/x/fresh_charts@0.1.0/mod.ts";
import {
  ChartColors,
  transparentize,
} from "https://deno.land/x/fresh_charts@0.1.0/utils.ts";

export const handler: Handlers<unknown | null> = {
  async GET(_, ctx) {
    const { gameId } = ctx.params;

    // some ids
    // 401437636
    // 401437833

    // probabilities
    const resProbs = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${gameId}/competitions/${gameId}/probabilities?limit=400`,
    );
    const jsonProbs = await resProbs.json();
    const gameProbsHome = jsonProbs?.items.map(
      (item) => item.homeWinPercentage,
    );
    // console.log(gameProbsHome);
    const _gameProbsAway = jsonProbs?.items.map(
      (item) => 1 - item.homeWinPercentage,
    );
    const gameProbsCombined = jsonProbs?.items.map((item) => {
      if (item.homeWinPercentage >= 0.5) {
        return item.homeWinPercentage;
      }
      if (item.homeWinPercentage < 0.5) {
        return (1 - item.homeWinPercentage) * -1;
      }
    });

    // console.log(ComputeScenarioRating(jsonProbs));

    return renderChart({
      type: "line",
      data: {
        labels: [...Array(gameProbsHome.length).keys()],
        datasets: [
          //   {
          //     label: "Home prob",
          //     data: gameProbsHome,
          //     borderColor: ChartColors.Red,
          //     backgroundColor: transparentize(ChartColors.Red, 0.5),
          //     borderWidth: 1,
          //   },
          //   {
          //     label: "Away prob",
          //     data: gameProbsAway,
          //     borderColor: ChartColors.Blue,
          //     backgroundColor: transparentize(ChartColors.Blue, 0.5),
          //     borderWidth: 1,
          //   },
          {
            label: "Combined",
            data: gameProbsCombined,
            borderColor: ChartColors.Orange,
            backgroundColor: transparentize(ChartColors.Orange, 0.5),
            borderWidth: 1,
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
        devicePixelRatio: 1,
        scales: {
          xAxes: [
            {
              display: false, //this will remove all the x-axis grid lines
            },
          ],
          yAxes: [
            {
              ticks: {
                max: 1,
                min: -1,
              },
            },
            {
              display: false, //this will remove all the x-axis grid lines
            },
          ],
          y: {
            min: -1,
            max: 1,
          },
        },
      },
    });
  },
};
