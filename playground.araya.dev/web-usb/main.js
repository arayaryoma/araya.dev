"use strict";
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const button = $("#get-usb-button");
button.addEventListener("click", (event) => {
  navigator.usb.requestDevice({ filters: [] }).then((device) => {
    console.log(device);
    const span = document.createElement("p");
    span.innerText = device.productName;
    document.body.appendChild(span);
  });
});
