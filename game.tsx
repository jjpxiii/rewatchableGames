export const title = "Welcome to my page";
// export const layout = "article.njk";
export const layout = "layout.tsx";

import { GameStats } from "./types.ts";

// export default (data) => (
//   <>
//     <h1>{data.title}</h1>
//     <p>This is my first post using lume. I hope you like it!</p>
//   </>
// );

export default async function* () {
  const week = 1;
  // let json = JSON.parse(Deno.readTextFileSync("static/json/weeks/1.json"));
  const resp = await fetch(
    `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2022/types/2/weeks/${week}/events?lang=en&region=us`
  );

  const gameList = await resp.json();
  // console.log(gameList);

  const gameData = [];
  for (const item of gameList.items) {
    // console.log(item);
    const id = item.$ref
      .replace(
        "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/",
        ""
      )
      .replace("?lang=en&region=us", "");
    const shortNameRes = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}`
    );
    const shortNameResJson = await shortNameRes.json();
    const shortName = shortNameResJson.shortName;

    const res = await fetch(
      `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/plays?limit=400`
    );
    // console.log(id);
    // console.log(resp);
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

    for (const i of json.items) {
      try {
        if (i?.period?.number > 4) {
          continue;
        }
        // total yards
        totalYards += i.statYardage ?? 0;
        // big plays
        if (i.type?.abbreviation === "PASS" && i.statYardage >= 25) {
          offensiveBigPlays++;
        } else if (i.type?.abbreviation === "RUSH" && i.statYardage >= 10) {
          offensiveBigPlays++;
        }

        //   scoring
        if (
          (i.awayScore !== awayScore || i.homeScore !== homeScore) &&
          ((Math.sign(i.awayScore - i.homeScore) !==
            Math.sign(awayScore - homeScore) &&
            Math.sign(i.awayScore - i.homeScore) !== 0) ||
            (Math.sign(awayScore - homeScore) === 0 &&
              Math.sign(i.awayScore - i.homeScore) !== Number(isHomeLead)))
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
          !["52", "66", "59", "21", "75", "8", "2"].includes(i?.type?.id) &&
          !i?.scoringPlay
        ) {
          goalLineStands++;
          // console.log(id);
          // console.log(i?.id);
          // console.log(i?.type?.id);
          // console.log(i?.type?.text);
        }
      } catch (e) {
        console.log(id);
        console.log(e);
      }
    }
    // console.log(awayScore);
    // console.log(homeScore);
    // console.log("ICI " + shortName);
    const scoringDifferential = Math.abs(
      json?.items[json.items.length - 1]?.awayScore -
        json?.items[json.items.length - 1]?.homeScore
    );
    const totalYardsPerAttempt =
      Math.round((totalYards / json.items.length) * 100) / 100;
    const offensiveRating =
      offensiveBigPlays * 2 +
      leadershipChange +
      fourthQuarterLeadershipChange * 3 +
      (scoringDifferential <= 8 ? 4 : 0) +
      (totalYards > 1000 ? 2 : 0) +
      (totalYardsPerAttempt >= 6 ? 3 : 0);
    const defensiveRating =
      sacks +
      interceptions * 3 +
      defensiveTds * 4 +
      fumbleRec * 3 +
      blockedKick * 2 +
      safeties * 2 +
      kickoffReturnTd * 3 +
      blockedFgTd * 2 +
      goalLineStands * 3;

    const gameStats: GameStats = {
      offense: {
        offensiveBigPlays,
        explosiveRate: parseFloat(
          ((offensiveBigPlays / json.items.length) * 100).toFixed(2)
        ),
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
    };
    gameData.push(`<div><a href="${`/${shortName
      .replace(/ /g, "")
      .replace("@", "-")}/`}">${shortName}</a>
    <h2>${shortName}</h2>
    <h3>Offense</h3>
    <p>Big plays ${gameStats.offense.offensiveBigPlays}</p>
    <p>Explosive rate ${gameStats.offense.explosiveRate}</p>
    <p>4th quarter leadership change ${
      gameStats.offense.fourthQuarterLeadershipChange
    }</p>
    <p>Scoring differential ${gameStats.offense.scoringDifferential}</p>
    <p>Total YPA ${gameStats.offense.totalYardsPerAttempt}</p>
    <h3>Defense</h3>
    <p>Sacks ${gameStats.defense.sacks}</p>
    <p>INT ${gameStats.defense.interceptions}</p>
    <p>Fumble Rec ${gameStats.defense.fumbleRec}</p>
    <p>Defensive TDs ${gameStats.defense.defensiveTds}</p>
    </div>`);
  }
  yield {
    url: `/week-${week}/`,
    title: `Week ${week}`,
    body: gameData,
  };
}
