import fs from "fs";
import * as afs from "./afsdriver.js";
import * as debug from "../../debug.js";
import * as ezout from "../ezout.js";

async function load(newSystem = true) {
  let cmd = null;

  if (newSystem) {
    cmd = {};
  } else {
    cmd = [];
  }

  ezout.working("Loading commands...");

  // Exit Codes
  // 0 - output nothing
  // 126 - log out

  // create the stupid directory structure
  if (!fs.existsSync("os/filesystem/tmp")) {
    ezout.info("Creating tmp directory...");
    fs.mkdirSync("os/filesystem/tmp");
  }
  if (!fs.existsSync("os/filesystem/tmp/ws")) {
    ezout.info("Creating tmp/ws directory...");
    fs.mkdirSync("os/filesystem/tmp/ws");
  }

  // let lastsuper = 0;
  // let supercmds = ["system"];

  function internal_update_opt_json() {
    ezout.info("internal_update_opt_json()");
    fs.writeFileSync(afs.fsfix("sys/opt.json"), JSON.stringify(optional));
  }

  let optional;
  if (fs.existsSync(afs.fsfix("sys/opt.json"))) {
    optional = JSON.parse(fs.readFileSync(afs.fsfix("sys/opt.json")));
  } else {
    optional = {
      commands: {
        apk: false,
      },
    };

    if (!fs.existsSync(afs.fsfix("sys"))) {
      fs.mkdirSync(afs.fsfix("sys"));
    }

    internal_update_opt_json();
  }

  // import all commands from bin

  const files = fs.readdirSync(afs.fsfix("bin"));
  ezout.info(files);
  for (let i = 0; i < files.length; i++) {
    if (files[i].endsWith(".js")) {
      ezout.working("Loading command: " + files[i]);
      let command = await import("./bin/" + files[i]);
      command = command.default;
      // dont crash if its only one thing
      if (!Array.isArray(command)) command = [command];

      // multiple functions within one file (e.g. power and shutdown within power.js)
      command.forEach((commandData, index) => {
        if (!Array.isArray(commandData.name))
          commandData.name = [commandData.name];
        commandData.name.forEach((name) => {
          ezout.info("adding " + name + ` (${index})`);
          if (newSystem) {
            cmd[name] = commandData;
          } else {
            cmd.push([name, commandData.func, commandData.flags]);
          }
        });
        // fix for multiple names ^
      });
      ezout.done("Loaded command: " + files[i]);
    }
  }

  if (debug.debug) {
    // load debug commands
    const debugfiles = fs.readdirSync(afs.fsfix("bin/debug"));
    for (let i = 0; i < debugfiles.length; i++) {
      if (debugfiles[i].endsWith(".js")) {
        ezout.working("Loading command: " + debugfiles[i]);
        let command = await import("./bin/" + debugfiles[i]);
        command = command.default;
        // dont crash if its only one thing
        if (!Array.isArray(command)) command = [command];

        // multiple functions within one file (e.g. power and shutdown within power.js)
        command.forEach((commandData, index) => {
          if (!Array.isArray(commandData.name))
            commandData.name = [commandData.name];
          commandData.name.forEach((name) => {
            ezout.info("adding " + name + ` (${index})`);
            if (newSystem) {
              cmd[name] = commandData;
            } else {
              cmd.push([name, commandData.func, commandData.flags]);
            }
          });
          // fix for multiple names ^
        });
        ezout.done("Loaded command: " + debugfiles[i]);
      }
    }
  }

  // optional commands
  // add later when actually implementing that shit
  null;

  ezout.done("Loaded " + cmd.length + " commands.");
  if (!newSystem) ezout.info(cmd.map((a) => a[0]).join(", "));
  else ezout.info(Object.keys(cmd).join(", "));

  // export after everything has finished
  return cmd;
}

export { load };
