import {
  changeColorScheme,
  detectPreferredColorScheme,
} from "/js/lib/color-scheme.js";
class ColorSchemeToggle extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const colorScheme = detectPreferredColorScheme();
    const checkbox = this.shadowRoot?.querySelector("input");
    if (!checkbox) return;
    if (colorScheme == "dark") {
      checkbox.checked = true;
    }
    checkbox.addEventListener("change", (ev) => {
      changeColorScheme(ev.target.checked ? "dark" : "light");
    });
  }
}

customElements.define("color-scheme-toggle", ColorSchemeToggle);
