import { FreshContext } from "$fresh/server.ts";

export const handler = (_req: Request, _ctx: FreshContext): Response => {
  console.log("ZEFRZEFZEGFZEGZEFZEF");
  console.log(_ctx);

  const { weekId } = _ctx.params;

  return new Response("foooooo " + weekId);
};
