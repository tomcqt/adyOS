import * as ezout from "../ezout.js";
import { read } from "read";
import * as crypto from "crypto";
import * as fs from "fs";
import * as debug from "../../debug.js";

// Exit Codes:
// 0 - output nothing
// 126 - log out

let lastsuper = 0;
let supercmds = ["system"];

let optional = {
  commands: {
    apk: false,
  },
};

function echo(arg) {
  arg.cmds.shift();
  return arg.cmds.join(" ");
}

function system(arg) {
  if (arg.cmds[0] == "super") {
    if (arg.cmds[2] == "info") {
      if (arg.cmds[3] == "name") {
        if (arg.cmds[4] == "get") {
          return { output: arg.usr.systemname, userdata: arg.usr };
        } else if (arg.cmds[4] == "set") {
          return {
            output:
              "Set systemname to " +
              (arg.cmds[5] == "." ? "adyos" : arg.cmds[5]),
            userdata: {
              username: arg.usr.username,
              systemname: arg.cmds[5] == "." ? "adyos" : arg.cmds[5],
            },
          };
        }
      }
    } else if (arg.cmds[2] == "optional") {
      if (arg.cmds[3] == "applications") {
        if (arg.cmds[4] == "add") {
          if (arg.cmds[5] == "apk") {
            if (!optional.commands.apk) {
              optional.commands.apk = true;
              cmd.push(["apk", pacman]);
              ezout.info_nodebug("Enabled APK.");
              return 0;
            } else {
              ezout.info_nodebug("APK already enabed.");
              return 0;
            }
          }
        }
      }
    }
    return "[ ERROR ] Argument not found!";
  } else {
    return "[ ERROR ] Superuser access needed!";
  }
}

async function super_(arg) {
  ezout.info(lastsuper);
  let usersdata = JSON.parse(
    Buffer.from(
      await fs.promises.readFile("./os/filesystem/users.json")
    ).toString()
  );
  let itemnum;
  usersdata.users.forEach((item, index) => {
    if (item.username == arg.usr.username) {
      itemnum = index;
    }
  });
  if (!usersdata.users[itemnum].sudo) {
    return "[ ERROR ] Super is not allowed for this account!";
  }
  for (let i = 0; i < 3; i++) {
    let password_hashed;
    if (lastsuper > Date.now() - 300000) {
      password_hashed = usersdata.users[itemnum].password;
    } else {
      let password = await read({
        prompt: "Password: ",
        silent: true,
        replace: "•",
      });
      password_hashed = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64");
    }
    if (usersdata.users[itemnum].password == password_hashed) {
      if (cmd.find((item) => item[0] === arg.cmds[1])) {
        for (let i = 0; i < cmd.length; i++) {
          if (cmd[i][0] === arg.cmds[1]) {
            if (supercmds.includes(arg.cmds[1])) {
              lastsuper = Date.now();
              return await cmd[i][1](arg);
            } else {
              return '[ ERROR ] Command isn\'t allowed to use "super".';
            }
          }
        }
      }
    } else {
      ezout.error_nodebug("Incorrect password!");
    }
  }
  ezout.error_nodebug("Too many attempts!");
  return 0;
}

function clearscreen() {
  console.clear();
  return 0;
}

// shuts down
function shutdown() {
  console.log();
  ezout.info_nodebug("Shutting down");
  process.exit();
}

// just a testing command for in debug mode
function test() {
  return "wow its the test command";
}

// package manager (add later)
async function pacman(arg) {
  return "apk not yet created";
}

// directory system
// return directory contents
function contents(arg) {
  return "returns directory contents";
}

// log out
function exit() {
  return 126;
}

// [name, function]
let cmd = [
  ["echo", echo],
  ["exit", exit],
  ["quit", exit],
  ["system", system],
  ["clear", clearscreen],
  ["super", super_],
  ["contents", contents],
  ["ls", contents],
  ["dir", contents],
  ["shutdown", shutdown],
];

// add test command if in debug mode
// also add it so you can use it with super
if (debug.debug) {
  cmd.push(["test", test]);
  supercmds.push("test");
}

export { cmd };
