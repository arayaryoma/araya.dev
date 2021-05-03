import "/js/webcomponents/color-scheme-toggle.js";

const PREFERRED_COLOR_SCHEME = "preferred-color-scheme";

function detectPreferredColorScheme() {
  const userSetting = localStorage.getItem(PREFERRED_COLOR_SCHEME);
  if (userSetting) return userSetting ?? "light";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
}

const colorScheme = detectPreferredColorScheme();

const html = document.querySelector("html");
html?.setAttribute("data-color-scheme", colorScheme);
