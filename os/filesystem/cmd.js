function echo(cmd, cmds) {
  cmds.shift();
  return cmds.join(" ");
}

function system(cmd, cmds, usr) {
  return usr;
}

function quit(cmd, cmds) {
  process.exit();
}

// 1: [name, function, flags]
// flags: [flags needed, async or not, user data needed]
let cmd = [
  ["echo", echo, [false]],
  ["exit", quit, [false]],
  ["quit", quit, [false]],
  ["system", system, [true, false, true]],
];

export { echo, cmd };
