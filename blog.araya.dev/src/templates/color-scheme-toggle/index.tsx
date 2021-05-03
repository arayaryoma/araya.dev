declare global {
  namespace JSX {
    interface IntrinsicElements {
      "color-scheme-toggle": React.DetailedHTMLProps<any, any>;
    }
  }
}

export const ColorSchemeToggleButton = () => {
  return (
    <color-scheme-toggle>
      <template
        // @ts-expect-error
        shadowroot="open"
      >
        <link rel="stylesheet" href="/styles/color-scheme-toggle.css" />
        <label className="label">
          <div className="toggle">
            <input
              className="toggle-state"
              type="checkbox"
              name="toggle light and dark"
              value="check"
            />
            <div className="indicator"></div>
          </div>
        </label>
      </template>
    </color-scheme-toggle>
  );
};
