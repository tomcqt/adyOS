import * as fs from "fs";
import * as ezout from "../../ezout.js";
import { read } from "read";
import * as crypto from "crypto";

// user settings (doesnt need super)
async function user(arg) {
  let dat = JSON.parse(fs.readFileSync("./os/filesystem/users.json"));

  let index = -1;
  dat.users.forEach((i, j) => {
    if (i.username == arg.usr.username) {
      index = j;
    }
  });

  ezout.info("index:" + index);
  ezout.info("username:" + arg.usr.username);

  let usr;
  if (index == -1) {
    return "You don't exist. I have no idea how you did this.";
  } else {
    usr = dat.users[index];
  }

  if (arg.cmds[1] == "password") {
    let pwd = await read({
      prompt: "Password: ",
      silent: true,
      replace: "•",
    });
    let hash = crypto.createHash("sha256").update(pwd).digest("base64");
    dat.users[index].password = hash;
    fs.writeFileSync("./os/filesystem/users.json", JSON.stringify(dat));
    return "Changed password.";
  }
  ezout.warn_nodebug("Incorrect syntax.");
  return 0;
}

export default {
  func: user,
  name: "user",
  desc: "User settings",
  usage: "user [password|...]",
};
