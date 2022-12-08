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
    const gameListString = await extract(week);
    const gameList = JSON.parse(gameListString) as GameStats[];
    const gameStats = await Promise.all(
      gameList.map((gameStats: GameStats) => {
        // game info
        const id = gameStats.id;

        const fullName = gameStats.fullName;
        const shortName = gameStats.shortName;

        // some ids
        // 401437636
        // 401437833

        // probabilities

        // json.items.map(
        //   (i: {
        //     period: { number: number };
        //     statYardage: number;
        //     type: { abbreviation: string; id: string; text: string };
        //     awayScore: number;
        //     homeScore: number;
        //     start: { down: number; yardsToEndzone: number };
        //     scoringPlay: unknown;
        //   }) => {
        //     try {
        //       if (i?.period?.number > 4) {
        //         return;
        //       }
        //       // total yards
        //       totalYards += i.statYardage ?? 0;
        //       // big plays
        //       if (i.type?.abbreviation === "PASS" && i.statYardage >= 20) {
        //         offensiveBigPlays++;
        //       } else if (
        //         i.type?.abbreviation === "RUSH" &&
        //         i.statYardage >= 10
        //       ) {
        //         offensiveBigPlays++;
        //       }

        //       totalPoints = Number(
        //         json?.items[json.items.length - 1]?.awayScore +
        //           json?.items[json.items.length - 1]?.homeScore
        //       );

        //       totalYardsPerAttempt =
        //         Math.round((totalYards / json.items.length) * 100) / 100;

        //       //   scoring
        //       if (
        //         (i.awayScore !== awayScore || i.homeScore !== homeScore) &&
        //         ((Math.sign(i.awayScore - i.homeScore) !==
        //           Math.sign(awayScore - homeScore) &&
        //           Math.sign(i.awayScore - i.homeScore) !== 0) ||
        //           (Math.sign(awayScore - homeScore) === 0 &&
        //             Math.sign(i.awayScore - i.homeScore) !==
        //               Number(isHomeLead)))
        //       ) {
        //         if (i?.period?.number === 4) {
        //           fourthQuarterLeadershipChange++;
        //         }

        //         isHomeLead = !isHomeLead;
        //         leadershipChange++;
        //         awayScore = i.awayScore;
        //         homeScore = i.homeScore;
        //       }

        //       // defensive rating
        //       if (i.type?.id === "7") {
        //         sacks++;
        //       }
        //       if (i?.type?.id === "52") {
        //         punts++;
        //       }
        //       if (i?.type?.id === "26") {
        //         interceptions++;
        //       }

        //       if (
        //         i?.type?.id === "39" ||
        //         i?.type?.id === "36" ||
        //         i?.type?.id === "34"
        //       ) {
        //         defensiveTds++;
        //       }

        //       if (i?.type?.id === "29") {
        //         fumbleRec++;
        //       }

        //       if (i?.type?.id === "17" || i?.type?.id === "18") {
        //         blockedKick++;
        //       }

        //       if (i?.type?.id === "20") {
        //         safeties++;
        //       }
        //       if (i?.type?.id === "32") {
        //         kickoffReturnTd++;
        //       }
        //       if (i?.type?.id === "38") {
        //         blockedFgTd++;
        //       }
        //       if (i?.type?.id === "37") {
        //         blockedFgTd++;
        //       }

        //       // recognize play types
        //       if (
        //         ![
        //           "5",
        //           "24",
        //           "3",
        //           "67",
        //           "53",
        //           "66",
        //           "21",
        //           "12",
        //           "75",
        //           "2",
        //           "7",
        //           "52",
        //           "9",
        //           "60",
        //           "74",
        //           "8",
        //           "68",
        //           "59",
        //           "79",
        //           "26",
        //           "70",
        //           "65",
        //           "39",
        //           "36",
        //           "29",
        //           "17",
        //           "51",
        //           "18",
        //           "20",
        //           "32",
        //           "38",
        //           "61",
        //           "37",
        //           "57",
        //           "34",
        //         ].includes(i?.type?.id)
        //       ) {
        //         console.log(i?.type?.id);
        //         console.log(i?.type?.text);
        //       }

        //       if (
        //         i?.start?.down === 4 &&
        //         i?.start?.yardsToEndzone <= 5 &&
        //         !["52", "66", "59", "21", "75", "8", "2"].includes(
        //           i?.type?.id
        //         ) &&
        //         !i?.scoringPlay
        //       ) {
        //         goalLineStands++;
        //       }
        //     } catch (e) {
        //       console.log(id);
        //       console.log(e);
        //     }
        //   }
        // );
        let offensiveRating = 0;
        offensiveRating +=
          gameStats.offense.offensiveBigPlays > 9
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
        return {
          id,
          fullName,
          shortName,
          matchupQuality: gameStats.matchupQuality,
          offensiveRating,
          defensiveBigPlays,
          scenarioRating: gameStats.scenario.scenarioRating,
        };
      })
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
      gameStats.sort((a, b) => b.offensiveRating - a.offensiveRating)
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
