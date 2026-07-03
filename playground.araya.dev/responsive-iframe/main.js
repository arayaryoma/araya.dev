// frame-sizing プロパティのサポート状況を検出して表示する
const supportEl = document.getElementById("support");

const supported =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("frame-sizing", "content");

if (supported) {
  supportEl.textContent =
    "✅ このブラウザは frame-sizing: content をサポートしています。";
  supportEl.classList.add("supported");
} else {
  supportEl.classList.add("unsupported");
  supportEl.textContent =
    "⚠️ このブラウザは frame-sizing: content をまだサポートしていません。" +
    " Chrome では chrome://flags の Experimental Web Platform features を有効にするか、" +
    " 対応バージョンで確認してください（未対応環境では従来どおり固定高さになります）。";
}
