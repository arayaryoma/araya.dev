export class LoremIpsum extends HTMLElement {
  constructor() {
    super();
    const internals = this.attachInternals?.();

    // check for a Declarative Shadow Root:
    let shadow = internals?.shadowRoot;
    if (!shadow) {
      // there wasn't one. create a new Shadow Root:
      shadow = this.attachShadow({ mode: "open" });
    }
    const p = document.createElement("p");
    p.innerHTML = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.
`;
    shadow.appendChild(p);

    const stylesheet = document.createElement("link");
    stylesheet.setAttribute("rel", "stylesheet");
    stylesheet.setAttribute(
      "href",
      "./webcomponents/lorem-ipsum//lorem-ipsum.css"
    );
    shadow.appendChild(stylesheet);
  }
}
