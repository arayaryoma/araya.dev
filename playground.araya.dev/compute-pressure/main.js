const observer = new ComputePressureObserver(
  (update) => {
    console.log(update);
  },
  {
    cpuUtilizationThresholds: [0.0001, 0.001, 0.01, 0.25, 0.5, 0.9],
    cpuSpeedThresholds: [0.1, 0.25, 0.5, 0.9],
  }
);

observer.observe();

setInterval(() => {
  document.getElementById("foobar").innerText = Math.sqrt(
    Math.random() * Math.random()
  );
}, 10);
