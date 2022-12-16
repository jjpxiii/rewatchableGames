import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "twind";
import { aspectRatio } from "@twind/aspect-ratio";
import { Footer } from "@/components/Footer.tsx";
import { HeadElement } from "@/components/HeadElement.tsx";
import { Header } from "@/components/Header.tsx";
import { GameStats, List, Product } from "../types.ts";
import { extract } from "../utils/extract.ts";

interface Data {
  gameStats: GameStats[];
}

export const handler: Handlers<Data> = {
  async GET(_req, ctx) {
    // const data = await graphql<Data>(q);
    const lastWeek = 13;
    const data: Data = {
      gameStats: [],
    };
    for (let i = 1; i <= lastWeek; i++) {
      const gameStats = Deno.statSync(`data/2022/${i}.json`).isFile
        ? Deno.readTextFileSync(`data/2022/${i}.json`)
        : await extract("2022", i.toString());
      data.gameStats.push(...JSON.parse(gameStats));
    }
    console.log(data);
    return ctx.render(data);
  },
};

export default function Home(ctx: PageProps<Data>) {
  const { data, url } = ctx;
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
        class="w-11/12 max-w-5xl mx-auto mt-28"
        aria-labelledby="information-heading"
      >
        <h2 id="information-heading" class="sr-only">
          Product List
        </h2>
        <div class="grid grid-cols-1 gap-8 sm:!gap-x-10 sm:!grid-cols-2 lg:!grid-cols-3 lg:!gap-x-12 lg:!gap-y-10">
          {data.gameStats.map((gameStats: GameStats) => (
            <GameCard gameStats={gameStats} />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function GameCard(props: { gameStats: GameStats }) {
  const { gameStats } = props;

  let offensiveRating = 0;
  offensiveRating +=
    gameStats.offense.offensiveBigPlays > 9
      ? 2
      : gameStats.offense.offensiveBigPlays > 4
      ? 1
      : 0;
  offensiveRating +=
    (gameStats.offense.offensiveBigPlays / gameStats.offense.totalPlays) * 100 >
    5
      ? 1
      : 0;
  offensiveRating +=
    gameStats.offense.totalPoints > 75
      ? 2
      : gameStats.offense.totalPoints > 50
      ? 1
      : 0;
  offensiveRating +=
    gameStats.offense.totalYards > 1200
      ? 2
      : gameStats.offense.totalYards > 1000
      ? 1
      : 0;
  offensiveRating +=
    gameStats.offense.totalYardsPerAttempt >= 7
      ? 2
      : gameStats.offense.totalYardsPerAttempt >= 6
      ? 1
      : 0;
  offensiveRating += gameStats.offense.homeQBR > 110 ? 0.5 : 0;
  offensiveRating += gameStats.offense.awayQBR > 110 ? 0.5 : 0;

  const defensiveBigPlays =
    // sacks +
    gameStats.defense.interceptions +
    gameStats.defense.defensiveTds +
    gameStats.defense.fumbleRecs +
    gameStats.defense.blockedKicks * 0.5 +
    gameStats.defense.safeties * 0.5 +
    gameStats.defense.kickoffReturnTds +
    gameStats.defense.blockedFgTds * 0.5 +
    gameStats.defense.goalLineStands;
  return (
    <a key={gameStats.id} href={`/game/${gameStats.shortName}`} class="group">
      <div
        class={tw`${aspectRatio(
          1,
          1
        )} w-full bg-white rounded-xl overflow-hidden border-2 border-gray-200 transition-all duration-500 relative`}
      >
        <p>
          Offensive Rating 🎯 {offensiveRating}
          <br />
          Scenario Rating 🍿 {gameStats.scenario.scenarioRating}
          <br />
          Defensive Big Plays 🚧 {defensiveBigPlays}
        </p>
        {/* {product.featuredImage && (
          <img
            src={product.featuredImage.url}
            alt={product.featuredImage.altText}
            width="400"
            height="400"
            class="w-full h-full object-center object-contain absolute block"
          />
        )} */}
        <div class="w-full h-full flex items-center justify-center bg-[rgba(255,255,255,0.6)] opacity-0 group-hover:opacity-100 transition-all duration-500">
          Spoil me !
        </div>
      </div>
      <div class="flex items-center justify-between mt-3">
        <h3 class="text-lg text-gray-800 font-medium relative">
          {gameStats.fullName}
          <span class="bg-gray-800 h-[3px] w-0 group-hover:!w-full absolute bottom-[-2px] left-0 transition-all duration-400" />
        </h3>
        {/* <strong class="text-lg font-bold text-gray-800">toto</strong> */}
      </div>
    </a>
  );
}
