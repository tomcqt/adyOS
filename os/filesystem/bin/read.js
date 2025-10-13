import * as fs from "fs";
import * as afs from "../afsdriver.js";
import * as ezout from "../../ezout.js";

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

export default {
  func: read_,
  name: ["read", "cat"],
  desc: "Reads out a file.",
  usage: "read [file name]",
};
