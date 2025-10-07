// its echo!
function echo(arg) {
  arg.cmds.shift();
  return arg.cmds.join(" ");
}

export default {
  func: echo,
  name: "echo",
  desc: "Display a line of text",
  usage: "echo [string ...]",
};
