"use strict";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const video = $("#video");
const constraints = {
  audio: false,
  video: true,
};

class VideoSelector extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    const select = document.createElement("select");
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      devices
        .filter((device) => device.kind === "videoinput")
        .forEach((device) => {
          console.log(device);
          const option = document.createElement("option");
          option.setAttribute("value", device.deviceId);
          option.innerText = device.label;
          select.appendChild(option);
        });
      select.addEventListener("change", (event) => {
        this.onDeviceChanged(event);
      });
      const startButton = document.createElement("button");
      startButton.innerText = "Start Recording";
      startButton.addEventListener("click", startRecord);
      this.appendChild(startButton);
      this.appendChild(select);
    });
  }
  onDeviceChanged(event) {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: { deviceId: event.target.value, width: 480, height: 270 },
      })
      .then((stream) => {
        const videoTracks = stream.getVideoTracks();
        stream.onremovetrack = () => {
          console.log("Stream ended");
        };
        window.stream = stream;
        video.srcObject = stream;
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

const recordedChunks = [];
const download = () => {
  const blob = new Blob(recordedChunks, {
    type: "video/webm",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style = "display: none";
  a.href = url;
  a.download = "test.webm";
  a.click();
  window.URL.revokeObjectURL(url);
};
const handleDataAvailable = (event) => {
  console.log("data available");
  if (event.data.size > 0) {
    recordedChunks.push(event.data);
    console.log(recordedChunks);
    download();
  }
};
const startRecord = () => {
  const options = {
    mimeType: "video/webm; codec=vp9",
  };
  const recorder = new MediaRecorder(window.stream, options);

  recorder.ondataavailable = handleDataAvailable;
  recorder.start();
  setTimeout((event) => {
    console.log("stopping");
    recorder.stop();
  }, 5000);
};
customElements.define("video-selector", VideoSelector);
