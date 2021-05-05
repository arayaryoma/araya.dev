import { initColorSchemeToggle } from "/js/webcomponents/color-scheme-toggle.js";

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

if (!supportsDeclarativeShadowDOM()) {
  document.querySelectorAll("template[shadowroot]").forEach((template) => {
    const mode = template.getAttribute("shadowroot");
    const shadowRoot = template.parentNode.attachShadow({ mode });
    shadowRoot.appendChild(template.content);
    template.remove();
  });
}

initColorSchemeToggle();

function supportsDeclarativeShadowDOM() {
  return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
}
