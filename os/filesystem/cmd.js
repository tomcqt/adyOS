import * as ezout from "../ezout.js";
import { read } from "read";
import * as crypto from "crypto";
import * as fs from "fs";
import * as debug from "../../debug.js";

let lastsuper = 0;
let supercmds = ["system"];

function echo(cmd, cmds) {
  cmds.shift();
  return cmds.join(" ");
}

function system(cmd, cmds, usr) {
  if (cmds[0] == "super") {
    if (cmds[2] == "info") {
      if (cmds[3] == "name") {
        if (cmds[4] == "get") {
          return { output: usr.systemname, userdata: usr };
        } else if (cmds[4] == "set") {
          return {
            output: "Set systemname to " + (cmds[5] == "." ? "adyos" : cmds[5]),
            userdata: {
              username: usr.username,
              systemname: cmds[5] == "." ? "adyos" : cmds[5],
            },
          };
        } else {
          return {
            output: "[ ERROR ] Argument does not exist!",
            userdata: {
              username: usr.username,
              systemname: usr.systemname,
            },
          };
        }
      } else {
        return {
          output: "[ ERROR ] Argument does not exist!",
          userdata: {
            username: usr.username,
            systemname: usr.systemname,
          },
        };
      }
    } else {
      return {
        output: "[ ERROR ] Argument does not exist!",
        userdata: {
          username: usr.username,
          systemname: usr.systemname,
        },
      };
    }
  } else {
    return {
      output: "[ ERROR ] Superuser access needed!",
      userdata: {
        username: usr.username,
        systemname: usr.systemname,
      },
    };
  }
}

async function super_(cmd_, cmds, usr) {
  ezout.info(lastsuper);
  let usersdata = JSON.parse(
    Buffer.from(
      await fs.promises.readFile("./os/filesystem/users.json")
    ).toString()
  );
  let itemnum;
  usersdata.users.forEach((item, index) => {
    if (item.username == usr.username) {
      itemnum = index;
    }
  });
  if (!usersdata.users[itemnum].sudo) {
    return "[ ERROR ] Super is not allowed for this account!";
  }
  for (let i = 0; i < 3; i++) {
    let password = await read({
      prompt: "Password: ",
      silent: true,
      replace: "•",
    });
    let password_hashed = crypto
      .createHash("sha256")
      .update(password)
      .digest("base64");
    let date = Date.now();
    if (lastsuper > date - 300000) {
      // check if the last authentication was within 5 minutes ago
      return await cmd[i][1](cmd_, cmds, usr);
    } else if (usersdata.users[itemnum].password == password_hashed) {
      if (cmd.find((item) => item[0] === cmds[1])) {
        for (let i = 0; i < cmd.length; i++) {
          if (cmd[i][0] === cmds[1]) {
            if (supercmds.includes(cmds[1])) {
              lastsuper = Date.now();
              let out = await cmd[i][1](cmd_, cmds, JSON.parse(usr));
              if (typeof out == "string") {
                return {
                  output: out,
                  userdata: JSON.parse(usr),
                };
              } else {
                return out;
              }
            } else {
              return {
                output: '[ ERROR ] Command isn\'t allowed to use "super".',
                userdata: JSON.parse(usr),
              };
            }
          }
        }
      }
    } else {
      ezout.error_nodebug("Incorrect password!");
    }
  }
  ezout.error_nodebug("Too many attempts!");
  return {
    output: "",
    userdata: JSON.parse(usr),
  };
}

function clearscreen(cmd, cmds) {
  console.clear();
  return "";
}

function quit(cmd, cmds) {
  console.log();
  ezout.info_nodebug("Shutting down");
  process.exit();
}

async function test(cmd, cmds, usr) {
  cmds.shift();
  return {
    output: ["wow its the test command", cmd, cmds],
    userdata: JSON.parse(usr),
    hello: "from the test command",
  };
}
// 1: [name, function, flags]
// flags: [flags needed, async or not, user data needed]
let cmd = [
  ["echo", echo, [false]],
  ["exit", quit, [false]],
  ["quit", quit, [false]],
  ["system", system, [true, false, true]],
  ["clear", clearscreen, [false]],
  ["super", super_, [true, true, true]],
];

// add test command if in debug mode
// also add it so you can use it with super
if (debug.debug) {
  cmd.push(["test", test, [false]]);
  supercmds.push("test");
}

export { cmd };
