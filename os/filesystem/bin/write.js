import * as fs from "fs";
import * as afs from "../afsdriver.js";
import * as ezout from "../../ezout.js";

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

export default {
  func: write,
  name: ["write"],
  desc: "Writes to a file.",
  usage: "write [file name] [line number] [text...]",
};
