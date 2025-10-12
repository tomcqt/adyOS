import * as cmd from "../cmd.js";
import * as ezout from "../../ezout.js";

async function man(arg) {
  let version = "0.3b"; // this numbering is bullshit, why does it start at 0.3b
  let commands = await cmd.load(true);
  if (arg.cmds.length == 1) {
    console.log(
      `${ezout.colours.bold}adyOS Manual (version ${version})${ezout.colours.reset}`
    );
    console.log(`${Object.keys(commands).length} commands loaded!`);
    console.log(`Use \`manual manual\` for more information.`);
    return 0; // exit
  } else if (arg.cmds.length == 2) {
    const commandName = arg.cmds[1];
    if (commands.hasOwnProperty(commandName)) {
      console.log(
        `\n${ezout.colours.bold}adyOS Manual - ${ezout.colours.cyan}${commandName}${ezout.colours.reset}`
      );
      console.log(
        `Aliases: ${ezout.colours.bold}${
          Array.isArray(commands[commandName].name)
            ? commands[commandName].name.join(
                `${ezout.colours.reset}, ${ezout.colours.bold}`
              )
            : commands[commandName].name
        }${ezout.colours.reset}`
      );
      console.log(
        `Usage: ${ezout.colours.bold}${commands[commandName].usage}${ezout.colours.reset}\n`
      );
      console.log(`\n${commands[commandName].desc}`);
    } else {
      ezout.warn_nodebug("Command not found!");
      return 0;
    }
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
