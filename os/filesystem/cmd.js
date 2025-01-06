import * as ezout from "../ezout.js";

function echo(cmd, cmds) {
  cmds.shift();
  return cmds.join(" ");
}

function system(cmd, cmds, usr) {
  let username = usr.username;
  return { output: username, userdata: usr };
}

function clearscreen(cmd, cmds) {
  console.clear();
  return;
}

function quit(cmd, cmds) {
  console.log();
  ezout.info_nodebug("Shutting down");
  process.exit();
}

// 1: [name, function, flags]
// flags: [flags needed, async or not, user data needed]
let cmd = [
  ["echo", echo, [false]],
  ["exit", quit, [false]],
  ["quit", quit, [false]],
  ["system", system, [true, false, true]],
  ["clear", clearscreen, [false]],
];

export { echo, cmd };
