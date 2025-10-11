import * as ezout from "../../ezout.js";

// clear screen
function clearscreen(arg) {
  console.clear();
  // awesome user info topbar
  console.log(
    ezout.inverted_text(
      ezout.center(
        `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`,
        true
      )
    )
  ); // username @ systemname // on workspace workspace // adyos version X.X.X
  if (
    process.stdout.columns <
    `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`
      .length
  ) {
    console.clear();
    console.log(
      ezout.inverted_text(
        ezout.center(
          `${arg.usr.username} @ ${arg.usr.systemname} // on workspace ${arg.sys.workspace} // running adyos version ${arg.sys.version}`.slice(
            0,
            process.stdout.columns - 3
          ) + "...",
          true
        )
      )
    );
  }
  return 0;
}

export default {
  func: clearscreen,
  name: ["clear", "erase", "cls"],
  desc: "Clears the screen",
  usage: "clear",
};
