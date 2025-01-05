// adyOS 1.0.0
// By tomcat with a q

import * as kernel from "./os/kernel.js";
import * as delay from "./custom_modules/delay.js";

await delay.wait(1000);
console.log("kernel $ initialized\n");
await delay.wait(100);
await kernel.startup();
