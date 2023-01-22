export const PREFERRED_COLOR_SCHEME = "preferred-color-scheme";
export const ALLOWED_COLORS_SCHEMES = Object.freeze(["dark", "light"]);

const htmlNode = document.querySelector("html");

/**
 * @returns {string} 'dark' or 'light'
 */
export function detectPreferredColorScheme() {
  const userSetting = localStorage.getItem(PREFERRED_COLOR_SCHEME);
  if (userSetting) return userSetting ?? "light";
  const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return isDark ? "dark" : "light";
}

/**
 *
 * @param {string} color 'dark' or 'light'
 */
export function changeColorScheme(color) {
  if (ALLOWED_COLORS_SCHEMES.indexOf(color) < 0) {
    throw new Error(`color: ${color} is disallowed`);
  }
  localStorage.setItem(PREFERRED_COLOR_SCHEME, color);
  const html = document.querySelector("html");
  html?.setAttribute("data-color-scheme", color);
}

export function onChnageColorScheme(callback) {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "data-color-scheme") {
        callback(htmlNode.getAttribute("data-color-scheme"));
      }
    });
  });
  observer.observe(htmlNode, {
    attributes: true,
  });
}
