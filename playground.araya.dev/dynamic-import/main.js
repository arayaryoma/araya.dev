"use strict";

document
  .querySelector("#btn-load-script")
  .addEventListener("click", async () => {
    const foobar = await import("./foobar.js");
    console.log(foobar.default); // output: "foobar"
    console.log(foobar.print()); // output: "foobar in print func"
  });
