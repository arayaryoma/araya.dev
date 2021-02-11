import { React } from "../deps.ts";

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

type Props = {
  styles?: Array<StyleSheet>;
  children?: unknown;
};

export const Base = (props: Props) => {
  return (
    <>
      <html lang="ja">
        <head>
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
              <link rel={style.rel} href={style.href} />
            </>
          ))}
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link rel="prefetch" href="/js/highlight.js" as="script" />
          <link rel="prefetch" href="/styles/markdown.css" />
          <link rel="prefetch" href="/styles/lib/highlight.js/dracula.css" />
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
                <span className="header-title">Araya's Reservoir</span>
              </a>
            </div>
          </nav>
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
                <span className="footer--copy-right">&copy; Araya</span>
              </div>
            </div>
          </footer>
        </body>
      </html>
    </>
  );
};
