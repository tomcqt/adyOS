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
    } else if (arg.cmds[2] == "locks") {
      if (arg.cmds[3] == "super") {
        if (arg.cmds[4] == "on") {
          // lock super
          let json = JSON.parse(fs.readFileSync(afs.fsfix("users.json")));
          json.superlocked = true;
          fs.writeFileSync(afs.fsfix("users.json"), JSON.stringify(json));
          ezout.info_nodebug("Locked super at signup.");
          return 0;
        } else if (arg.cmds[4] == "off") {
          // unlock super
          let json = JSON.parse(fs.readFileSync(afs.fsfix("users.json")));
          json.superlocked = false;
          fs.writeFileSync(afs.fsfix("users.json"), JSON.stringify(json));
          ezout.info_nodebug("Unlocked super at signup.");
          return 0;
        }
      } else if (arg.cmds[3] == "signup") {
        if (arg.cmds[4] == "on") {
          // lock signup
          let json = JSON.parse(fs.readFileSync(afs.fsfix("users.json")));
          json.signuplocked = true;
          fs.writeFileSync(afs.fsfix("users.json"), JSON.stringify(json));
          ezout.info_nodebug("Locked signup.");
          return 0;
        } else if (arg.cmds[4] == "off") {
          // unlock signup
          let json = JSON.parse(fs.readFileSync(afs.fsfix("users.json")));
          json.signuplocked = false;
          fs.writeFileSync(afs.fsfix("users.json"), JSON.stringify(json));
          ezout.info_nodebug("Locked signup.");
          return 0;
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
function cd(arg, leave) {
  let goto;
  let final_path;
  if (!leave) {
    goto = arg.cmds[1].split("/").filter((i) => {
      return i !== "" && i !== "." && i !== ".." && i !== "~";
    });
    ezout.info(goto);
    if (arg.cmds[1].charAt(0) === "~") {
      final_path = afs.setdefault(arg.usr.username);
    } else if (arg.cmds[1].charAt(0) === "/") {
      final_path = "";
    } else if (
      [arg.cmds[1].charAt(0), arg.cmds[1].charAt(1)].join("") === ".."
    ) {
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
  } else {
    let ps = arg.dir.path.split("/");
    ezout.info(ps);
    if (ps[ps.length - 1] === "") {
      ps.pop();
    }
    ps.pop();
    ezout.info(ps);
    final_path = ps.join("/");
    ezout.info(final_path);
  }
  final_path = "./os/filesystem" + final_path;

  if (!leave) {
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
  }

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

// read and output file
function read_(arg) {
  if (fs.existsSync(afs.fsfix(arg.dir.path) + arg.cmds[1])) {
    if (fs.statSync(afs.fsfix(arg.dir.path + arg.cmds[1])).isFile()) {
      if (arg.dir.path != "/" && arg.cmds[1] != "users.json") {
        fs.readFileSync(
          afs.fsfix(arg.dir.path) +
            (arg.cmds[1].charAt(1) == "/" ? arg.cmds[1].splice(1) : arg.cmds[1])
        )
          .toString()
          .split("\n")
          .forEach((i, j) => {
            console.log(`${j + 1}: ${i}`);
          });
      } else {
        console.log("1: // nuh uh.");
      }
    } else {
      ezout.warn_nodebug("That is a directory, not a file.");
    }
  } else {
    ezout.error_nodebug("File doesn't exist.");
  }
  return 0;
}

function cdotdot(arg) {
  return cd(arg, true);
}

// delete
function recycle(arg) {
  if (arg.cmds[1] == "file") {
    fs.rmSync(afs.fsfix(arg.dir.path) + arg.cmds[2]);
  } else if (arg.cmds[1] == "folder") {
    fs.rmdirSync(afs.fsfix(arg.dir.path) + arg.cmds[2]);
  } else {
    ezout.warn_nodebug("Invalid syntax.");
    return 0;
  }
  return "Deleted " + arg.cmds[1] + " " + arg.cmds[2] + ".";
}

// power off
function power(arg) {
  if (arg.cmds[1] == "off") {
    console.log();
    ezout.info_nodebug("Shutting down");
    process.exit();
  } else if (arg.cmds[1] == "sign" && arg.cmds[2] == "out") {
    return 126;
  } else {
    ezout.warn_nodebug("Incorrect syntax.");
    return 0;
  }
}

// write
function write(arg) {
  let file = fs
    .readFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1])
    .toString()
    .split("\n");
  let text_to_write = [...arg.cmds];
  text_to_write.shift();
  text_to_write.shift();
  text_to_write.shift();
  if (arg.cmds.length == 3) {
    file.splice(parseInt(arg.cmds[2]), 1);
  }
  if (file.length >= arg.cmds[2]) {
    file[arg.cmds[2] - 1] = text_to_write.join(" ");
  } else {
    for (let i = 0; i < arg.cmds[2] - file.length - 1; i++) {
      file.push("");
    }
    file.push(text_to_write.join(" "));
  }
  ezout.info(text_to_write.toString());
  fs.writeFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1], file.join("\n"));

  file.forEach((i, j) => {
    console.log(`${j + 1}: ${i}`);
  });

  return 0;
}

function create(arg) {
  if (arg.cmds[1] == "file") {
    fs.writeFileSync(afs.fsfix(arg.dir.path) + arg.cmds[2], "");
  } else if (arg.cmds[1] == "folder") {
    fs.mkdirSync(afs.fsfix(arg.dir.path) + arg.cmds[2]);
  } else {
    ezout.warn_nodebug("Incorrect syntax.");
    return 0;
  }
  return "Created new " + arg.cmds[1] + " called " + arg.cmds[2] + ".";
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
  ["erase", clearscreen],
  ["clear", clearscreen],
  ["super", super_],
  ["contents", contents],
  ["ls", contents],
  ["dir", contents],
  ["shutdown", shutdown],
  ["power", power],
  ["enter", cd],
  ["cd", cd],
  ["leave", cdotdot],
  ["read", read_],
  ["cat", read_],
  ["recycle", recycle],
  ["delete", recycle],
  ["remove", recycle],
  ["del", recycle],
  ["rm", recycle],
  ["write", write],
  ["create", create],
  ["new", create],
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
