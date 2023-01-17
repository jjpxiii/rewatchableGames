import type { GameStats } from "../types.ts";

export default function computeScenarioRating<B extends boolean>(json: {
  items: { homeWinPercentage: number }[];
}): {
  scenarioData: {
    max: number;
    min: number;
    inv: number;
    share: number;
    max_4th: number;
    min_4th: number;
    inv_4th: number;
    share_4th: number;
  };
  scenarioRating: number;
} {
  let inv = 0;
  let max = 0;
  let min = 1;

  let inv_4th = 0;
  let max_4th = 0;
  let min_4th = 1;
  for (let i = 1; i < json?.items.length; i++) {
    const element = json.items[i].homeWinPercentage;
    if (element < min) {
      min = element;
    }
    if (element < min_4th && i > json?.items.length * 0.75) {
      min_4th = element;
    }

    if (element > max) {
      max = element;
    }
    if (element > max_4th && i > json?.items.length * 0.75) {
      max_4th = element;
    }

    if (
      (element > 0.5 && json?.items[i - 1].homeWinPercentage < 0.5) ||
      (element < 0.5 && json?.items[i - 1].homeWinPercentage > 0.5)
    ) {
      inv++;
      if (i > json?.items.length * 0.75) {
        inv_4th++;
      }
    }
  }

  const share = json.items.filter((i) => i.homeWinPercentage >= 0.5).length /
    json.items.length;

  const share_4th = json.items.filter(
    (i, index) =>
      index > json?.items.length * 0.75 && i.homeWinPercentage >= 0.5,
  ).length / json.items.length;

  const scenarioData = {
    max,
    min,
    inv,
    share,
    max_4th,
    min_4th,
    inv_4th,
    share_4th,
  };
  let scenarioRating = 0;
  // try to rate the scenario
  scenarioRating += Math.abs(max_4th - min_4th) !== Math.abs(max - min)
    ? Math.abs(max - min) > 0.9 ? 2 : Math.abs(max - min) > 0.65 ? 1 : 0
    : 0;
  scenarioRating += inv !== inv_4th ? (inv > 15 ? 2 : inv > 7 ? 1 : 0) : 0;
  scenarioRating += share > 0.35 && share < 0.65 ? 1 : 0;

  scenarioRating += Math.abs(max_4th - min_4th) > 0.9
    ? 3
    : Math.abs(max_4th - min_4th) > 0.65
    ? 1
    : 0;
  scenarioRating += inv_4th > 3 ? 1 : 0;
  scenarioRating += share_4th > 0.4 && share_4th < 0.6 ? 1 : 0;

  // console.log(Math.abs(max - min));
  // console.log(inv);
  // console.log(share);
  // console.log("4th Q drama");
  // console.log(Math.abs(max_4th - min_4th));
  // console.log(inv_4th);
  // console.log(share_4th);

  // console.log("SCENARIO RATING " + scenarioRating);
  return { scenarioData, scenarioRating };
}

export function computeOffensiveRating(gameStats: GameStats): number {
  if (!gameStats.offense) return 0;
  let offensiveRating = 0;
  offensiveRating += gameStats.offense.offensiveBigPlays > 9
    ? 2
    : gameStats.offense.offensiveBigPlays > 4
    ? 1
    : 0;
  offensiveRating +=
    (gameStats.offense.offensiveBigPlays / gameStats.offense.totalPlays) * 100 >
        5
      ? 2
      : 0;
  offensiveRating += gameStats.offense.totalPoints > 75
    ? 2
    : gameStats.offense.totalPoints > 50
    ? 1
    : 0;
  offensiveRating += gameStats.offense.totalYards > 800 ? 1 : 0;
  offensiveRating += gameStats.offense.totalYardsPerAttempt >= 6
    ? 2
    : gameStats.offense.totalYardsPerAttempt >= 5
    ? 1
    : 0;
  offensiveRating += gameStats.offense.homeQBR > 110 ? 0.5 : 0;
  offensiveRating += gameStats.offense.awayQBR > 110 ? 0.5 : 0;

  return offensiveRating;
}

export function computeDefensiveBigPlays(gameStats: GameStats): number {
  if (!gameStats.defense) return 0;
  return (
    gameStats.defense.interceptions +
    gameStats.defense.defensiveTds +
    gameStats.defense.fumbleRecs +
    gameStats.defense.blockedKicks * 0.5 +
    gameStats.defense.safeties * 0.5 +
    gameStats.defense.kickoffReturnTds +
    gameStats.defense.blockedFgTds * 0.5 +
    gameStats.defense.goalLineStands
  );
}
