import * as ezout from "../../ezout.js";
import * as fs from "fs";
import * as crypto from "crypto";
import { read } from "read";
import * as cmd from "../cmd.js";

// this had to get rewritten, also a bit of acr got rewritten to support new system
async function super_(arg) {
  const commands = await cmd.load();
  ezout.info(arg.lastsuper);
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
    ezout.error_nodebug("Super is not allowed for this account!");
    return 0;
  }
  for (let i = 0; i < 3; i++) {
    let password_hashed;
    if (arg.lastsuper > Date.now() - 300000) {
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
      if (commands.hasOwnProperty(arg.cmds[1])) {
        if (commands[arg.cmds[1]].flags && commands[arg.cmds[1]].flags.super) {
          let output = await commands[arg.cmds[1]].func(arg);
          return {
            ...output,
            lastsuper: Date.now(),
          };
        } else {
          ezout.error_nodebug('Command isn\'t allowed to use "super".');
          return 0;
        }
      } else {
        ezout.error_nodebug("Command not found!");
        return 0;
      }
    } else {
      ezout.error_nodebug("Incorrect password!");
    }
    // if (usersdata.users[itemnum].password == password_hashed) {
    //   if (cmd.find((item) => item[0] === arg.cmds[1])) {
    //     for (let i = 0; i < cmd.length; i++) {
    //       if (cmd[i][0] === arg.cmds[1]) {
    //         if (supercmds.includes(arg.cmds[1])) {
    //           lastsuper = Date.now();
    //           return await cmd[i][1](arg);
    //         } else {
    //           ezout.error_nodebug('Command isn\'t allowed to use "super".');
    //           return 0;
    //         }
    //       }
    //     }
    //   }
    // } else {
    //   ezout.error_nodebug("Incorrect password!");
    // }
  }
  ezout.error_nodebug("Too many attempts!");
  return 0;
}

export default {
  func: super_,
  name: ["super", "sudo"],
  description: "Execute a command with superuser privileges",
  usage: "sudo [command] [args...]",
};
