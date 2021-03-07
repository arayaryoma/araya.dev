const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const images = $$(".item img");
images.forEach((image) => {
  image.addEventListener("load", () => {
    console.log(image.naturalWidth, image.naturalHeight);
  });
});
