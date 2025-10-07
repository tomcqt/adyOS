// just a testing command for in debug mode
function dbg_test() {
  return "wow its the test command";
}

export default {
  func: dbg_test,
  name: "test",
  desc: "A test command (debug only)",
  usage: "test",
};
