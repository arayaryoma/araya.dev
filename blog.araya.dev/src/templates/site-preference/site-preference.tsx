import { ColorSchemeToggleButton } from "../color-scheme-toggle";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "site-preference": React.DetailedHTMLProps<any, any>;
    }
  }
}

export const SitePreference = () => {
  return (
    <site-preference>
      <template
        // @ts-expect-error
        shadowroot="open"
      >
        <link rel="stylesheet" href="/styles/site-preference.css" />
        <div className="container">
          <button type="button" data-toggle-button className="toggle-button">
            <img
              src="https://araya.dev/assets/gear-white.svg"
              alt="サイト設定"
              className="icon"
            />
          </button>
          <dialog data-dropdown-menu className="dropdown-menu">
            <ul>
              <li className="dropdown-menu-item">
                <span>Light</span> <ColorSchemeToggleButton />
                <span>Dark</span>
              </li>
            </ul>
          </dialog>
        </div>
      </template>
    </site-preference>
  );
};
