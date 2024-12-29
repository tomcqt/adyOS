// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as echo from "./cmd/echo.js";

function run(command) {
    // add later
    return command+" was run!";
}

function start() { // acr.start();
    input.asks("terminal $ ");
}

export { start };