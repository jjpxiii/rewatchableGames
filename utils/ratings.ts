import type { GameStats } from "../types.ts";

export default function computeScenarioRating<B extends boolean>(json: {
  items: { homeWinPercentage: number }[];
}): {
  scenarioData: {
    maxWinProbability: number;
    minWinProbability: number;
    inversionOfLead: number;
    shareOfLead: number;
    max_4th: number;
    min_4th: number;
    inv_4th: number;
    share_4th: number;
  };
  scenarioRating: number;
} {
  let inversionOfLead = 0;
  let maxWinProbability = 0;
  let minWinProbability = 1;

  let inv_4th = 0;
  let max_4th = 0;
  let min_4th = 1;
  for (let i = 1; i < json?.items.length; i++) {
    const element = json.items[i].homeWinPercentage;
    if (element < minWinProbability) {
      minWinProbability = element;
    }
    if (element < min_4th && i > json?.items.length * 0.75) {
      min_4th = element;
    }

    if (element > maxWinProbability) {
      maxWinProbability = element;
    }
    if (element > max_4th && i > json?.items.length * 0.75) {
      max_4th = element;
    }

    if (
      (element > 0.5 && json?.items[i - 1].homeWinPercentage < 0.5) ||
      (element < 0.5 && json?.items[i - 1].homeWinPercentage > 0.5)
    ) {
      inversionOfLead++;
      if (i > json?.items.length * 0.75) {
        inv_4th++;
      }
    }
  }

  const shareOfLead =
    json.items.filter((i) => i.homeWinPercentage >= 0.5).length /
    json.items.length;

  const share_4th = json.items.filter(
    (i, index) =>
      index > json?.items.length * 0.75 && i.homeWinPercentage >= 0.5,
  ).length / json.items.length;

  const scenarioData = {
    maxWinProbability,
    minWinProbability,
    inversionOfLead,
    shareOfLead,
    max_4th,
    min_4th,
    inv_4th,
    share_4th,
  };
  let scenarioRating = 0;
  const gapProbability = Math.abs(maxWinProbability - minWinProbability);
  // try to rate the scenario
  scenarioRating += gapProbability > 0.95
    ? 3
    : gapProbability > 0.90
    ? 2
    : gapProbability > 0.7
    ? 1
    : 0;
  // scenarioRating += inversionOfLead > 10 ? 5 : inversionOfLead > 5 ? 2 : 0;
  scenarioRating += shareOfLead > 0.4 && shareOfLead < 0.6 ? 1 : 0;

  // scenarioRating += Math.abs(max_4th - min_4th) > 0.9
  //   ? 3
  //   : Math.abs(max_4th - min_4th) > 0.65
  //   ? 1
  //   : 0;
  // scenarioRating += inv_4th;
  scenarioRating += share_4th > 0.4 && share_4th < 0.6 ? 1 : 0;

  // console.log(Math.abs(max - min));
  // console.log(inv);
  // console.log(share);
  // console.log("4th Q drama");
  // console.log(Math.abs(max_4th - min_4th));
  // console.log(inv_4th);
  // console.log(share_4th);

  // if (json.items[0]["$ref"] === "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/401671763/competitions/401671763/probabilities/4016717631?lang=en&region=us") {
  // console.log(scen);
  // console.log(json.items[0])
  // console.log(json.items[json.items.length - 1])
  // console.log("SCENARIO RATING " + scenarioRating);
  // }
  return { scenarioData, scenarioRating };
}

export function computeOffensiveRating(gameStats: GameStats): number {
  if (!gameStats.offense) return 0;
  let offensiveRating = 0;
  const explosiveRate = gameStats.offense.offensiveExplosivePlays /
    gameStats.offense.totalPlays;
  const bigPlayRate = gameStats.offense.offensiveBigPlays /
    gameStats.offense.totalPlays;
  // offensiveRating += gameStats.offense.offensiveBigPlays > 9
  //   ? 2
  //   : gameStats.offense.offensiveBigPlays > 4
  //   ? 1
  //   : 0;
  // offensiveRating += gameStats.offense.offensiveExplosivePlays;
  offensiveRating += explosiveRate > 3 ? 1 : 0;
  offensiveRating += bigPlayRate > 10 ? 1 : 0;
  offensiveRating += gameStats.offense.totalPoints > 75
    ? 3
    : gameStats.offense.totalPoints > 60
    ? 2
    : gameStats.offense.totalPoints > 50
    ? 1
    : 0;
  offensiveRating += gameStats.offense.totalYards > 1000
    ? 2
    : gameStats.offense.totalYards > 800
    ? 1
    : 0;
  // offensiveRating += gameStats.offense.totalPassYardsPerAttempt >= 15
  // ? 2
  // : gameStats.offense.totalPassYardsPerAttempt >= 8
  // ? 1
  // : 0;
  // offensiveRating += gameStats.offense.totalRushYardsPerAttempt >= 5
  // ? 2
  // : gameStats.offense.totalPassYardsPerAttempt >= 4
  // ? 1
  // : 0;
  offensiveRating += gameStats.offense.totalYardsPerAttempt >= 6
    ? 3
    : gameStats.offense.totalYardsPerAttempt >= 5
    ? 1
    : 0;
  offensiveRating += gameStats.offense.homeQBR > 120
    ? 1
    : gameStats.offense.homeQBR > 100
    ? 0.5
    : 0;
  offensiveRating += gameStats.offense.awayQBR > 120
    ? 1
    : gameStats.offense.homeQBR > 100
    ? 0.5
    : 0;

  return offensiveRating;
}

export function computeDefensiveBigPlays(gameStats: GameStats): number {
  if (!gameStats.defense) return 0;
  // console.log(gameStats.shortName)
  // console.log(gameStats.defense)
  return (
    gameStats.defense.defensiveTds * 3 +
    //     (gameStats.defense.sacks > 10
    // ? 1
    // : 0) +
    gameStats.defense.fumbleRecs +
    gameStats.defense.specialTeamsTd * 3 +
    gameStats.defense.interceptions +
    gameStats.defense.blockedKicks +
    gameStats.defense.safeties +
    gameStats.defense.goalLineStands
  );
}
