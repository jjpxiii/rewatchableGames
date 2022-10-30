import { GameStats } from "../types.ts";

export default ({ title, body }) => (
  <html>
    <head>
      <title>{title}</title>
    </head>
    <body>
      <h1>{title}</h1>
      {/* <div>{body}</div>: */}
      {body.map((i) => (
        <div dangerouslySetInnerHTML={{ __html: i }} />
      ))}
    </body>
  </html>
);
