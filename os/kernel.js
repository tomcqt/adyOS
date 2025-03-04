// adyOS Kernel
import * as delay from "../custom_modules/delay.js";
import * as debug from "../debug.js";
if (!debug.debug) {
  console.clear();
}
console.log("kernel $ loading files");
await delay.wait(Math.random() * 30);
console.log('kernel $ loaded "./index.js"');
await delay.wait(Math.random() * 30);
console.log('kernel $ loaded "./os/kernel.js"');
await delay.wait(Math.random() * 30);
import * as ezout from "./ezout.js";
console.log('kernel $ loaded "./os/ezout.js"');
await delay.wait(Math.random() * 30);
import * as logins from "./filesystem/usr/login.js";
console.log('kernel $ loaded "./os/filesystem/usr/login.js"');
await delay.wait(Math.random() * 30);
import * as acr from "./acr.js";
console.log('kernel $ loaded "./os/acr.js"');
await delay.wait(Math.random() * 30);
console.log('kernel $ loaded "./custom_modules/delay.js"');
await delay.wait(Math.random() * 30);
console.log('kernel $ loaded "./custom_modules/wfi.js"');
await delay.wait(Math.random() * 30);
console.log('kernel $ loaded "./debug.js"');
await delay.wait(Math.random() * 30);

console.log("kernel $ files loaded");
await delay.wait(Math.random() * 30);

console.log("kernel $ starting boot process");
await delay.wait(Math.random() * 30);

console.log("kernel $ loading folder structure");
import * as fs from "fs";
fs.existsSync("./os/filesystem/home") || fs.mkdirSync("./os/filesystem/home");

console.log(`\nWelcome to adyOS ${fs.readFileSync("./os/version", "utf-8")}`);
ezout.info("Now with DEBUG MODE!!!!!!!!!!!!!!!!!!");
ezout.warn("Debug mode enabled, it may look wacky.");
ezout.warn("YOU HAVE BEEN WARNED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

if (debug.debug) {
  console.log();
}

await delay.wait(1000);

function panic(err) {
  let message = [
    `System panicked!`,
    "We found a(n) " + err.name + " due to:",
    "Running adyOS version " + fs.readFileSync("./os/version"),
    "Please add an issue in the project GitHub if you can replicate this crash",
  ];
  err.message.split("\n").forEach((i) => {
    message.push(i);
  });
  let longest = message.sort(function (a, b) {
    return b.length - a.length;
  })[0].length;
  let spacer = " ".repeat(ezout.center(longest).split(" ").length - 1);
  message.forEach((i) => {
    console.log(spacer + i);
  });
}

async function startup() {
  ezout.info("Loading login screen");
  let usrinfo = await logins.show(); // show login screen
  try {
    let os = await acr.start(usrinfo);
  } catch (err) {
    panic(err);
    return;
  }
  if (os === 126) {
    await startup();
  }
}

export { startup };
