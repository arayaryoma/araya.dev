interface Props {
  title: string;
}
export const Root = (props: Props) => {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <h1>{props.title}</h1>
      </body>
    </html>
  );
};
