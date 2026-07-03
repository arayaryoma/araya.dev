// Detect and report support for the frame-sizing property.
const supportEl = document.getElementById("support");

const supported =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("frame-sizing", "content-height");

if (supported) {
  supportEl.textContent =
    "✅ This browser supports frame-sizing: content-height.";
  supportEl.classList.add("supported");
} else {
  supportEl.classList.add("unsupported");
  supportEl.textContent =
    "⚠️ This browser does not support frame-sizing: content-height yet." +
    " In Chrome, enable the flag at chrome://flags/#responsive-iframes," +
    " or try a supporting version (unsupported browsers fall back to a fixed height).";
}
