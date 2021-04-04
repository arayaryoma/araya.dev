import { FC } from "react";
import { ColorSchemeToggleButton } from "./color-scheme-toggle";

const gaScriptContent = `window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-104175258-3');
`;

export type StyleSheet = {
  href: string;
  rel?: "preconnect" | "prefetch";
};

export type Script = {
  src: string;
  module?: boolean;
};

type Props = {
  styles?: Array<StyleSheet>;
  scripts?: Array<Script>;
  title: string;
};

export const Base: FC<Props> = (props) => {
  return (
    <>
      <html lang="ja">
        <head>
          <title>{props.title}</title>
          <script
            async
            src="https://www.googletagmanager.com/gtag/js?id=UA-104175258-3"
          ></script>
          <script
            dangerouslySetInnerHTML={{ __html: gaScriptContent }}
          ></script>
          <meta charSet="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, viewport-fit=cover"
          />
          {props.styles?.map((style) => (
            <>
              {style.rel && <link rel={style.rel} href={style.href} />}
              <link rel="stylesheet" href={style.href} />
            </>
          ))}
          {props.scripts?.map((script) => (
            <>
              <link rel="prefetch" href={script.src} />
              <script
                async
                src={script.src}
                type={script.module ? "module" : undefined}
              />
            </>
          ))}

          <link rel="preconnect" href="https://fonts.gstatic.com" />
        </head>
        <body>
          <nav className="global-nav">
            <div className="container global-nav-content">
              <a href="/" className="top-header-link">
                <img
                  src="https://araya.dev/assets/icon.svg"
                  alt="icon image"
                  className="header-icon"
                />
                <span className="header-title">araya's Reservoir</span>
              </a>
            </div>
          </nav>
          {/* <ColorSchemeToggleButton /> */}
          <div className="content">{props.children}</div>
          <footer className="footer">
            <div className="container">
              <div className="footer--contents">
                <p>
                  当サイト内の意見・感想等は全てaraya個人によるものであり特定の組織との一切の関わりを持ちません
                </p>
                <img
                  src="/assets/images/cc-by.svg"
                  alt="License is CC-BY"
                  className="footer--license"
                />
                <span className="footer--copy-right">&copy; araya</span>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </>
  );
};
