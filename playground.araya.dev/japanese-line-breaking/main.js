document.addEventListener("DOMContentLoaded", () => {
  const supportsAutoPhrase = CSS.supports("word-break", "auto-phrase");
  if (!supportsAutoPhrase) {
    window.alert(
      "This browser does not support word-break: auto-phrase. You need to enable `xperimental Web Platform features` in chrome://flags on Chrome 119"
    );
  }
});
