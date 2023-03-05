import type { AstroIntegration } from "astro";

function changelogIntegration(): AstroIntegration {
  return {
    name: "astro-changelog",
    hooks: {
      "astro:config:setup": async ({ config }) => {
        console.log("hello, this is a changelog integration!");
      },
    },
  };
}

export default changelogIntegration;
