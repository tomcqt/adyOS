// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";

function run(command) {
    // add later
    console.log(command+" was ran!");
}

function start() { // acr.start();
    input.asks("terminal $ ");
}

export { start };