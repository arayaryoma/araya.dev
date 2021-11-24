const btn = document.querySelector("#toggleBtn");
const mainContent = document.querySelector("#mainContent");
const screensNumEl = document.querySelector("#screensNumMessage");

let screensNumMessage = "";
// https://github.com/webscreens/window-placement/blob/main/EXPLAINER.md#add-screenisextended-to-expose-the-presence-of-extended-screen-areas
if (window.screen.isExtended === undefined) {
  screensNumMessage = "Your browser doesn't support `Screen.isExtended `";
} else if (window.screen.isExtended === false) {
  screensNumMessage = "You have a screen";
} else if (window.screen.isExtended === true) {
  screensNumMessage = "You have 2 or more screens";
}
screensNumEl.innerText = screensNumMessage;

btn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    mainContent.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

window.screen.addEventListener("change", (e) => {
  console.log("window.screen has changed: ", e);
});

