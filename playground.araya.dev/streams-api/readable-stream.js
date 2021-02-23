const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelector(selector));

let interval = null;

const startEnqueuing = (controller) => {
  interval = setInterval(() => {
    const string = new Date().toLocaleTimeString();
    controller.enqueue(string);
    console.log(`Enqueued: ${string}`);
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);
    controller.close();
  }, 10000);
};

const stream = new ReadableStream({
  start(controller) {
    startEnqueuing(controller);
  },
  cancel() {
    clearInterval(interval);
  },
});

async function concatStringStream(stream) {
  const sectionNode = $("#readable-stream");
  const pNode = document.createElement("p");
  sectionNode.appendChild(pNode);
  let result = "";
  const reader = stream.getReader();
  await reader.read();

  while (true) {
    const { done, value } = await reader.read();
    if (done) return result;
    result += value;
    pNode.innerText = `Read data from stream: ${result}`;
    console.log(`Read ${result.length} characters so far`);
    console.log(`Most recently read chunk: ${value}`);
  }
}

concatStringStream(stream).then((result) =>
  console.log(`Stream complete`, result)
);
