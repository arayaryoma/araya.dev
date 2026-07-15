export class NavBar extends HTMLElement {
  #menu;
  #toggle;

  constructor() {
    super();
    const internals = this.attachInternals?.();

    // check for a Declarative Shadow Root:
    let shadow = internals?.shadowRoot;
    if (!shadow) {
      const template = this.querySelector("template[shadowroot]");
      const mode = template.getAttribute("shadowroot");
      shadow = this.attachShadow({ mode });
      shadow.appendChild(template.content.cloneNode(true));
    }
    this.#menu = shadow.querySelector(".menu");
    this.#toggle = shadow.querySelector(".menu-toggle");
  }

  connectedCallback() {
    this.#toggle?.addEventListener("click", this.#onToggleClick);
    document.addEventListener("click", this.#onDocumentClick);
    document.addEventListener("keydown", this.#onDocumentKeydown);
  }

  disconnectedCallback() {
    this.#toggle?.removeEventListener("click", this.#onToggleClick);
    document.removeEventListener("click", this.#onDocumentClick);
    document.removeEventListener("keydown", this.#onDocumentKeydown);
  }

  get #open() {
    return this.#menu?.classList.contains("open") ?? false;
  }

  #setOpen(open) {
    if (!this.#menu || !this.#toggle) return;
    this.#menu.classList.toggle("open", open);
    this.#toggle.setAttribute("aria-expanded", String(open));
  }

  #onToggleClick = () => {
    this.#setOpen(!this.#open);
  };

  #onDocumentClick = (event) => {
    if (!this.#open) return;
    if (event.composedPath().includes(this.#menu)) return;
    this.#setOpen(false);
  };

  #onDocumentKeydown = (event) => {
    if (event.key !== "Escape" || !this.#open) return;
    this.#setOpen(false);
    this.#toggle.focus();
  };
}
