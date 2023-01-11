class SitePreference extends HTMLElement {
  /**
   * @type {HTMLButtonElement | null}
   */
  #toggleButton;
  /**
   * @type {HTMLButtonElement | null}
   */
  #dropdownMenuDialog;

  /**
   * @type {"open" | "close"}
   */
  #dropdownMenuState;
  constructor() {
    super();
    this.#toggleButton = null;
    this.#dropdownMenuDialog = null;
    this.#dropdownMenuState = "close";
  }
  connectedCallback() {
    if (!this.shadowRoot) {
      throw new Error(`${this} should have a shadow root`);
    }
    this.#toggleButton = this.shadowRoot.querySelector(
      "[data-toggle-button=true]"
    );
    this.#dropdownMenuDialog = this.shadowRoot.querySelector(
      "[data-dropdown-menu=true]"
    );
    this.#toggleButton?.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleDropdownMenu();
    });
  }

  toggleDropdownMenu() {
    if (this.#dropdownMenuState === "close") {
      this.#dropdownMenuState = "open";
      this.#dropdownMenuDialog?.show();
    } else {
      this.#dropdownMenuState = "close";
      this.#dropdownMenuDialog?.close();
    }
  }
}

export function initSitePreference() {
  customElements.define("site-preference", SitePreference);
}
