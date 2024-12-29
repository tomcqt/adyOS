// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";

async function show() {
  console.log("1. adyos.tomcat.sh");
  console.log("2. Custom Server\n");

  let domain; // set server domain
  while (1 == 1) {
    let ask = await wfi.asks("Server to connect to (URL): ");
    if (ask == "2") {
      domain = await wfi.asks("Server URL: ");
      break;
    } else if (ask == "1") {
      domain = "adyos.tomcat.sh";
      break;
    } else {
      console.log("Try again.");
    }
  }

  return { server: domain };
}

export { show };
