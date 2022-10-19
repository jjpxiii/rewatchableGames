// routes/games/[week].tsx

import { Handlers, PageProps } from "$fresh/server.ts";
import { JSX } from "preact/jsx-runtime";

interface GameStats {
  id: number;
  shortName: string;
  bigPlays: number;
}

// export const handler = (_req: Request, _ctx: HandlerContext): Response => {
//     const randomIndex = Math.floor(Math.random() * JOKES.length);
//     const body = JOKES[randomIndex];
//     return new Response(body);
//   };

export const handler: Handlers<unknown | null> = {
  async GET(_, ctx) {
    const { week } = ctx.params;
    const resp = await fetch(
      `http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2022/types/2/weeks/${week}/events?lang=en&region=us`,
    );
    if (resp.status === 404) {
      return ctx.render(null);
    }
    const gameList = await resp.json();
    // console.log(gameList);

    const gameStats: GameStats[] = await Promise.all(
      gameList.items.map(async (item) => {
        const id = item.$ref
          .replace(
            "http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/",
            "",
          )
          .replace("?lang=en&region=us", "");
        const shortNameRes = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}`,
        );
        const shortNameResJson = await shortNameRes.json();
        const shortName = shortNameResJson.shortName;
        const resp = await fetch(
          `https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/events/${id}/competitions/${id}/plays?limit=400`,
        );
        //   console.log(id)
        //   console.log(resp)
        const respj = await resp.json();

        let bigPlays = 0;
        if (respj.items) {
          respj.items.map(
            (i: { type: { abbreviation: string }; statYardage: number }) => {
              try {
                if (i.type?.abbreviation === "PASS" && i.statYardage >= 25) {
                  bigPlays++;
                } else if (
                  i.type?.abbreviation === "RUSH" &&
                  i.statYardage >= 10
                ) {
                  bigPlays++;
                }
              } catch {
                console.log(id);
              }
            },
          );
          // console.log(shortName);
          // console.log(bigPlays);
          return { id, shortName, bigPlays } as GameStats;
        }
      }),
    );
    return new Response(JSON.stringify(gameStats));
  },
};

function GameItem(game: GameStats): JSX.Element {
  console.log(game.shortName);
  console.log(game.bigPlays);
  return (
    <p>
      fEZFEZF
      <div>
        <h3>{game.shortName}</h3>
        <div>
          <p>Big plays {game.bigPlays}</p>
        </div>
      </div>
    </p>
  );
}

export default function Page({ data }: PageProps<unknown | null>) {
  if (!data.gameStats) {
    console.log(data.gameStats);
    return <h1>No games found</h1>;
  }

  console.log(data.gameStats);
  return JSON.stringify(data.gameStats);
  // <div>
  //   {data.gameStats.map((game: GameStats) => {
  //     console.log(game.shortName)
  //     return <p>TOTO</p>;
  //   })}
  // </div>
}
