import { useState } from "preact/hooks";
import { Button } from "../components/Button.tsx";
import { GameCard } from "../components/GameCard.tsx";
import { GameStats } from "../types.ts";

interface GameListProps {
  gameStats: GameStats[];
}

export default function GameList(props: GameListProps) {
  const [sortOrder, setSortOrder] = useState("offensive");

  const gameStats = props.gameStats.sort((a, b) => {
    return sortOrder === "offensive"
      ? b.offensiveRating - a.offensiveRating
      : sortOrder === "defensive"
      ? b.defensiveBigPlays - a.defensiveBigPlays
      : sortOrder === "scenario"
      ? b.scenarioRating - a.scenarioRating
      : b.totalRating - a.totalRating;
  });

  return (
    <div>
      <div class="flex gap-2 w-full">
        <p class="flex-grow-1 font-bold text-xl">
          Sorted by {sortOrder} rating ⬇
        </p>
        <Button onClick={() => setSortOrder("offensive")}>
          Offensive rating ⬇
        </Button>
        <Button onClick={() => setSortOrder("scenario")}>
          Scenario rating ⬇
        </Button>
        <Button onClick={() => setSortOrder("defensive")}>
          Defensive rating ⬇
        </Button>
        <Button onClick={() => setSortOrder("total")}>Total rating ⬇</Button>
      </div>
      <br />
      <div class="grid grid-cols-1 gap-8 sm:!gap-x-10 sm:!grid-cols-2 lg:!grid-cols-3 lg:!gap-x-12 lg:!gap-y-10">
        {gameStats.map((gameStats: GameStats) => (
          <GameCard gameStats={gameStats} />
        ))}
      </div>
    </div>
  );
}
