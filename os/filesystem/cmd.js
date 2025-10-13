import fs from "fs";
import * as afs from "./afsdriver.js";
import * as debug from "../../debug.js";
import * as ezout from "../ezout.js";

async function load(isMan = false) {
  let cmd = [];

  let man = {};

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
        if (Array.isArray(commandData.name)) {
          ezout.info("multiple names detected");
          commandData.name.forEach((name) => {
            ezout.info("adding " + name + ` (${index})`);
            cmd.push([name, commandData.func, commandData.flags]);
            man[name] = {
              name: commandData.name,
              desc: commandData.desc,
              usage: commandData.usage,
            };
          });
        } else {
          ezout.info("adding " + commandData.name + ` (${index})`);
          cmd.push([commandData.name, commandData.func, commandData.flags]);
          man[commandData.name] = {
            name: commandData.name,
            desc: commandData.desc,
            usage: commandData.usage,
          };
        }
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
        ezout.working("Loading debug command: " + debugfiles[i]);
        let command = await import("./bin/debug/" + debugfiles[i]);
        command = command.default;
        if (Array.isArray(command.name)) {
          ezout.info("multiple names detected");
          command.name.forEach((name) => {
            ezout.info("adding " + name);
            cmd.push([name, command.func, command.flags]);
            man[name] = {
              name: command.name,
              desc: command.desc,
              usage: command.usage,
            };
          });
        } else {
          cmd.push([command.name, command.func, command.flags]);
          man[command.name] = {
            name: command.name,
            desc: command.desc,
            usage: command.usage,
          };
        }
        // fix for multiple names ^
        ezout.done("Loaded debug command: " + debugfiles[i]);
      }
    }
  }

  // optional commands
  for (let command in optional.commands) {
    if (optional.commands[command]) {
      ezout.working("Loading optional command: " + command);
      let command = await import("./bin/optional/" + command + ".js");
      command = command.default;
      if (Array.isArray(command.name)) {
        ezout.info("multiple names detected");
        command.name.forEach((name) => {
          ezout.info("adding " + name);
          cmd.push([name, command.func, command.flags]);
          man[name] = {
            name: command.name,
            desc: command.desc,
            usage: command.usage,
          };
        });
      } else {
        cmd.push([command.name, command.func, command.flags]);
        man[command.name] = {
          name: command.name,
          desc: command.desc,
          usage: command.usage,
        };
      }
      // fix for multiple names ^
      ezout.done("Loaded optional command: " + command);
    }
  }

  ezout.done("Loaded " + cmd.length + " commands.");
  ezout.info(cmd.map((a) => a[0]).join(", "));
  // export after everything has finished
  if (!isMan) {
    return cmd;
  } else {
    return man;
  }
}

export { load };
