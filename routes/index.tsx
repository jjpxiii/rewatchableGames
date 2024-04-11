import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "twind";
import { aspectRatio } from "@twind/aspect-ratio";
import { Footer } from "@/components/Footer.tsx";
import { HeadElement } from "@/components/HeadElement.tsx";
import { Header } from "@/components/Header.tsx";
import GameList from "@/islands/GameList.tsx";
import { GameStats, List, Product } from "../types.ts";
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
    const lastWeek = 13;
    const data: Data =  {
      gameStats: [],
    };
    for (let i = 1; i <= lastWeek; i++) {
      const stat = await Deno.stat(`data/2023/${i}.json`);
      const gameListString = stat.isFile
        ? await Deno.readTextFile(`data/2023/${i}.json`)
        : await extract(2023, i);
      const gameList = JSON.parse(gameListString) as GameStats[];
      gameList.map((gameStats: GameStats) => {
        data.gameStats.push({
          id: gameStats.id,
          week: i,
          fullName: gameStats.fullName,
          shortName: gameStats.shortName,
          matchupQuality: gameStats.matchupQuality,
          offensiveRating: computeOffensiveRating(gameStats),
          defensiveBigPlays: computeDefensiveBigPlays(gameStats),
          scenarioRating: gameStats.scenario.scenarioRating,
          totalRating: computeOffensiveRating(gameStats) +
            computeDefensiveBigPlays(gameStats) +
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
  const year = useSignal(2023);

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
          <Button onClick={() => setYear(2023)}>
            2023
          </Button>
          <Button onClick={() => setYear(2023)}>
            2022
          </Button>
          <Button onClick={() => setYear(2021)}>
            2021
          </Button>
        </div>
        <GameList {...data} />
      </div>
      <Footer />
    </div>
  );
}
