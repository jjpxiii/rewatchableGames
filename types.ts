export type GameStats = {
  offense: {
    offensiveBigPlays: number;
    explosiveRate: number;
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
    safeties: number;
    fumbleRec: number;
    blockedKick: number;
    kickoffReturnTd: number;
    blockedFgTd: number;
    goalLineStands: number;
    defensiveRating: number;
  };
};
