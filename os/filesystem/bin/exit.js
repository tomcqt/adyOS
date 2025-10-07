// log out
function exit() {
  return 126;
}

export default {
  func: exit,
  name: ["exit", "quit"],
  desc: "Log out of the system",
  usage: "exit",
};
