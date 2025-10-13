import * as fs from "fs";
import * as afs from "../afsdriver.js";
import * as ezout from "../../ezout.js";

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

export default {
  func: recycle,
  name: ["recycle", "delete", "remove", "del", "rm"],
  desc: "Deletes a file or folder.",
  usage: "recycle [file|folder] [name]",
};
