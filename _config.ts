import lume from "lume/mod.ts";
import jsx from "lume/plugins/jsx.ts";
import jsx_preact from "lume/plugins/jsx_preact.ts";

const site = lume({
  prettyUrls: true,
  server: {
    open: true,
  },
});

site.use(jsx());
site.use(jsx_preact());

site.ignore("README.md", "CHANGELOG.md", "routes", "node_modules");

export default site;
