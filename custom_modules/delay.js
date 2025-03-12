// delay script

import * as debug from "../debug.js";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { wait };
