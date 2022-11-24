// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";

interface GameStats {
  id: string;
  shortName: string;
  matchupQuality: string;
  // homeTeamEfficiency: number;
  // awayTeamEfficiency: number;
  // homeTeamOffensiveEfficiency: number;
  // homeTeamDefensiveEfficiency: number;
  // awayTeamOffensiveEfficiency: number;
  // awayTeamDefensiveEfficiency: number;

  //   homeTeamPerformance: number;
  //   awayTeamPerformance: number;
  // };
  offense: {
    offensiveBigPlays: number;
    explosiveRate: number;
    leadershipChange: number;
    fourthQuarterLeadershipChange: number;
    totalPoints: number;
    totalYards: number;
    totalYardsPerAttempt: number;
    offensiveRating: number;
  };
  defense: {
    sacks: number;
    defensiveBigPlays: number;
  };
}

// export const handler = (_req: Request, _ctx: HandlerContext): Response => {
//     const randomIndex = Math.floor(Math.random() * JOKES.length);
//     const body = JOKES[randomIndex];
//     return new Response(body);
//   };

export const handler: Handlers<unknown | null> = {
  async GET(_, ctx) {
    const { week } = ctx.params;
    const resp = await fetch(
      `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2022/types/2/weeks/${week}/events?lang=en&region=us`,
    );
    if (resp.status === 404) {
      return ctx.render(null);
    }
    const gameList = await resp.json();
    // console.log(gameList);

    const gameStats = await Promise.all(
      gameList.items.map(async (item: { $ref: string }) => {
        // game info
        const id = item.$ref
          .replace(
            "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/",
            "",
          )
          .replace("?lang=en&region=us", "");
        const shortNameRes = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}`,
        );
        const shortNameResJson = await shortNameRes.json();
        const shortName = shortNameResJson.shortName;

        // predictor
        // const resPredictor = await fetch(
        //   `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/predictor`,
        // );
        // const jsonPredictor = await resPredictor.json();

        // let homeTeamEfficiency = jsonPredictor?.homeTeam?.statistics?.filter(
        //   (item) => item.name === "teamTotEff",
        // )[0].value;
        // let awayTeamEfficiency = jsonPredictor?.awayTeam?.statistics?.filter(
        //   (item) => item.name === "teamTotEff",
        // )[0].value;
        // let homeTeamOffensiveEfficiency = jsonPredictor?.homeTeam?.statistics?.filter(
        //   (item) => item.name === "teamOffEff",
        // )[0].value;
        // let homeTeamDefensiveEfficiency = jsonPredictor?.homeTeam?.statistics?.filter(
        //   (item) => item.name === "teamDefEff",
        // )[0].value;

        // let awayTeamOffensiveEfficiency = jsonPredictor?.awayTeam?.statistics?.filter(
        //   (item) => item.name === "teamOffEff",
        // )[0].value;
        // let awayTeamDefensiveEfficiency = jsonPredictor?.awayTeam?.statistics?.filter(
        //   (item) => item.name === "teamDefEff",
        // )[0].value;
        // power indexes

        const homeId = shortNameResJson.competitions[0]?.competitors[0]?.id;
        const awayId = shortNameResJson.competitions[0]?.competitors[1]?.id;
        const resHomePowerIndex = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/powerindex/${homeId}`,
        );
        const jsonPowerHome = await resHomePowerIndex.json();

        const resHomeLeaders = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/competitors/${homeId}/leaders`,
        );
        const jsonHomeLeaders = await resHomeLeaders.json();
        const homeQBR = jsonHomeLeaders?.categories?.filter(
          (cat) => cat.name === "quarterbackRating",
        )[0].leaders[0].value;

        const resAwayLeaders = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/competitors/${awayId}/leaders`,
        );
        const jsonAwayLeaders = await resAwayLeaders.json();
        const awayQBR = jsonAwayLeaders?.categories?.filter(
          (cat) => cat.name === "quarterbackRating",
        )[0].leaders[0].value;

        // console.log(
        //   jsonPowerHome.stats.filter(
        //     (s: { name: string }) => s.name === "matchupquality"
        //   )[0]
        // );
        // const resAwayPowerIndex = await fetch(
        //   `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/powerindex/${awayId}`,
        // );
        // const jsonPowerAway = await resAwayPowerIndex.json();

        // console.log(jsonPowerAway.stats.filter(s => s.name === "teamadjgamescore")[0]);˙

        // some ids
        // 401437636
        // 401437833

        // probabilities
        const resProbs = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/probabilities?limit=400`,
        );
        // console.log(id);
        //   console.log(resp)
        const jsonProbs = await resProbs.json();
        // console.log(jsonProbs);

        // plays
        const resPlays = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/plays?limit=400`,
        );
        // console.log(id);
        //   console.log(resp)
        const json = await resPlays.json();

        let offensiveBigPlays = 0;
        let leadershipChange = 0;
        let fourthQuarterLeadershipChange = 0;
        let awayScore = 0;
        let homeScore = 0;
        let isHomeLead = false;
        let sacks = 0;
        let punts = 0;
        let interceptions = 0;
        let defensiveTds = 0;
        let fumbleRec = 0;
        let blockedKick = 0;
        let safeties = 0;
        let kickoffReturnTd = 0;
        let blockedFgTd = 0;
        let goalLineStands = 0;
        let totalYards = 0;
        let totalPoints = 0;
        let totalYardsPerAttempt = 0.0;
        if (json.items) {
          json.items.map(
            (i: {
              period: { number: number };
              statYardage: number;
              type: { abbreviation: string; id: string; text: string };
              awayScore: number;
              homeScore: number;
              start: { down: number; yardsToEndzone: number };
              scoringPlay: unknown;
            }) => {
              try {
                if (i?.period?.number > 4) {
                  return;
                }
                // total yards
                totalYards += i.statYardage ?? 0;
                // big plays
                if (i.type?.abbreviation === "PASS" && i.statYardage >= 20) {
                  offensiveBigPlays++;
                } else if (
                  i.type?.abbreviation === "RUSH" &&
                  i.statYardage >= 10
                ) {
                  offensiveBigPlays++;
                }

                totalPoints = Number(
                  json?.items[json.items.length - 1]?.awayScore +
                    json?.items[json.items.length - 1]?.homeScore,
                );

                totalYardsPerAttempt =
                  Math.round((totalYards / json.items.length) * 100) / 100;

                //   scoring
                if (
                  (i.awayScore !== awayScore || i.homeScore !== homeScore) &&
                  ((Math.sign(i.awayScore - i.homeScore) !==
                      Math.sign(awayScore - homeScore) &&
                    Math.sign(i.awayScore - i.homeScore) !== 0) ||
                    (Math.sign(awayScore - homeScore) === 0 &&
                      Math.sign(i.awayScore - i.homeScore) !==
                        Number(isHomeLead)))
                ) {
                  if (i?.period?.number === 4) {
                    fourthQuarterLeadershipChange++;
                  }

                  isHomeLead = !isHomeLead;
                  leadershipChange++;
                  awayScore = i.awayScore;
                  homeScore = i.homeScore;
                }

                // defensive rating
                if (i.type?.id === "7") {
                  sacks++;
                }
                if (i?.type?.id === "52") {
                  punts++;
                }
                if (i?.type?.id === "26") {
                  interceptions++;
                }

                if (
                  i?.type?.id === "39" ||
                  i?.type?.id === "36" ||
                  i?.type?.id === "34"
                ) {
                  defensiveTds++;
                }

                if (i?.type?.id === "29") {
                  fumbleRec++;
                }

                if (i?.type?.id === "17" || i?.type?.id === "18") {
                  blockedKick++;
                }

                if (i?.type?.id === "20") {
                  safeties++;
                }
                if (i?.type?.id === "32") {
                  kickoffReturnTd++;
                }
                if (i?.type?.id === "38") {
                  blockedFgTd++;
                }
                if (i?.type?.id === "37") {
                  blockedFgTd++;
                }

                // recognize play types
                if (
                  ![
                    "5",
                    "24",
                    "3",
                    "67",
                    "53",
                    "66",
                    "21",
                    "12",
                    "75",
                    "2",
                    "7",
                    "52",
                    "9",
                    "60",
                    "74",
                    "8",
                    "68",
                    "59",
                    "79",
                    "26",
                    "70",
                    "65",
                    "39",
                    "36",
                    "29",
                    "17",
                    "51",
                    "18",
                    "20",
                    "32",
                    "38",
                    "61",
                    "37",
                    "57",
                    "34",
                  ].includes(i?.type?.id)
                ) {
                  console.log(i?.type?.id);
                  console.log(i?.type?.text);
                }

                if (
                  i?.start?.down === 4 &&
                  i?.start?.yardsToEndzone <= 5 &&
                  !["52", "66", "59", "21", "75", "8", "2"].includes(
                    i?.type?.id,
                  ) &&
                  !i?.scoringPlay
                ) {
                  goalLineStands++;
                }
              } catch (e) {
                console.log(id);
                console.log(e);
              }
            },
          );
          let offensiveRating = 0;
          offensiveRating += offensiveBigPlays > 9
            ? 2
            : offensiveBigPlays > 4
            ? 1
            : 0;
          offensiveRating += (offensiveBigPlays / json.items.length) * 100 > 5
            ? 1
            : 0;
          offensiveRating += totalPoints > 75 ? 2 : totalPoints > 50 ? 1 : 0;
          offensiveRating += totalYards > 1200 ? 2 : totalYards > 1000 ? 1 : 0;
          offensiveRating += totalYardsPerAttempt >= 7
            ? 2
            : totalYardsPerAttempt >= 6
            ? 1
            : 0;
          offensiveRating += homeQBR > 110 ? 0.5 : 0;
          offensiveRating += awayQBR > 110 ? 0.5 : 0;

          const defensiveBigPlays =
            // sacks +
            interceptions +
            defensiveTds +
            fumbleRec +
            blockedKick * 0.5 +
            safeties * 0.5 +
            kickoffReturnTd +
            blockedFgTd * 0.5 +
            goalLineStands;
          return {
            id,
            shortName,
            matchupQuality: jsonPowerHome.stats.filter(
              (s: { name: string }) => s.name === "matchupquality",
            )[0]?.displayValue,
            // homeTeamPerformance:jsonPowerHome.stats.filter(s => s.name === "teamadjgamescore")[0]?.value,
            // awayTeamPerformance:jsonPowerAway.stats.filter(s => s.name === "teamadjgamescore")[0]?.value,
            // homeTeamOffensiveEfficiency,
            // homeTeamDefensiveEfficiency,
            // awayTeamOffensiveEfficiency,
            // awayTeamDefensiveEfficiency,
            // homeTeamEfficiency,
            // awayTeamEfficiency
            // },
            // offensiveBigPlays,
            // explosiveRate: parseFloat(
            //   ((offensiveBigPlays / json.items.length) * 100).toFixed(2)
            // ),
            // leadershipChange,
            // fourthQuarterLeadershipChange,
            // totalPoints,
            // // punts,
            // totalYards,
            // totalYardsPerAttempt:
            //   Math.round((totalYards / json.items.length) * 100) / 100,
            offensiveRating,
            defensiveBigPlays,
          };
        }
      }),
    );

    // const res = new Response(JSON.stringify(gameStats), { headers: { "type": "application/json" } })
    return new Response(
      JSON.stringify(
        gameStats.sort((a, b) => b.offensiveRating - a.offensiveRating),
      ),
      {
        headers: { type: "application/json" },
      },
    );
  },
};

function GameItem(game: GameStats): JSX.Element {
  return (
    <p>
      fEZFEZF
      <div>
        <h3>{game.shortName}</h3>
        <div>
          <p>Big plays {game.bigPlays}</p>
        </div>
      </div>
    </p>
  );
}

export default function Page({ data }: PageProps<unknown | null>) {
  if (!data.gameStats) {
    console.log(data.gameStats);
    return <h1>No games found</h1>;
  }

  console.log(data.gameStats);
  return JSON.stringify(data.gameStats);
  // <div>
  //   {data.gameStats.map((game: GameStats) => {
  //     console.log(game.shortName)
  //     return <p>TOTO</p>;
  //   })}
  // </div>
}
