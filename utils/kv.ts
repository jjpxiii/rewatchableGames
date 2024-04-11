/// <reference lib="deno.unstable" />

const db = await Deno.openKv();

// Deno.cron("Write weather data to Deno KV", "0 * * * *", async () => {
  console.log("Pull weather data and set to Deno KV");
  const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.0522&longitude=-118.2437&hourly=temperature_2m,precipitation&timezone=America%2FLos_Angeles');
  const body = await res.json();
  const date = new Date(Date.now()).toString();
  await db.set(["weather", date], {
      temperature: body.hourly.temperature_2m[0],
      precipitation: body.hourly.precipitation[0]
    }
  );
// })

Deno.serve(async (_req) => {
  const entries = db.list({ prefix: ["weather"] });
  let responseString = "";
  console.log(db)
  for await (const entry of entries) {
    responseString += `${entry.key[1]}: ${entry.value.temperature}°C with ${entry.value.precipitation}mm precipitation\n`;
  }
  return new Response(responseString);
})
