import { Hono } from "hono";
import { GameStats } from "./types.ts";
import {
  computeDefensiveBigPlays,
  computeOffensiveRating,
} from "./utils/ratings.ts";
import { exists } from "https://deno.land/std@0.216.0/fs/exists.ts";

const app = new Hono();

app.get("/games/:year/:week", async (c) => {
  const week = c.req.param("week");
  const year = c.req.param("year");
  const stat = await exists(`data/${year}/${week}.json`);
  if (stat) {
    const gameListString = await Deno.readTextFile(
      `data/${year}/${week}.json`,
    );

    const gameList = JSON.parse(gameListString) as GameStats[];
    const gameStats = await Promise.all(
      gameList.map((gameStats: GameStats) => {
        return {
          id: gameStats.id,
          fullName: gameStats.fullName,
          shortName: gameStats.shortName,
          matchupQuality: gameStats.matchupQuality,
          offensiveRating: computeOffensiveRating(gameStats),
          defensiveBigPlays: computeDefensiveBigPlays(gameStats),
          scenarioRating: gameStats.scenario.scenarioRating,
          totalRating: computeOffensiveRating(gameStats) +
            computeDefensiveBigPlays(gameStats) +
            gameStats.scenario.scenarioRating,
        };
      }),
    );
    return c.text(
      JSON.stringify(
        gameStats.sort((a, b) => b.offensiveRating - a.offensiveRating),
      ),
    );
  }
  c.status(404);
  return c.text("No data");
});

app.get("/games/:year", async (c) => {
  const year = c.req.param("year");

  const allGameStats = [];
  for (let week = 1; week <= 18; week++) {
    const stat = await exists(`data/${year}/${week}.json`);
    if (stat) {
      const gameListString = await Deno.readTextFile(
        `data/${year}/${week}.json`,
      );

      const gameList = JSON.parse(gameListString) as GameStats[];
      allGameStats.push(...gameList);
    } else break;
  }
  return c.json(allGameStats);
});

Deno.serve(app.fetch);
