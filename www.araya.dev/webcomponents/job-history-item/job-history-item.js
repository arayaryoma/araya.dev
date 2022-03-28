export class JobHistoryItem extends HTMLElement {
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
  }
}
