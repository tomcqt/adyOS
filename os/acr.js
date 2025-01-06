// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as afs from "./filesystem/afsdriver.js";
import * as cmd from "./filesystem/cmd.js";
import * as ezout from "./ezout.js";

async function start(username) {
  // acr.start();

  console.log(`\nWelcome, ${username}!\n`);
  console.log(`The system time is: `);

  let path = afs.setdefault(username);
  let pathrewritten, prompt, command, commandsplit; // define variables here

  while (true) {
    pathrewritten = afs.rewritepath(path.toString(), username);

    prompt = `${username}@SYSTEMNAME ${pathrewritten} $ `;

    command = await input.asks(prompt);
    commandsplit = command.split(" ");

    if (cmd.cmd.find((item) => item[0] === commandsplit[0])) {
      for (let i = 0; i < cmd.cmd.length; i++) {
        if (cmd.cmd[i][0] === commandsplit[0]) {
          if (cmd.cmd[i][2][0]) {
            // flags check
            console.log(cmd.cmd[i][1](command, commandsplit));
            break;
          } else {
            // dont add too many they take forever to add
            if (cmd.cmd[i][2][1]) {
              // await flag
              if (cmd.cmd[i][2][2]) {
                // user data flag and await
                console.log(
                  await cmd.cmd[i][1](command, commandsplit, username)
                );
              } else {
                // await no user data flag
                console.log(await cmd.cmd[i][1](command, commandsplit));
              }
            } else {
              // no await
              if (cmd.cmd[i][2][2]) {
                // user data flag
                console.log(cmd.cmd[i][1](command, commandsplit, username));
              } else {
                // no user data flag
                console.log(cmd.cmd[i][1](command, commandsplit));
              }
            }
          }
        }
      }
    } else {
      ezout.error_nodebug("Command not found.");
    }
  }
}

export { start };
