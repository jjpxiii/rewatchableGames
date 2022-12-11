// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";

import { extract } from "../../utils/extract.ts";
import computeScenarioRating from "../../utils/scenarioRating.ts";

import type { GameStats } from "../../types";

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
    const gameListString = Deno.statSync(`data/2022/${week}.json`).isFile
      ? Deno.readTextFileSync(`data/2022/${week}.json`)
      : await extract("2022", week);
    const gameList = JSON.parse(gameListString) as GameStats[];
    const gameStats = await Promise.all(
      gameList.map((gameStats: GameStats) => {
        // game info
        const id = gameStats.id;

        const fullName = gameStats.fullName;
        const shortName = gameStats.shortName;

        let offensiveRating = 0;
        offensiveRating += gameStats.offense.offensiveBigPlays > 9
          ? 2
          : gameStats.offense.offensiveBigPlays > 4
          ? 1
          : 0;
        offensiveRating +=
          (gameStats.offense.offensiveBigPlays / gameStats.offense.totalPlays) *
                100 >
              5
            ? 1
            : 0;
        offensiveRating += gameStats.offense.totalPoints > 75
          ? 2
          : gameStats.offense.totalPoints > 50
          ? 1
          : 0;
        offensiveRating += gameStats.offense.totalYards > 1200
          ? 2
          : gameStats.offense.totalYards > 1000
          ? 1
          : 0;
        offensiveRating += gameStats.offense.totalYardsPerAttempt >= 7
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
        return {
          id,
          fullName,
          shortName,
          matchupQuality: gameStats.matchupQuality,
          offensiveRating,
          defensiveBigPlays,
          scenarioRating: gameStats.scenario.scenarioRating,
        };
      }),
    );

    // const res = new Response(JSON.stringify(gameStats), { headers: { "type": "application/json" } })
    // return new Response(
    //   JSON.stringify(
    //     gameStats.sort((a, b) => b.offensiveRating - a.offensiveRating),
    //   ),
    //   {
    //     headers: { type: "application/json" },
    //   },
    // );
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
            </p>
            <br />
          </div>
        );
      })}
    </div>
  );
}
