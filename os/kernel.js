// adyOS Kernel

console.log("kernel $ loading files");

console.log('kernel $ loaded "./index.js"');
console.log('kernel $ loaded "./os/kernel.js"');
import * as ezout from "./ezout.js";
console.log('kernel $ loaded "./os/ezout.js"');
import * as logins from "./filesystem/usr/login.js";
console.log('kernel $ loaded "./os/filesystem/usr/login.js"');
import * as acr from "./acr.js";
console.log('kernel $ loaded "./os/acr.js"');

console.log('kernel $ loaded "./custom_modules/delay.js"');
console.log('kernel $ loaded "./custom_modules/wfi.js"');

console.log("kernel $ files loaded");

console.log("kernel $ starting boot process");

async function startup() {
  console.log("Welcome to adyOS!\n");
  ezout.info("Loading login screen");
  let usrinfo = await logins.show(); // show login screen
  acr.start(username);
}

export { startup };
