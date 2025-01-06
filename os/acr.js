// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as afs from "./filesystem/afsdriver.js";

async function start(username) {
  // acr.start();

  let path = afs.setdefault(username);
  let pathrewritten, prompt, command;

  while (true) {
    pathrewritten = afs.rewritepath(path, username);

    prompt = `${username}@SYSTEMNAME ${pathrewritten} $ `;

    command = await input.asks(prompt);
  }
}

export { start };
