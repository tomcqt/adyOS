import * as ezout from "../ezout.js";
import { read } from "read";
import * as crypto from "crypto";
import * as fs from "fs";
import * as debug from "../../debug.js";
import * as childprocess from "child_process";
import * as afs from "./afsdriver.js";

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
function dbg_test() {
  return "wow its the test command";
}

// package manager (add later)
async function pacman(arg) {
  return "apk not yet created";
}

// directory system
// return directory contents
async function contents(arg) {
  ezout.info(arg.dir.path);
  let contents = await fs.promises.readdir("./os/filesystem" + arg.dir.path);
  let contents2 = [];
  ezout.info("Contents: " + contents);

  console.log(
    "Contents of " +
      arg.dir.pathrw +
      ":" +
      (contents.length == 0 ? " (empty)" : "")
  );
  contents.forEach((item) => {
    ezout.info("Item: " + item);

    let type = fs.statSync("./os/filesystem" + arg.dir.path + item).isFile();
    contents2.push([item, type]);

    ezout.info(type);
  });
  ezout.info(contents2);
  let lsl /* longest string length */ = Math.max(
    ...contents2.map((el) => el[0].length)
  );
  contents2.forEach((item) => {
    console.log(
      item[0],
      " ".repeat(lsl - item[0].length) + (item[1] ? "File" : "Directory")
    );
  });

  ezout.info("Contents length: " + contents.length);
  ezout.info("Contents 2 length: " + contents2.length);

  return 0;
}

// cd
function cd(arg) {
  let goto = arg.cmds[1].split("/").filter((i) => {
    return i !== "" && i !== "." && i !== ".." && i !== "~";
  });
  ezout.info(goto);
  let final_path;
  if (arg.cmds[1].charAt(0) === "~") {
    final_path = afs.setdefault(arg.usr.username);
  } else if (arg.cmds[1].charAt(0) === "/") {
    final_path = "";
  } else if ([arg.cmds[1].charAt(0), arg.cmds[1].charAt(1)].join("") === "..") {
    let ps /* path split */ = arg.dir.path.split("/");
    ezout.info(ps);
    if (ps[ps.length - 1] === "") {
      ps.pop();
    }
    ps.pop();
    ezout.info(ps);
    final_path = ps.join("/");
    ezout.info(final_path);
  } else {
    final_path = arg.dir.path;
  }
  final_path = "./os/filesystem" + final_path;

  goto.forEach((i) => {
    let sync;
    if (fs.existsSync(final_path + i + "/")) {
      sync = fs.statSync(final_path + i + "/");
    } else {
      ezout.error_nodebug("No such file or directory: " + i);
      return 0;
    }
    if (sync.isFile()) {
      ezout.error_nodebug("Not a directory: " + i);
      return 0;
    } else {
      final_path += i;
      final_path += "/";
    }
  });

  /* add slash just in case */
  if (!final_path.endsWith("/")) {
    final_path += "/";
  }

  ezout.info("fp:" + final_path);
  return {
    output: "Went to " + afs.rewritepath(final_path, arg.usr.username),
    directory: final_path.replace("./os/filesystem", ""),
  };
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
  ["enter", cd],
  ["cd", cd],
];

// add debug commands if in debug mode
// also add it so you can use it with super
if (debug.debug) {
  cmd.push(["test", dbg_test]);
  supercmds.push("test");
}

export { cmd };
