import * as ezout from "../ezout.js";
import { read } from "read";
import * as crypto from "crypto";
import * as fs from "fs";
import * as debug from "../../debug.js";
import * as childprocess from "child_process";
import * as afs from "./afsdriver.js";
import * as https from "https";

// Exit Codes
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

// its echo!
function echo(arg) {
  arg.cmds.shift();
  return arg.cmds.join(" ");
}

// system settings basically
async function system(arg) {
  if (arg.cmds[0] == "super" || arg.cmds[0] == "sudo") {
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
      } else if (arg.cmds[3] == "user") {
        if (arg.cmds[4] == "timezone") {
          if (arg.cmds[5] == "get") {
            console.log("Current timezone: " + arg.sys.timezone.toString());
            return 0;
          } else if (arg.cmds[5] == "set") {
            return {
              output: "Set timezone. Please log out and log in to view.",
              userdata: {
                timezone: parseInt(arg.cmds[6]),
              },
            };
          }
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
                url: "https://raw.githubusercontent.com/tomcqt/adyos-default-repo/master/",
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
    } else if (arg.cmds[2] == "users") {
      let users = JSON.parse(fs.readFileSync("./os/filesystem/users.json"));
      let userindex = 0;
      users.users.forEach((i, j) => {
        if (i.username == arg.cmd.split('"')[1]) {
          userindex = j;
        }
      });
      let splitted = arg.cmd.split('"')[2].split(" ");
      ezout.info(arg.cmd.split('"'));
      ezout.info(splitted);
      if (userindex != 0) {
        if (splitted[1] == "super") {
          if (splitted[2] == "on") {
            users.users[userindex].sudo = true;
            fs.writeFileSync(
              "./os/filesystem/users.json",
              JSON.stringify(users)
            );
            return "Enabled Super for user.";
          } else if (splitted[2] == "off") {
            users.users[userindex].sudo = false;
            fs.writeFileSync(
              "./os/filesystem/users.json",
              JSON.stringify(users)
            );
            return "Disabled Super for user.";
          }
        }
      } else {
        return "[ ERROR ] No such user!";
      }
    } else if (arg.cmds[2] == "update") {
      console.log("Updating...");
      let process = childprocess.spawn("chmod +x os/filesystem/usr/update.sh", {
        cwd: ".",
        shell: true,
      });
      process.stdout.on("data", (data) => {
        console.log(data.toString());
      });
      await new Promise((resolve) => {
        process.on("close", resolve);
      });
      let process2 = childprocess.spawn("./os/filesystem/usr/update.sh", {
        cwd: ".",
        shell: true,
      });
      process2.stdout.on("data", (data) => {
        console.log(data.toString());
      });
      await new Promise((resolve) => {
        process2.on("close", resolve);
      });
      return "Please restart the OS to use the updated software.";
    }
    return "[ ERROR ] Argument not found!";
  } else {
    return "[ ERROR ] Superuser access needed!";
  }
}

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

// sudo
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

// clear screen
function clearscreen(arg) {
  console.clear();
  // awesome user info topbar
  ezout.inverted_text(
    ezout.center(
      `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`,
      true
    )
  ); // username @ systemname // on workspace workspace // adyos version X.X.X
  if (
    process.stdout.columns <
    `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`
      .length
  ) {
    console.clear();
    ezout.inverted_text(
      ezout.center(
        `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`.slice(
          0,
          process.stdout.columns - 3
        ) + "...",
        true
      )
    );
  }
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

  // create temp directory to save files if it doesnt already exist
  if (!fs.existsSync(afs.fsfix(arg.dir.home) + ".adypm/tmp")) {
    fs.mkdirSync(afs.fsfix(arg.dir.home) + ".adypm/tmp");
  }

  if (arg.cmds.length == 1) {
    console.log("AdyPM      - AdyOS Package Manager");
    console.log("+[package] - Install Package");
    console.log("-[package] - Uninstall Package");
    console.log("/[repo]    - Add Repository");
    console.log("\\[repo]    - Remove Repository");

    console.log("Also possible:");
    console.log("@ - Clear temporary files");
    return 0;
  } else {
    if (prompt.charAt(0) == "+") {
      let files = [];
      console.log("AdyPM (Package Install Mode)");
      let pkg = prompt.slice(1);

      ezout.working_nodebug("Updating cached repos");
      for (let item of repos.repos) {
        let num = Math.round(Math.random() * 99999999999999999999).toString();
        files.push(num);
        let file = fs.createWriteStream(
          afs.fsfix(arg.dir.home) + ".adypm/tmp/" + num + ".json"
        );
        let req = https.get(item.url + "adypm.json", (res) => {
          res.pipe(file);

          // after download completed close filestream
          file.on("finish", () => {
            file.close();
          });
        });
        await new Promise((resolve) => {
          file.on("finish", resolve);
        });
      }

      let real = [];

      files.forEach((item) => {
        ezout.info(item);

        let file = fs.readFileSync(
          afs.fsfix(arg.dir.home) + ".adypm/tmp/" + item + ".json",
          "utf-8"
        );

        if (JSON.parse(file).name) {
          real.push([
            afs.fsfix(arg.dir.home) + ".adypm/tmp/" + item + ".json",
            JSON.parse(file).name,
          ]);
        }
      });
      ezout.info(real);

      ezout.done_nodebug("Updating cached repos");

      let repo_with_pkg;
      for (let repo of real) {
        ezout.info_nodebug('Checking in "' + repo[1] + '"');
        let num = Math.round(Math.random() * 99999999999999999999).toString();
        let file = fs.createWriteStream(
          afs.fsfix(arg.dir.home) + ".adypm/tmp/" + num + ".json"
        );
        let req = https.get(item.url + "repos/pkg.json", (res) => {
          res.pipe(file);

          // after download completed close filestream
          file.on("finish", () => {
            file.close();
          });
        });
        await new Promise((resolve) => {
          file.on("finish", resolve);
        });
        let jsondata = JSON.parse(
          fs.readFileSync(
            afs.fsfix(arg.dir.home) + ".adypm/tmp/" + num + ".json"
          )
        );
        for (let package_ of jsondata.packages) {
          if (package_.folder == pkg) {
            repo_with_pkg = [...repo];
          }
        }
      }

      return 0;
    } else if (prompt.charAt(0) == "@") {
      console.log("AdyPM (Clear Cache Mode)");
      fs.rmSync(afs.fsfix(arg.dir.home) + ".adypm/tmp", {
        recursive: true,
      });
      ezout.info_nodebug("Cleared cache.");
      return 0;
    }
  }
  ezout.error_nodebug("Invalid syntax");
  return 0;
}

// directory system
// return directory contents
// contents
async function contents(arg) {
  ezout.info(arg.dir.path);
  let contents = await fs.promises.readdir("./os/filesystem" + arg.dir.path);
  let contents2 = [];
  ezout.info("Contents: " + contents);

  // remove hidden folders & files before anything happens
  contents.forEach((i, j) => {
    if (i.charAt(0) === ".") {
      contents.splice(j, 1);
    }
  });

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
      ezout.info(arg.dir.path);
      ezout.info(arg.cmds[1]);
      if (arg.dir.path == "/" && arg.cmds[1] == "users.json") {
        console.log("1: // nuh uh.");
      } else {
        fs.readFileSync(
          afs.fsfix(arg.dir.path) +
            (arg.cmds[1].charAt(1) == "/" ? arg.cmds[1].splice(1) : arg.cmds[1])
        )
          .toString()
          .split("\n")
          .forEach((i, j) => {
            console.log(`${j + 1}: ${i}`);
          });
      }
    } else {
      ezout.warn_nodebug("That is a directory, not a file.");
    }
  } else {
    ezout.error_nodebug("File doesn't exist.");
  }
  return 0;
}

// cd ..
function cdotdot(arg) {
  return cd(arg, true);
}

// delete
function recycle(arg) {
  if (arg.cmds[1] == "file") {
    fs.rmSync(afs.fsfix(arg.dir.path) + arg.cmds[2]);
  } else if (arg.cmds[1] == "folder") {
    if (fs.readdirSync(afs.fsfix(arg.dir.path) + arg.cmds[2]).length === 0) {
      fs.rmdirSync(afs.fsfix(arg.dir.path) + arg.cmds[2]);
    } else {
      ezout.error_nodebug("Folder is not empty.");
      return 0;
    }
  } else {
    ezout.warn_nodebug("Invalid syntax.");
    return 0;
  }
  return "Recycled " + arg.cmds[1] + " " + arg.cmds[2] + ".";
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

// write file
function write(arg) {
  if (arg.cmds[1] != "users.json" && arg.dir.path != "/") {
    let file = fs
      .readFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1])
      .toString()
      .split("\n");
    let text_to_write = [...arg.cmds];
    text_to_write.shift();
    text_to_write.shift();
    text_to_write.shift();
    if (file.length >= arg.cmds[2]) {
      file[arg.cmds[2] - 1] = text_to_write.join(" ");
    } else {
      for (let i = 0; i < arg.cmds[2] - file.length - 1; i++) {
        file.push("");
      }
      file.push(text_to_write.join(" "));
    }
    if (arg.cmds.length == 3) {
      file.splice(parseInt(arg.cmds[2] - 1), 1);
    }
    ezout.info(text_to_write.toString());
    fs.writeFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1], file.join("\n"));

    file.forEach((i, j) => {
      console.log(`${j + 1}: ${i}`);
    });
  } else {
    return "1: // nuh uh.";
  }

  return 0;
}

// append to file
function append(arg) {
  if (arg.cmds[1] != "users.json" && arg.dir.path != "/") {
    let file = fs
      .readFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1])
      .toString()
      .split("\n");
    let text_to_write = [...arg.cmds];
    text_to_write.shift();
    text_to_write.shift();
    text_to_write.shift();
    file.splice(arg.cmds[2] - 1, 0, text_to_write.join(" "));
    ezout.info(text_to_write.toString());
    fs.writeFileSync(afs.fsfix(arg.dir.path) + arg.cmds[1], file.join("\n"));

    file.forEach((i, j) => {
      console.log(`${j + 1}: ${i}`);
    });
  } else {
    return "1: // nuh uh.";
  }

  return 0;
}

// create new file/folder
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

// run js files!
async function run(arg) {
  console.log('Running file "' + arg.cmds[1] + '"...\n');
  ezout.info("node " + afs.fsfix(arg.dir.path) + arg.cmds[1]);
  let process = childprocess.spawn("node " + arg.cmds[1], {
    cwd: afs.fsfix(arg.dir.path),
    shell: true,
  });
  process.stdout.on("data", (data) => {
    console.log(data.toString());
  });
  await new Promise((resolve) => {
    process.on("close", resolve);
  });
  return 0;
}

// download files from the internet
async function download(arg) {
  if (arg.cmds.length === 3) {
    let file = fs.createWriteStream(afs.fsfix(arg.dir.path) + arg.cmds[2]);
    let req = https.get(arg.cmds[1], (res) => {
      res.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        console.log("Downloaded file.");
      });
    });

    await new Promise((resolve) => {
      file.on("finish", resolve);
    });
    return 0;
  } else {
    ezout.warn_nodebug("Invalid syntax.");
    return 0;
  }
}

// switch workspaces
function workspace(arg) {
  if (arg.cmds.length >= 2) {
    return "unimplemented!";
  } else {
    return 'adyOS Spaces\n\
\n\
Example Usage:\n\
spaces create [name] - Initialises a workspace called [name]\n\
spaces enter [name]  - Enters the workspace called [name]\n\
spaces leave         - Leaves the workspace you are in and goes to workspace "none"\n\
spaces delete [name] - Remove the workspace called [name]';
  }
}

// gets the time
function time(arg) {
  function formatdate(timezoneOffset) {
    const date = new Date();

    const time = date.getTime();

    const offset = arg.sys.timezone * 60 * 60 * 1000;
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
    `It is currently ${ezout.colours.bold}${formatdate(timezoneOffset)}${
      ezout.colours.reset
    } (UTC${timezoneOffset >= 0 ? "+" + timezoneOffset : timezoneOffset})\n`
  );
  return 0;
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
  ["sudo", super_],
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
  ["append", append],
  ["add", append],
  ["open", run],
  ["run", run],
  ["start", run],
  ["download", download],
  ["get", download],
  ["user", user],
  ["workspaces", workspace],
  ["workspace", workspace],
  ["ws", workspace],
  ["space", workspace],
  ["spaces", workspace],
  ["time", time],
  ["clock", time],
  ["date", time],
  ["gettime", time],
  ["getdate", time],
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
