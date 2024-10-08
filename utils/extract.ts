/// <reference lib="deno.unstable" />

import computeScenarioRating from "./ratings.ts";
import type { GameStats } from "../types.ts";

// const db = await Deno.openKv();

// // Deno.cron("Write weathercd  data to Deno KV", "0 * * * *", async () => {
//   console.log("Pull weather data and set to Deno KV");
//   const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&hourly=temperature_2m,precipitation&timezone=America%2FLos_Angeles');
//   const body = await res.json();
//   const date = new Date(Date.now()).toString();
//   await db.set(["weather", date], {
//       temperature: body.hourly.temperature_2m[0],
//       precipitation: body.hourly.precipitation[0]
//     }
//   );
// // })

const fetchAndCompute = async (
  year: string,
  week: string,
  debug: boolean,
): Promise<void> => {
  const resp = await fetch(
    `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/${year}/types/2/weeks/${week}/events?lang=en&region=us`,
  );
  if (resp.status === 404) {
    return;
  }

  // await db.set(["year", Number(year)], [
  //   ...Array(Number(week)).reverse().keys().map((k) => k + 1),
  // ]);
  // console.log(await db.get(["year", Number(year)]));
  const gameList = await resp.json();
  const gameStats: GameStats[] = await Promise.all(
    gameList.items.map(async (item: { $ref: string }) => {
      // game info
      const id = item.$ref
        .replace(
          "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/",
          "",
        )
        .replace("?lang=en&region=us", "");
      const nameRes = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}`,
      );
      const nameResJson = await nameRes.json();
      const fullName = nameResJson.name;
      const shortName = nameResJson.shortName;

      // predictor
      const resPredictor = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/predictor`,
      );
      const jsonPredictor = await resPredictor.json();

      const homeTeamEfficiency = jsonPredictor?.homeTeam?.statistics?.filter(
        (item) => item.name === "teamTotEff",
      )[0]?.value;
      const awayTeamEfficiency = jsonPredictor?.awayTeam?.statistics?.filter(
        (item) => item.name === "teamTotEff",
      )[0]?.value;
      const homeTeamOffensiveEfficiency = jsonPredictor?.homeTeam?.statistics
        ?.filter(
          (item) => item.name === "teamOffEff",
        )[0]?.value;
      const homeTeamDefensiveEfficiency = jsonPredictor?.homeTeam?.statistics
        ?.filter(
          (item) => item.name === "teamDefEff",
        )[0]?.value;

      const awayTeamOffensiveEfficiency = jsonPredictor?.awayTeam?.statistics
        ?.filter(
          (item) => item.name === "teamOffEff",
        )[0]?.value;
      const awayTeamDefensiveEfficiency = jsonPredictor?.awayTeam?.statistics
        ?.filter(
          (item) => item.name === "teamDefEff",
        )[0]?.value;

      // power indexes
      const homeId = nameResJson.competitions[0]?.competitors[0]?.id;
      const awayId = nameResJson.competitions[0]?.competitors[1]?.id;
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

      const resAwayPowerIndex = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/powerindex/${awayId}`,
      );
      const jsonPowerAway = await resAwayPowerIndex.json();

      // probabilities
      const resProbs = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/probabilities?limit=400`,
      );
      const jsonProbs = await resProbs.json();
      let { scenarioData, scenarioRating } = computeScenarioRating(jsonProbs);

      // plays
      const resPlays = await fetch(
        `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/plays?limit=400`,
      );

      const json = await resPlays.json();

      let offensiveBigPlays = 0;
      let offensiveExplosivePlays = 0;
      let leadershipChange = 0;
      let fourthQuarterLeadershipChange = 0;
      let awayScore = 0;
      let homeScore = 0;
      let isHomeLead = false;
      let sacks = 0;
      let punts = 0;
      let interceptions = 0;
      let defensiveTds = 0;
      let fumbleRecs = 0;
      let blockedKicks = 0;
      let safeties = 0;
      let specialTeamsTd = 0;
      let goalLineStands = 0;
      let totalPlays = 0;
      let totalYards = 0;
      let totalPoints = 0;
      let totalYardsPerAttempt = 0.0;
      let totalPassPlays = 0;
      let totalRushPlays = 0;
      let totalRushYards = 0;
      let totalPassYards = 0;
      if (json.items) {
        json.items.map(
          (i: {
            text: string;
            period: { number: number };
            statYardage: number;
            type: { abbreviation: string; id: string; text: string };
            awayScore: number;
            homeScore: number;
            start: { down: number; yardsToEndzone: number };
            scoringPlay: unknown;
          }) => {
            try {
              // if (i.type.id === "52" && i.scoringPlay) {

              //   // console.log(i)
              //   console.log(i)
              // }
              // if (i.type.id === "32") {

              //   // console.log(i)
              //   console.log(i)
              // }
              if (i?.period?.number > 4 || i?.text?.endsWith("No Play.")) {
                return;
              }
              // total plays and yards
              if (
                i?.type?.id === "3" ||
                i?.type?.id === "5" ||
                i?.type?.id === "7" ||
                i?.type?.id === "24" ||
                i?.type?.id === "67" ||
                i?.type?.id === "68"
              ) {
                if (i?.text.indexOf("PENALTY") < 0) {
                  totalPlays++;
                  totalYards += i.statYardage;
                }
              }
              // big plays
              // console.log(i.type.abbreviation)
              if (i.type?.abbreviation === "REC") {
                // console.log('PASS ' + i.statYardage)
                totalPassPlays++;
                totalPassYards += i.statYardage;
                if (i.statYardage >= 40) {
                  offensiveExplosivePlays++;
                  // console.log('PASS ' + i.statYardage)
                } else if (i.statYardage >= 20) {
                  offensiveBigPlays++;
                }
              }
              if (i.type?.abbreviation === "RUSH") {
                totalRushPlays++;
                totalRushYards += i.statYardage;
                if (i.statYardage >= 20) {
                  // console.log('RUSH ' + i.statYardage)

                  offensiveExplosivePlays++;
                } else if (i.statYardage >= 10) {
                  offensiveBigPlays++;
                }
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
              if (i?.type?.id === "52" && i.scoringPlay) {
                specialTeamsTd++;
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
                fumbleRecs++;
              }

              if (i?.type?.id === "17" || i?.type?.id === "18") {
                blockedKicks++;
              }

              if (i?.type?.id === "20") {
                safeties++;
              }
              if (i?.type?.id === "32") {
                specialTeamsTd++;
              }
              if (i?.type?.id === "38") {
                specialTeamsTd++;
              }
              if (i?.type?.id === "37") {
                specialTeamsTd++;
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
                // console.log(i?.type?.id);
                // console.log(i?.type?.text);
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

        totalPoints = Number(
          json?.items[json.items.length - 1]?.awayScore +
            json?.items[json.items.length - 1]?.homeScore,
        );

        const marginOfVictory = Math.abs(
          json?.items[json.items.length - 1]?.awayScore -
            json?.items[json.items.length - 1]?.homeScore,
        );

        scenarioRating += marginOfVictory <= 3
          ? 2
          : marginOfVictory <= 8
          ? 1
          : 0;

        totalYardsPerAttempt = Math.round((totalYards / totalPlays) * 100) /
          100;

        const totalPassYardsPerAttempt =
          Math.round((totalPassYards / totalPassPlays) * 100) / 100;
        const totalRushYardsPerAttempt =
          Math.round((totalRushYards / totalRushPlays) * 100) / 100;

        scenarioRating += fourthQuarterLeadershipChange;

        return {
          id,
          fullName,
          shortName,
          matchupQuality: jsonPowerHome.stats.filter(
            (s: { name: string }) => s.name === "matchupquality",
          )[0]?.displayValue,
          efficiency: {
            homeTeamPerformance: jsonPowerHome.stats.filter(
              (s) => s.name === "teamadjgamescore",
            )[0]?.value,
            awayTeamPerformance: jsonPowerAway.stats.filter(
              (s) => s.name === "teamadjgamescore",
            )[0]?.value,
            homeTeamOffensiveEfficiency,
            homeTeamDefensiveEfficiency,
            homeTeamEfficiency,
            awayTeamOffensiveEfficiency,
            awayTeamDefensiveEfficiency,
            awayTeamEfficiency,
          },
          scenario: {
            marginOfVictory,
            fourthQuarterLeadershipChange,
            leadershipChange,
            scenarioRating,
            scenarioData,
          },
          offense: {
            offensiveBigPlays,
            offensiveExplosivePlays,
            totalPlays,
            totalPoints,
            totalYards,
            totalYardsPerAttempt,
            totalPassYards,
            totalPassYardsPerAttempt,
            totalRushYards,
            totalRushYardsPerAttempt,
            homeQBR,
            awayQBR,
          },
          defense: {
            punts,
            sacks,
            interceptions,
            defensiveTds,
            fumbleRecs,
            blockedKicks,
            safeties,
            specialTeamsTd,
            goalLineStands,
          },
        } as GameStats;
      }
    }),
  );
  if (debug) console.log(JSON.stringify(gameStats));
  Deno.writeTextFile(`data/${year}/${week}.json`, JSON.stringify(gameStats), {
    create: true,
  });
};

export const extract = async (
  year: string,
  week: string,
  all = "",
  debug = "",
): Promise<void> => {
  if (all === "all") {
    for (let w = +week; w > 0; w--) {
      console.log("extracting week " + w);
      await fetchAndCompute(year, w.toString(), debug === "true");
    }
  } else {
    await fetchAndCompute(year, week, debug === "true");
  }
};

// console.log(Deno.args);
await extract(Deno.args[0], Deno.args[1], Deno.args[2], Deno.args[3]);
