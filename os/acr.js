// adyOS Command Runner / ACR

import * as input from "./../custom_modules/wfi.js";
import * as afs from "./filesystem/afsdriver.js";
import { load } from "./filesystem/cmd.js";
import * as ezout from "./ezout.js";
import * as fs from "fs";
import * as debug from "../debug.js";
import * as readline from "readline";

async function start(username) {
  // acr.start();
  // clear screen

  console.clear();

  // initialise variables
  let path = afs.setdefault(username);
  let pathrewritten, prompt, command, commandsplit, systemname; // define variables here

  systemname = await afs.getsystemname();

  let workspace = "none";

  let version = fs.readFileSync("./os/version", "utf-8"); // read the version file

  // load the fancy command system
  let cmd = await load(false);

  // awesome user info topbar
  function rendertopbar(ending) {
    if (
      process.stdout.columns <
      `${username} @ ${systemname} // on workspace ${workspace} // running adyos version ${version}`
        .length
    ) {
      return ezout.inverted_text(
        ezout.center(
          `${username} @ ${systemname} // on workspace ${workspace} // running adyos version ${version}`.slice(
            0,
            process.stdout.columns - 3
          ) + "...",
          true
        )
      );
    } else {
      return ezout.inverted_text(
        ezout.center(
          `${username} @ ${systemname} // on workspace ${workspace} // running adyos version ${version}`,
          true
        )
      ); // username @ systemname // on workspace workspace // adyos version X.X.X
    }
  }
  console.log(rendertopbar());

  // update the awesome user info topbar when the window is resized
  process.stdout.on("resize", () => {
    console.clear();
    console.log(rendertopbar("\n"));
  });

  // welcome text
  console.log(
    `Welcome, ${ezout.colours.bold}${username}${ezout.colours.reset}!`
  );
  // get time with timezone modifier
  function formatdate(timezoneOffset) {
    const date = new Date();

    const time = date.getTime();

    const offset = timezoneOffset * 60 * 60 * 1000;
    const newtime = new Date(time + offset);

    return newtime
      .toISOString()
      .replace("T", " ")
      .split(".")[0]
      .split(" ")
      .reverse()
      .join(" on ");
  }

  const timezoneOffset = afs.gettimezone();
  console.log(
    `The system time is ${ezout.colours.bold}${formatdate(timezoneOffset)}${
      ezout.colours.reset
    } (UTC${timezoneOffset >= 0 ? "+" + timezoneOffset : timezoneOffset})\n`
  );

  let lastsuper = 0;

  // main command process
  while (true) {
    // rewrites the path for the prompt
    pathrewritten = afs.rewritepath(path.toString(), username);

    // generates the prompt text
    prompt = `${ezout.colours.bold}${username}@${systemname} ${pathrewritten} $ ${ezout.colours.reset}`;

    // prompts for the command and handles autocmd automatic command execution.
    if (!debug.autocmd.on) {
      // normal prompt
      command = await input.asks(prompt);
      commandsplit = command.split(" ");
    } else {
      // with autocmd command execution
      command = debug.autocmd.command;
      commandsplit = debug.autocmd.command.split(" ");
    }

    // sends debug info if in debug mode
    ezout.info(command);
    ezout.info(commandsplit);
    // ezout.info(cmd);

    // checks if command exists
    if (cmd.find((item) => item[0] === commandsplit[0].toLowerCase())) {
      for (let i = 0; i < cmd.length; i++) {
        if (cmd[i][0] === commandsplit[0].toLowerCase()) {
          // run command and store result
          let result;
          try {
            result = await cmd[i][1]({
              cmd: command,
              cmds: commandsplit,
              usr: {
                username: username,
                systemname: systemname,
              },
              dir: {
                path: path,
                pathrw: pathrewritten,
                home: afs.setdefault(username),
              },
              sys: {
                workspace: workspace,
                timezone: afs.gettimezone(),
                version: version,
              },
              version: version,
              lastsuper: lastsuper,
            });
          } catch (err) {
            throw err;
            // what the fuck?????? why??????????????
          }
          // print result data to screen and handle return codes.
          // if its an await function turn it into a string
          if (result instanceof Promise) {
            result.then((output) => (result = output));
          }
          // exit (quit) code
          if (result === 126) {
            return 126;
          }
          // the thing that prints it
          // if it has userdata
          if (typeof result != "string" && typeof result != "number") {
            if (result.hasOwnProperty("userdata")) {
              if (result.userdata.hasOwnProperty("username")) {
                username = result.userdata.username;
              }
              if (result.userdata.hasOwnProperty("systemname")) {
                systemname = result.userdata.systemname;
              }
              if (result.userdata.hasOwnProperty("timezone")) {
                let jsondat = JSON.parse(
                  fs.readFileSync(afs.fsfix("users.json"))
                );
                jsondat.timezone = result.userdata.timezone;
                fs.writeFileSync(
                  afs.fsfix("users.json"),
                  JSON.stringify(jsondat)
                );
              }
            }

            if (result.hasOwnProperty("directory")) {
              path = result.directory;
            }

            if (result.hasOwnProperty("lastsuper")) {
              lastsuper = result.lastsuper;
            }
            // also check if we should output something
            if (result.output !== 0) {
              console.log(result.output);
            }
            // if it doesnt
          } else {
            // and check if we should output something
            if (result !== 0) {
              console.log(result);
            }
          }
          break;
        }
      }
    } else {
      // and handle if it doesnt exist
      if (command != "") {
        ezout.error_nodebug(`Command (${commandsplit[0]}) not found.`);
      }
    }
    // shut down after running command in autocmd mode
    if (debug.autocmd.on) {
      break;
    }
    // update topbar
    process.stdout.write("\u001b[s");
    process.stdout.write(`\u001b[${process.stdout.rows - 1}A\u001b[K`);
    process.stdout.write(rendertopbar());
    process.stdout.write("\u001b[u");
  }
}

export { start };
