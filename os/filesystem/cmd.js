import * as ezout from "../ezout.js";
import { read } from "read";
import * as crypto from "crypto";
import * as fs from "fs";
import * as debug from "../../debug.js";
import * as childprocess from "child_process";
import * as afs from "./afsdriver.js";
import * as https from "https";

// Exit Codes:
// 0 - output nothing
// 126 - log out

let lastsuper = 0;
let supercmds = ["system"];

function internal_update_opt_json() {
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
          if (arg.cmds[5] == "adypm") {
            if (!optional.commands.apk) {
              optional.commands.apk = true;
              cmd.push(["adypm", pacman]);

              // add directory if doesnt exist
              if (
                !fs.existsSync(
                  afs.fsfix(afs.getdefault(arg.usr.username) + ".adypm")
                )
              ) {
                fs.mkdirSync(
                  afs.fsfix(afs.getdefault(arg.usr.username) + ".adypm")
                );
              }

              // create repos.json if doesnt exist
              if (
                !fs.existsSync(
                  afs.fsfix(
                    afs.getdefault(arg.usr.username) + ".adypm/repos.json"
                  )
                )
              ) {
                fs.writeFileSync(
                  afs.fsfix(
                    afs.getdefault(arg.usr.username) + ".adypm/repos.json"
                  ),
                  JSON.stringify({ repos: [] })
                );
              }

              // write default repo

              let repos = JSON.parse(
                fs.readFileSync(
                  afs.fsfix(
                    afs.getdefault(arg.usr.username) + ".adypm/repos.json"
                  )
                )
              );
              repos.repos.push({
                name: "main",
                url: "https://raw.tomcat.sh/adyos-default-repo/master/",
              });

              fs.writeFileSync(
                afs.fsfix(
                  afs.getdefault(arg.usr.username) + ".adypm/repos.json"
                ),
                JSON.stringify(repos)
              );

              internal_update_opt_json();

              ezout.info_nodebug("Enabled AdyPM.");
              return 0;
            } else {
              ezout.info_nodebug("AdyPM already enabed.");
              return 0;
            }
          }
        } else if (arg.cmds[4] == "remove") {
          if (arg.cmds[5] == "adypm") {
            if (optional.commands.apk) {
              optional.commands.apk = false;
              cmd.forEach((item, index) => {
                if (item[0] == "adypm") {
                  cmd.splice(index, 1);
                }
              });

              // remove directory
              fs.rmSync(
                afs.fsfix(afs.getdefault(arg.usr.username) + ".adypm"),
                {
                  recursive: true,
                }
              );

              internal_update_opt_json();

              ezout.info_nodebug("Disabled AdyPM.");
              return 0;
            } else {
              ezout.info_nodebug("AdyPM already disabled.");
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

// package manager
async function pacman(arg) {
  let prompt = arg.cmds[1];
  let repos = JSON.parse(
    fs.readFileSync(
      afs.fsfix(afs.getdefault(arg.usr.username) + ".adypm/repos.json")
    )
  );
  if (arg.cmds.length == 1) {
    console.log("AdyPM      - AdyOS Package Manager");
    console.log("+[package] - Install Package");
    console.log("-[package] - Uninstall Package");
    console.log("/[repo]    - Add Repository");
    console.log("\\[repo]    - Remove Repository");
    return 0;
  } else {
    if (prompt.charAt(0) == "+") {
      console.log("AdyPM (Package Install Mode)");
      let pkg = prompt.slice(1);
      ezout.working_nodebug("Checking repos...");
      repos.repos.forEach((item, index) => {
        let code;

        https.get(item.url + "adypm.json", (res) => {
          res.on("end", () => {
            code = res.statusCode;
          });
        });

        ezout.info(code);
      });
    }
  }
  ezout.error_nodebug("Invalid syntax");
  return 0;
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

// add optional commands if they are enabled in /sys/opt.json
if (optional.commands.apk) {
  cmd.push(["adypm", pacman]);
}

export { cmd };
