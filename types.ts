export interface Money {
  amount: number;
  currencyCode: string;
}

export interface Image {
  url: string;
  width: number;
  height: number;
  altText: string;
}

export interface List<T> {
  nodes: T[];
}

export interface ProductPriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface ProductVariant {
  id: string;
  priceV2: Money;
  title: string;
  availableForSale: boolean;
}

export interface GameStats {
  id: string;
  week?: number;
  fullName: string;
  shortName: string;
  // quite random tbf
  matchupQuality: string;
  efficiency: {
    // efficiency, maybe not solid stats
    homeTeamEfficiency: number;
    awayTeamEfficiency: number;
    homeTeamOffensiveEfficiency: number;
    homeTeamDefensiveEfficiency: number;
    awayTeamOffensiveEfficiency: number;
    awayTeamDefensiveEfficiency: number;

    homeTeamPerformance: number;
    awayTeamPerformance: number;
  };
  scenario: {
    marginOfVictory: number;
    fourthQuarterLeadershipChange: number;
    leadershipChange: number;
    scenarioRating: number;
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
  };
  offense: {
    offensiveBigPlays: number;
    offensiveExplosivePlays: number;
    explosiveRate: number;
    totalPlays: number;
    totalPoints: number;
    totalYards: number;
    totalYardsPerAttempt: number;
    totalPassYards: number;
    totalPassYardsPerAttempt: number;
    totalRushYards: number;
    totalRushYardsPerAttempt: number;
    homeQBR: number;
    awayQBR: number;
  };
  defense: {
    punts: number;
    sacks: number;
    interceptions: number;
    defensiveTds: number;
    fumbleRecs: number;
    blockedKicks: number;
    safeties: number;
    specialTeamsTd: number;
    goalLineStands: number;
  };
}
