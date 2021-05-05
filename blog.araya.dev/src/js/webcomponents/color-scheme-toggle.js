import {
  changeColorScheme,
  detectPreferredColorScheme,
  // @ts-ignore
} from "/js/lib/color-scheme.js";

/**
 *
 * @param {ShadowRoot} shadowRoot
 * @param {string} theme
 */
// @ts-ignore
class ColorSchemeToggle extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const colorScheme = detectPreferredColorScheme();
    const checkbox = this.shadowRoot?.querySelector("input");
    const label = this.shadowRoot?.querySelector("label");
    if (!checkbox || !label) return;
    if (colorScheme == "dark") {
      checkbox.checked = true;
    }
    label.setAttribute("data-color-scheme", colorScheme);

    checkbox.addEventListener("change", (ev) => {
      // @ts-ignore
      const newColorScheme = ev.target.checked ? "dark" : "light";
      changeColorScheme(newColorScheme);
      label.setAttribute("data-color-scheme", newColorScheme);
    });
  }
}

export function initColorSchemeToggle() {
  customElements.define("color-scheme-toggle", ColorSchemeToggle);
}
