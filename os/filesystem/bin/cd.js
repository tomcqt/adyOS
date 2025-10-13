import * as fs from "fs";
import * as ezout from "../../ezout.js";
import * as afs from "../afsdriver.js";

// cd
function cd(arg, leave) {
  let goto;
  let final_path;
  if (!leave) {
    if (!arg.cmds[1]) {
      ezout.error_nodebug("CD requires 1 or more arguments");
      return 0;
    }
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

// cd ..
function cdotdot(arg) {
  return cd(arg, true);
}

export default [
  {
    func: cd,
    name: ["enter", "cd"],
    desc: "Change directory",
    usage: "enter [directory] | leave (view `manual leave` for details)",
  },
  {
    func: cdotdot,
    name: ["leave"],
    desc: "Go back one directory",
    usage: "leave",
  },
];
