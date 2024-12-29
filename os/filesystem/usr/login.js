// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";

function show() {
  console.log("1. adyos.tomcat.sh");
  console.log("2. Custom Server\n");
  let ask = wfi.asks("Server to connect to (URL): ");
  if (ask == "2") {
    let domain = wfi.asks("Server URL: ");
  } else if (ask == "1") {
    let domain = "adyos.tomcat.sh";
  } else {
    console.log("Try again.");
    return NaN;
  }
  return { server: domain };
}

export { show };
