import * as path from "https://deno.land/std@0.166.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import computeScenarioRating from "../ratings.ts";

Deno.test("compute rating for a good match", async () => {
  const json = await Deno.readTextFile(
    path.join(Deno.cwd(), "utils", "tests", "assets/1.json"),
  );

  assertEquals(computeScenarioRating(JSON.parse(json)).scenarioRating, 2);
});

Deno.test("compute rating for a lopsided match", async () => {
  const json = await Deno.readTextFile(
    path.join(Deno.cwd(), "utils", "tests", "assets/2.json"),
  );

  assertEquals(computeScenarioRating(JSON.parse(json)).scenarioRating, 0);
});

Deno.test("compute rating for a spectacular match", async () => {
  const json = await Deno.readTextFile(
    path.join(Deno.cwd(), "utils", "tests", "assets/3.json"),
  );

  assertEquals(computeScenarioRating(JSON.parse(json)).scenarioRating, 4);
});

// add tests for other ratings
