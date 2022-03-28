function attachShadowRoots(root) {
  root.querySelectorAll("template[shadowroot]").forEach((template) => {
    const mode = template.getAttribute("shadowroot");
    let templateContent = template.content;
    try {
      const shadowRoot = template.parentNode.attachShadow({ mode });
      shadowRoot.appendChild();
      template.remove();
    } catch (e) {
      console.error(e);
    }
  });
}
function supportsDeclarativeShadowDOM() {
  return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
}

(async function init() {
  const { LoremIpsum } = await import(
    "./webcomponents/lorem-ipsum/lorem-ipsum.js"
  );

  customElements.define("lorem-ipsum", LoremIpsum);

  if (!supportsDeclarativeShadowDOM()) {
    attachShadowRoots(document);
  }
})();
