// ---------------------------------------------------------------------------
// ハック1: postMessage で子から通知された高さを iframe に反映する
// ---------------------------------------------------------------------------
const postMessageFrame = document.getElementById("postMessageFrame");
const postMessageLog = document.getElementById("postMessageLog");

window.addEventListener("message", (event) => {
  // 本来は event.origin を検証すること（デモでは同一オリジン前提）
  const data = event.data;
  if (!data || data.type !== "iframe-height") {
    return;
  }
  postMessageFrame.style.height = `${data.height}px`;
  postMessageLog.textContent = `受信した高さ: ${data.height}px`;
});

// ---------------------------------------------------------------------------
// ハック2: same-origin なら contentDocument から直接高さを測る
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
    sameOriginLog.textContent = `計測した高さ: ${height}px`;
  } catch (e) {
    // クロスオリジンだとここで SecurityError になる
    sameOriginLog.textContent =
      "計測失敗（クロスオリジンでは contentDocument を参照できません）";
  }
}

sameOriginFrame.addEventListener("load", () => {
  measureSameOrigin();
  // 中身が後から変化するケースに追従するためポーリング（当時の定番）
  setInterval(measureSameOrigin, 500);
});
