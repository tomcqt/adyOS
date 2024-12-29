// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as echo from "./cmd/echo.js";

async function run(command) {
  // add later
  return command + " was run!";
}

async function start() {
  // acr.start();
  await input.asks("terminal $ ");
}

export { start };
