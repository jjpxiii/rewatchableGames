// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";
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
    console.log(gameProbsHome);
    const gameProbsAway = jsonProbs?.items.map(
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

    // let variations = [];
    let inv = 0;
    let max = 0;
    let min = 1;

    let inv_4th = 0;
    let max_4th = 0;
    let min_4th = 1;
    for (let i = 1; i < jsonProbs?.items.length; i++) {
      const element = jsonProbs.items[i].homeWinPercentage;
      if (element < min) {
        min = element;
        if (i > jsonProbs?.items.length * 0.75) {
          min_4th = element;
        }
      }
      if (element > max) {
        max = element;
        if (i > jsonProbs?.items.length * 0.75) {
          max_4th = element;
        }
      }

      if (
        (element > 0.5 && jsonProbs?.items[i - 1].homeWinPercentage < 0.5) ||
        (element < 0.5 && jsonProbs?.items[i - 1].homeWinPercentage > 0.5)
      ) {
        inv++;
        if (i > jsonProbs?.items.length * 0.75) {
          inv_4th++;
        }
      }
    }

    const scenarioRating = 0;
    // try to rate the scenario

    // if it hasn't been one-sided
    // if (min < 0.5) {
    // }

    const share =
      jsonProbs.items.filter((i) => i.homeWinPercentage >= 0.5).length /
      jsonProbs.items.length;

    const share_4th = jsonProbs.items.filter(
      (i, index) =>
        index > jsonProbs?.items.length * 0.75 && i.homeWinPercentage >= 0.5,
    ).length / jsonProbs.items.length;

    // diff between highest and lowest prob, if big this is a good scenario
    console.log(Math.abs(max - min));
    // console.log(max)
    // share of the leads, a rate approching 0.5 would be great
    console.log(inv);
    console.log(share);
    console.log("4th Q drama");
    console.log(Math.abs(max_4th - min_4th));
    console.log(inv_4th);
    console.log(share_4th);
    // return new Response(JSON.stringify(gameProbsHome), {
    //   headers: { type: "application/json" },
    // });

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
