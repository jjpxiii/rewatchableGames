import * as path from "https://deno.land/std@0.166.0/path/mod.ts";
import { assertEquals } from "https://deno.land/std@0.166.0/testing/asserts.ts";
import ComputeScenarioRating from "../ratings.ts";

Deno.test("compute rating for a good match", () => {
  const json = Deno.readTextFileSync(
    path.join(Deno.cwd(), "utils", "tests", "assets/1.json"),
  );

  assertEquals(ComputeScenarioRating(JSON.parse(json)).scenarioRating, 3);
});

Deno.test("compute rating for a lopsided match", () => {
  const json = Deno.readTextFileSync(
    path.join(Deno.cwd(), "utils", "tests", "assets/2.json"),
  );

  assertEquals(ComputeScenarioRating(JSON.parse(json)).scenarioRating, 0);
});

Deno.test("compute rating for a spectacular match", () => {
  const json = Deno.readTextFileSync(
    path.join(Deno.cwd(), "utils", "tests", "assets/3.json"),
  );

  assertEquals(ComputeScenarioRating(JSON.parse(json)).scenarioRating, 7);
});

Deno.test("compute rating for a balanced match", () => {
  const json = Deno.readTextFileSync(
    path.join(Deno.cwd(), "utils", "tests", "assets/4.json"),
  );

  assertEquals(ComputeScenarioRating(JSON.parse(json)).scenarioRating, 3);
});

// add tests for other ratings
