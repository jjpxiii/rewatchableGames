// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";

interface GameStats {
  id: number;
  shortName: string;
  offense: {
    offensiveBigPlays: number;
    leadershipChange: number;
    fourthQuarterLeadershipChange: number;
    scoringDifferential: number;
    punts: number;
    totalYards: number;
    totalYardsPerAttempt: number;
    offensiveRating: number;
  };
  defense: {
    sacks: number;
    interceptions: number;
    defensiveTds: number;
    fumbleRec: number;
    blockedKick: number;
    kickoffReturnTd: number;
    blockedFgTd: number;
    goalLineStands: number;
    defensiveRating: number;
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

    const gameStats: GameStats[] = await Promise.all(
      gameList.items.map(async (item) => {
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
        const res = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/plays?limit=400`,
        );
        //   console.log(id)
        //   console.log(resp)
        const json = await res.json();

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
        if (json.items) {
          //   console.log(json.awayScore);
          json.items.map((i) => {
            try {
              if (i?.period?.number > 4) {
                return;
              }
              // total yards
              totalYards += i.statYardage ?? 0;
              // big plays
              if (i.type?.abbreviation === "PASS" && i.statYardage >= 25) {
                offensiveBigPlays++;
              } else if (
                i.type?.abbreviation === "RUSH" &&
                i.statYardage >= 10
              ) {
                offensiveBigPlays++;
              }

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
                console.log(id);
                console.log(i?.id);
                console.log(i?.type?.id);
                console.log(i?.type?.text);
              }
            } catch (e) {
              console.log(id);
              console.log(e);
            }
          });
          // console.log(awayScore);
          // console.log(homeScore);
          const scoringDifferential = Math.abs(
            json?.items[json.items.length - 1]?.awayScore -
              json?.items[json.items.length - 1]?.homeScore,
          );
          const totalYardsPerAttempt =
            Math.round((totalYards / json.items.length) * 100) / 100;
          const offensiveRating = offensiveBigPlays * 2 +
            leadershipChange +
            fourthQuarterLeadershipChange * 3 +
            (scoringDifferential <= 8 ? 4 : 0) +
            (totalYards > 1000 ? 2 : 0) +
            (totalYardsPerAttempt >= 6 ? 3 : 0);
          const defensiveRating = sacks +
            interceptions * 3 +
            defensiveTds * 4 +
            fumbleRec * 3 +
            blockedKick * 2 +
            safeties * 2 +
            kickoffReturnTd * 3 +
            blockedFgTd * 2 +
            goalLineStands * 3;
          return {
            id,
            shortName,
            offense: {
              offensiveBigPlays,
              leadershipChange,
              fourthQuarterLeadershipChange,
              scoringDifferential,
              punts,
              totalYards,
              totalYardsPerAttempt:
                Math.round((totalYards / json.items.length) * 100) / 100,
              offensiveRating,
            },
            defense: {
              sacks,
              interceptions,
              defensiveTds,
              fumbleRec,
              blockedKick,
              safeties,
              kickoffReturnTd,
              blockedFgTd,
              goalLineStands,
              defensiveRating,
            },
          } as GameStats;
        }
      }),
    );
    // const res = new Response(JSON.stringify(gameStats), { headers: { "type": "application/json" } })
    return new Response(JSON.stringify(gameStats), {
      headers: { type: "application/json" },
    });
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
