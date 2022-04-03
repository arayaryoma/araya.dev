const navItems = [
  {
    name: "About",
    url: "#about",
  },
  {
    name: "Job History",
    url: "#job-history",
  },
];
export class NavBar extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const nav = document.createElement("nav");
    nav.classList.add("nav");
    const navList = document.createElement("ul");
    navList.classList.add("nav-list");
    for (const item of navItems) {
      const itemEl = document.createElement("li");
      itemEl.classList.add("nav-item");
      const anchor = document.createElement("a");
      anchor.setAttribute("href", item.url);
      anchor.innerText = item.name;
      itemEl.appendChild(anchor);
      navList.appendChild(itemEl);
    }
    nav.appendChild(navList);

    const iconContainer = document.createElement("div");
    iconContainer.classList.add("icon");

    const iconImg = document.createElement("img");
    iconImg.setAttribute("src", "/assets/white-cat.svg");
    iconImg.setAttribute("alt", "icon");

    iconContainer.appendChild(iconImg);

    nav.appendChild(iconContainer);
    this.appendChild(nav);
  }
}
