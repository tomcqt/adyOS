import * as ezout from "../../ezout.js";

// shuts down
function shutdown() {
  console.log();
  ezout.info_nodebug("Shutting down");
  process.exit();
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

export default [
  {
    func: power,
    name: "power",
    desc: "Power off the system",
    usage: "power [off|sign out]",
  },
  {
    func: shutdown,
    name: "shutdown",
    desc: "Shut down the system",
    usage: "shutdown",
  },
];
