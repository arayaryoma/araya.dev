if (typeof window.EyeDropper === "undefined") {
  window.alert(
    "Your browser doesn't support EyeDropper API. Please enable chrome://flags/#enable-experimental-web-platform-features"
  );
} else {
  const eyeDropper = new EyeDropper();
  const resultTextArea = document.getElementById("picked-color");

  document.getElementById("eyedropper").addEventListener("click", (e) => {
    eyeDropper
      .open()
      .then((colorSelectionResult) => {
        resultTextArea.innerText = `${colorSelectionResult.sRGBHex}`;
        console.log(colorSelectionResult);
      })
      .catch((error) => {
        console.error(colorSelectionResult);
      });
  });
}
