import * as fs from "fs";
import * as afs from "../afsdriver.js";
import * as ezout from "../../ezout.js";
import * as childprocess from "child_process";

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
        ezout.error_nodebug("No such user!");
        return 0;
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
    ezout.error_nodebug("Argument not found!");
    return 0;
  } else {
    ezout.error_nodebug("Superuser access needed!");
    return 0;
  }
}

export default {
  func: system,
  name: "system",
  desc: [
    "System settings",
    "Requires `super`.",
  ],
  usage: "super system [info|locks|optional|users|update] [...]",
};
