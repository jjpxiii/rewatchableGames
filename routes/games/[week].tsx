// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";

import { extract } from "../../utils/extract.ts";
import computeScenarioRating from "../../utils/ratings.ts";

import type { GameStats } from "../../types";
import {
  computeDefensiveBigPlays,
  computeOffensiveRating,
} from "../../utils/ratings.ts";

export const handler: Handlers<unknown | null> = {
  async GET(_, ctx) {
    const { week } = ctx.params;
    // const resp = await fetch(
    //   `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2022/types/2/weeks/${week}/events?lang=en&region=us`
    // );
    // if (resp.status === 404) {
    //   return ctx.render(null);
    // }
    // const gameList = await resp.json();
    // const gameListString = await extract(week);
    const stat = await Deno.stat(`data/2022/${week}.json`);
    const gameListString = stat.isFile
      ? await Deno.readTextFile(`data/2022/${week}.json`)
      : await extract("2022", week);
    const gameList = JSON.parse(gameListString) as GameStats[];
    const gameStats = await Promise.all(
      gameList.map((gameStats: GameStats) => {
        return {
          id: gameStats.id,
          fullName: gameStats.fullName,
          shortName: gameStats.shortName,
          matchupQuality: gameStats.matchupQuality,
          offensiveRating: computeOffensiveRating(gameStats),
          defensiveBigPlays: computeDefensiveBigPlays(gameStats),
          scenarioRating: gameStats.scenario.scenarioRating,
          totalRating: computeOffensiveRating(gameStats) +
            computeDefensiveBigPlays(gameStats) +
            gameStats.scenario.scenarioRating,
        };
      }),
    );
    return ctx.render(
      gameStats.sort((a, b) => b.offensiveRating - a.offensiveRating),
    );
  },
};

export default function Page({ data }: PageProps<unknown | null>) {
  if (!data) {
    return <h1>No games found</h1>;
  }

  // return JSON.stringify(data.gameStats);
  return (
    <div>
      {data.map((game) => {
        return (
          <div>
            <h3>{game.fullName}</h3>
            <p>
              🎯 {game.offensiveRating} 🍿 {game.scenarioRating} 🚧{" "}
              {game.defensiveBigPlays}
              🧮 {game.totalRating}
            </p>
            <br />
          </div>
        );
      })}
    </div>
  );
}
