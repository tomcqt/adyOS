// delay script

import * as debug from "../debug.js";

function wait(ms) {
  if (debug.debug) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export { wait };
