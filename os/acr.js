// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as afs from "./filesystem/afsdriver.js";
import * as cmd from "./filesystem/cmd.js";
import * as ezout from "./ezout.js";

async function start(username) {
  // acr.start();

  console.log(`\nWelcome, ${username}!`);
  console.log(
    `The system time is: ${new Date()
      .toISOString()
      .replace("T", " ")
      .split(".")[0]
      .split(" ")
      .reverse()
      .join(" on ")}\n`
  );

  let path = afs.setdefault(username);
  let pathrewritten, prompt, command, commandsplit, systemname; // define variables here

  systemname = await afs.getsystemname();

  while (true) {
    pathrewritten = afs.rewritepath(path.toString(), username);

    prompt = `${username}@${systemname} ${pathrewritten} $ `;

    command = await input.asks(prompt);
    commandsplit = command.split(" ");

    if (cmd.cmd.find((item) => item[0] === commandsplit[0])) {
      for (let i = 0; i < cmd.cmd.length; i++) {
        if (cmd.cmd[i][0] === commandsplit[0]) {
          if (!cmd.cmd[i][2][0]) {
            // flags check
            console.log(cmd.cmd[i][1](command, commandsplit));
            break;
          } else {
            // dont add too many they take forever to add
            if (cmd.cmd[i][2][1]) {
              // await flag
              if (cmd.cmd[i][2][2]) {
                // user data flag and await
                let cmd_data = await cmd.cmd[i][1](command, commandsplit, {
                  username: username,
                  systemname: systemname,
                });
                console.log(cmd_data.output);
                username = cmd_data.userdata.username;
                systemname = cmd_data.userdata.systemname;
              } else {
                // await no user data flag
                console.log(await cmd.cmd[i][1](command, commandsplit));
              }
            } else {
              // no await
              if (cmd.cmd[i][2][2]) {
                // user data flag
                let cmd_data = cmd.cmd[i][1](command, commandsplit, {
                  username: username,
                  systemname: systemname,
                });
                console.log(cmd_data.output);
                username = cmd_data.userdata.username;
                systemname = cmd_data.userdata.systemname;
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
