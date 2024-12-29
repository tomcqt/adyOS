// adyOS Kernel

import * as usr from "./filesystem/usrdriver.js";
import * as logins from "./filesystem/usr/login.js";
import * as acr from "./acr.js";

function startup() {
    console.log("Welcome to adyOS!\n");
    let usrinfo = logins.show(); // show login screen
    // acr.start();
}

export { startup };