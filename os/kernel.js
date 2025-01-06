// adyOS Kernel
import * as delay from "../custom_modules/delay.js";
console.clear();
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

console.log("kernel $ files loaded");
await delay.wait(Math.random() * 30);

console.log("kernel $ starting boot process");
await delay.wait(Math.random() * 30);

console.log("\nWelcome to adyOS!");

delay.wait(2500);

async function startup() {
  ezout.info("Loading login screen");
  let usrinfo = await logins.show(); // show login screen
  acr.start(usrinfo);
}

export { startup };
