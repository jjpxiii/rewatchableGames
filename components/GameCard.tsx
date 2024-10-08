import { GameStats } from "../types.ts";

export function GameCard(props: { gameStats: GameStats }) {
  const { gameStats } = props;

  return (
    <a key={gameStats.id} href={`/game/${gameStats.shortName}`} class="group">
      <div
        class={`w-full bg-white rounded-xl overflow-hidden border-2 border-gray-200 transition-all duration-500 relative`}
      >
        <p>
          {
            /* Matchup Quality ‼ {gameStats.matchupQuality}
          <br /> */
          }
          {
            /* YPA {gameStats.offense.totalYardsPerAttempt}
          <br />
          Pass YPA {gameStats.offense.totalPassYardsPerAttempt}
          <br />
          total points {gameStats.offense.totalPoints}
          <br />
          Offensive Explosive Plays 💥 {gameStats.offensiveExplosivePlays}
          <br />
          Offensive Big Plays 🧯 {gameStats.offensiveBigPlays}
          <br />
          Total Yards 🧯 {gameStats.offense.totalYards}
          <br />
          Expl rate 🧯{" "}
          {gameStats.offensiveExplosivePlays / gameStats.offense.totalPlays *
            100}
          <br />
          Big Play rate 🧯{" "}
          {gameStats.offensiveBigPlays / gameStats.offense.totalPlays * 100}
          <br /> */
          }
          Offensive Rating 🎯 {gameStats.offensiveRating} <br />
          {
            /* <br /> Hoe QB Rating 🎯 {gameStats?.offense?.homeQBR}
          <br /> Away QB Rating 🎯 {gameStats?.offense?.awayQBR}
          <br />
          margin {gameStats.marginOfVictory}
          <br />
          leadershipChange {gameStats.leadershipChange}
          <br />
          4th quarter 🍿 {gameStats.fourthQuarterLeadershipChange}
          <br /> */
          }
          Scenario Rating 🍿 {gameStats.scenarioRating}
          <br />
          Defensive Big Plays 🚧 {gameStats.defensiveBigPlays}
          <br />
          Total Rating 🧮 {gameStats.totalRating}
        </p>
        {
          /* {product.featuredImage && (
            <img
              src={product.featuredImage.url}
              alt={product.featuredImage.altText}
              width="400"
              height="400"
              class="w-full h-full object-center object-contain absolute block"
            />
          )} */
        }
        <div class="w-full h-full flex items-center justify-center bg-[rgba(255,255,255,0.6)] opacity-0 group-hover:opacity-100 transition-all duration-500">
          Spoil me !
        </div>
      </div>
      <div class="flex items-center justify-between mt-3">
        <h3 class="text-lg text-gray-800 font-medium relative">
          {gameStats.fullName} <br /> Week {gameStats.week}
          <span class="bg-gray-800 h-[3px] w-0 group-hover:!w-full absolute bottom-[-2px] left-0 transition-all duration-400" />
        </h3>
        {/* <strong class="text-lg font-bold text-gray-800">toto</strong> */}
      </div>
    </a>
  );
}
