import * as cmd from "../cmd.js";
import * as ezout from "../../ezout.js";

async function man(arg) {
  let version = "0.3b"; // this numbering is bullshit, why does it start at 0.3b
  let commands = await cmd.load(true);
  if (arg.cmds.length == 1) {
    console.log(
      `${ezout.colours.bold}adyOS Manual (version ${version})${ezout.colours.reset}`
    );
    console.log(`${commands.length} commands loaded!`);
    console.log(`Use \`manual manual\` for more information.`);
    return 0; // exit
  } else if (arg.cmds.length == 2) {
    console.log("aughhhhhhh");
    return 0;
  } else {
    ezout.error_nodebug("Invalid syntax!");
    return 0;
  }
  return 0; // just in case i did a stupid!!1!
}

export default {
  func: man,
  name: ["man", "manual", "help", "howto"],
  desc: "Gives you helpful information!",
  usage: "manual [command]",
};
