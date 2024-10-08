import { Handlers, PageProps } from "$fresh/server.ts";
import { Footer } from "@/components/Footer.tsx";
import { HeadElement } from "@/components/HeadElement.tsx";
import { Header } from "@/components/Header.tsx";
import GameList from "@/islands/GameList.tsx";
import { GameStats } from "../types.ts";
import { extract } from "../utils/extract.ts";
import {
  computeDefensiveBigPlays,
  computeOffensiveRating,
} from "../utils/ratings.ts";
import { Button } from "@/components/Button.tsx";
import { useSignal } from "@preact/signals";

interface Data {
  gameStats: GameStats[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    // const data = await graphql<Data>(q);
    const lastWeek = 5;
    const data: Data = {
      gameStats: [],
    };
    for (let i = 1; i <= lastWeek; i++) {
      const stat = await Deno.stat(`data/2024/${i}.json`);
      const gameListString = stat.isFile
        ? await Deno.readTextFile(`data/2024/${i}.json`)
        : await extract("2024", i.toString());
      const gameList = JSON.parse(gameListString) as GameStats[];
      gameList.map((gameStats: GameStats) => {
        data.gameStats.push({
          id: gameStats.id,
          week: i,
          fullName: gameStats.fullName,
          shortName: gameStats.shortName,
          matchupQuality: gameStats.matchupQuality,
          offense: gameStats.offense,
          marginOfVictory: gameStats.scenario.marginOfVictory,
          offensiveBigPlays: gameStats.offense.offensiveBigPlays,
          offensiveExplosivePlays: gameStats.offense.offensiveExplosivePlays,
          offensiveRating: computeOffensiveRating(gameStats),
          defensiveBigPlays: computeDefensiveBigPlays(gameStats),
          leadershipChange: gameStats.scenario.leadershipChange,
          fourthQuarterLeadershipChange:
            gameStats.scenario.fourthQuarterLeadershipChange,
          scenarioRating: gameStats.scenario.scenarioRating,
          totalRating: computeOffensiveRating(gameStats) * 1.5 +
            computeDefensiveBigPlays(gameStats) * 0.5 +
            gameStats.scenario.scenarioRating,
        });
      });
      data.gameStats = data.gameStats.sort(
        (a, b) => b.offensiveRating - a.offensiveRating,
        // (a, b) => b.defensiveBigPlays - a.defensiveBigPlays
        // (a, b) => b.scenarioRating - a.scenarioRating
        // (a, b) => b.totalRating - a.totalRating
      );
    }
    // console.log(data);
    return ctx.render(data);
  },
};

export default function Home(ctx: PageProps<Data>) {
  const { data, url } = ctx;
  const CURRENT_YEAR = 2024;
  const CURRENT_WEEK = 2;
  const year = useSignal(CURRENT_YEAR);
  const _week = useSignal(CURRENT_WEEK);
  const count = useSignal(0);
  console.log(year.value);

  const changeDates = (year, _week) => {
    // console.log('rERGPOERHPOK')
    year.value = year;
    // week.value = week;
  };

  // const products = data?.products?.nodes;
  return (
    <div>
      <HeadElement
        description="Rewatchable games"
        image={url.href + "og-image.png"}
        title="🏈 Rewatchable Games 🏈"
        url={url}
      />
      <Header />

      <div
        class="w-11/12 max-w-5xl mx-auto"
        aria-labelledby="information-heading"
      >
        <div class="flex gap-2 w-full">
          <p>{count}</p>
          {/* <button onClick={() => count.value++}>click me</button> */}
          <Button
            onClick={() => changeDates(CURRENT_WEEK, CURRENT_YEAR)}
          >
            2024
          </Button>
          <Button
            onClick={() => changeDates(2023, 18)}
          >
            2023
          </Button>
          <Button
            onClick={() => changeDates(2022, 18)}
          >
            2022
          </Button>
          <Button
            onClick={() => changeDates(2021, 17)}
          >
            2021
          </Button>
        </div>
        <GameList {...data} />
      </div>
      <Footer />
    </div>
  );
}
