// ---------------------------------------------------------------------------
// Hack 1: apply the height reported by the child via postMessage
// ---------------------------------------------------------------------------
const postMessageFrame = document.getElementById("postMessageFrame");
const postMessageLog = document.getElementById("postMessageLog");

window.addEventListener("message", (event) => {
  // In production, validate event.origin (same-origin assumed in this demo).
  const data = event.data;
  if (!data || data.type !== "iframe-height") {
    return;
  }
  postMessageFrame.style.height = `${data.height}px`;
  postMessageLog.textContent = `Received height: ${data.height}px`;
});

// ---------------------------------------------------------------------------
// Hack 2: measure directly from contentDocument when same-origin
// ---------------------------------------------------------------------------
const sameOriginFrame = document.getElementById("sameOriginFrame");
const sameOriginLog = document.getElementById("sameOriginLog");

function measureSameOrigin() {
  try {
    const doc = sameOriginFrame.contentDocument;
    if (!doc || !doc.body) {
      return;
    }
    const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
    sameOriginFrame.style.height = `${height}px`;
    sameOriginLog.textContent = `Measured height: ${height}px`;
  } catch (e) {
    // Cross-origin access throws a SecurityError here.
    sameOriginLog.textContent =
      "Measurement failed (contentDocument is not accessible cross-origin)";
  }
}

sameOriginFrame.addEventListener("load", () => {
  measureSameOrigin();
  // Poll to follow later content changes (the classic approach back then).
  setInterval(measureSameOrigin, 500);
});
