// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";

async function show() {
  console.log("1. adyos.tomcat.sh");
  console.log("2. Custom Server\n");

  let domain; // set server domain
  while (1 == 1) {
    let ask = await wfi.asks("Server to connect to: ");
    if (ask == "2") {
      domain = await wfi.asks("Server URL: "); // add server checking here eventually to see if its a real server. probably add something to the server to say its an adyos server too, as that would be useful.
      break;
    } else if (ask == "1") {
      domain = "adyos.tomcat.sh";
      break;
    } else {
      console.log("Try again.");
    }
  }

  while (1 == 1) {
    console.log("\n1. Log In\n2. Sign up\n");
    let ask = await wfi.asks("1 or 2: ");
    if (ask == "1") {
      console.log("log in screen");
      break;
    } else if (ask == "2") {
      console.log("sign up screen");
      break;
    } else {
      console.log("Try again!");
    }
  }

  return { server: domain };
}

export { show };
