const observer = new PressureObserver(
  (records) => {
    const lastRecord = records.at(-1);
    console.log(`Current pressure:`, lastRecord);
  },
  { sampleRate: 1 },
);

observer.observe("cpu");

let loadTestRunning = false;
let interval;

function cpuIntensiveTask() {
  let x = 0;
  for (let i = 0; i < 1e6; ++i) {
    x += Math.sqrt(i);
  }
  return x;
}

const calcResultEl = document.querySelector("#calcResult");

document.querySelector("#toggleBtn").addEventListener("click", function () {
  loadTestRunning = !loadTestRunning;

  if (loadTestRunning) {
    this.textContent = "Stop CPU Load Test";

    // JavaScript CPU Load
    interval = setInterval(() => {
      const result = cpuIntensiveTask();
      const el = document.createElement("p");
      el.textContent = result;
      calcResultEl.appendChild(el);
    }, 100);
  } else {
    this.textContent = "Start CPU Load Test";
    clearInterval(interval);
  }
});
