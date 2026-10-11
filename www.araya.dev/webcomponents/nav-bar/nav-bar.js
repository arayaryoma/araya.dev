export class NavBar extends HTMLElement {
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

    const quickLinks = shadow.querySelector("[data-quick-links]");
    const menuToggle = shadow.querySelector(".menu-toggle");
    if (!quickLinks || !menuToggle) {
      return;
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = quickLinks.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close quick links" : "Open quick links",
      );
    });
  }
}
