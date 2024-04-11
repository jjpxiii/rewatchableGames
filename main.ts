/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import twindPlugin from "$fresh/plugins/twind.ts";
import twindConfig from "./twind.config.ts";

// await start(manifest, { plugins: [twindPlugin(twindConfig)] });

const birthday = Temporal.PlainMonthDay.from("12-15");
const birthdayIn2030 = birthday.toPlainDate({ year: 2030 });
console.log(birthdayIn2030.toString());
// 2030-12-15

console.log("day of week", Temporal.Now.plainDateISO());
// day of week 7

const instant = Temporal.Instant.from('1969-07-20T20:17Z');
instant.toString(); // => '1969-07-20T20:17:00Z'
instant.epochMilliseconds; // => -14182980000

console.log(instant.epochMilliseconds)
console.log(instant.toString())