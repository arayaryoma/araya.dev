const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

class ImageInfo extends HTMLElement {
  constructor() {
    super();
    if (this.shadowRoot) {
      console.log("DSD  exists");
    } else {
      const template = this.querySelector("#image-info-template");
      const shadow = this.attachShadow({ mode: "open" });
      shadow.appendChild(template.content.cloneNode(true));
    }

    const valueEl = this.shadowRoot.querySelector("[data-size-value]");
    const img = this.querySelector("img");

    img.addEventListener("load", () => {
      valueEl.innerText = `${img.naturalWidth} x ${img.naturalHeight}`;
    });
  }
}

customElements.define("image-info", ImageInfo);
