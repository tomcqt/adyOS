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

    ezout.info(command);
    ezout.info(commandsplit);

    if (cmd.cmd.find((item) => item[0] === commandsplit[0])) {
      for (let i = 0; i < cmd.cmd.length; i++) {
        if (cmd.cmd[i][0] === commandsplit[0]) {
          let result = await cmd.cmd[i][1]({
            cmd: command,
            cmds: commandsplit,
            usr: {
              username: username,
              systemname: systemname,
            },
            dir: { path: path, pathrw: pathrewritten },
          });
          if (result instanceof Promise) {
            result.then((output) => (result = output));
          }
          if (result === 126) {
            return 126;
          }
          if (typeof result != "string" && typeof result != "number") {
            if (result.hasOwnProperty("userdata")) {
              if (result.userdata.hasOwnProperty("username")) {
                username = result.userdata.username;
              }
              if (result.userdata.hasOwnProperty("systemname")) {
                systemname = result.userdata.systemname;
              }
            }

            if (result.hasOwnProperty("directory")) {
              path = result.directory;
            }

            if (result.output !== 0) {
              console.log(result.output);
            }
          } else {
            if (result !== 0) {
              console.log(result);
            }
          }
          break;
        }
      }
    } else {
      if (command != "") {
        ezout.error_nodebug(`Command (${commandsplit[0]}) not found.`);
      }
    }
  }
}

export { start };
