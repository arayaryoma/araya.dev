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
customElements.define("video-selector", VideoSelector);
