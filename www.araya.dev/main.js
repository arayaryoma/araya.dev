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
  const { JobHistoryItem } = await import(
    "./webcomponents/job-history-item/job-history-item.js"
  );

  const { NavBar } = await import("./webcomponents/nav-bar/nav-bar.js");

  customElements.define("lorem-ipsum", LoremIpsum);

  customElements.define("job-history-item", JobHistoryItem);

  customElements.define("nav-bar", NavBar);

})();

window.addEventListener("load", () => {
  console.log("load:", location.hash);
  onLocationHashChanged(location.hash);
});

window.addEventListener("hashchange", () => {
  console.log("hashchange:", location.hash);
  onLocationHashChanged(location.hash);
});

/**
 *
 * @param {string} hash
 */
function onLocationHashChanged(hash) {
  // The default visible contents is About section
  hash = hash || "about";
  changeVisibleContents(hash);
}

/**
 *
 * @param {string} hash
 */
function changeVisibleContents(hash) {
  const el = document.querySelector(hash);
  el.classList.add("active-section");
  const sections = document.querySelectorAll("[data-contents-section]");
  for (const section of sections) {
    if (`#${section.id}` !== hash) {
      section.classList.remove("active-section");
    }
  }
}
