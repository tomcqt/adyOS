// ezOut
// Info, Error, Alert, Etc. messages

import * as debug from "../debug.js";

function info(text) {
  if (debug.debug == true) {
    console.log(
      `[ ${ezout.colours.bold + ezout.colours.blue}INFO ${
        ezout.colours.reset
      }] ` + text
    );
  }
}

function error(text) {
  if (debug.debug == true) {
    console.log(
      `[ ${ezout.colours.bold + ezout.colours.red}ERROR${
        ezout.colours.reset
      } ] ` + text
    );
  }
}

function warn(text) {
  if (debug.debug == true) {
    console.log(
      `[ ${ezout.colours.bold + ezout.colours.yellow}WARN${
        ezout.colours.reset
      } ] ` + text
    );
  }
}

function working(text) {
  if (debug.debug == true) {
    console.log(
      `[ ${ezout.colours.bold + ezout.colours.magenta}WORKING${
        ezout.colours.reset
      } ] ` + text
    );
  }
}

function done(text) {
  if (debug.debug == true) {
    console.log(
      `[ ${ezout.colours.bold + ezout.colours.green}DONE${
        ezout.colours.reset
      } ] ` + text
    );
  }
}

function info_nodebug(text) {
  console.log(
    `[ ${ezout.colours.bold + ezout.colours.blue}INFO ${
      ezout.colours.reset
    }] ` + text
  );
}

function error_nodebug(text) {
  console.log(
    `[ ${ezout.colours.bold + ezout.colours.red}ERROR${
      ezout.colours.reset
    } ] ` + text
  );
}

function warn_nodebug(text) {
  console.log(
    `[ ${ezout.colours.bold + ezout.colours.yellow}WARN${
      ezout.colours.reset
    } ] ` + text
  );
}

function working_nodebug(text) {
  console.log(
    `[ ${ezout.colours.bold + ezout.colours.magenta}WORKING${
      ezout.colours.reset
    } ] ` + text
  );
}

function done_nodebug(text) {
  console.log(
    `[ ${ezout.colours.bold + ezout.colours.green}DONE${
      ezout.colours.reset
    } ] ` + text
  );
}

function inverted_text(text) {
  console.log(`\x1b[7m${text}\n\x1b[0m`, "");
}

function center(text, fill) {
  const width = process.stdout.columns || 80; // Default to 80 if undefined
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return " ".repeat(padding) + text + (fill ? " ".repeat(padding) : "");
}

// colours!
const colours = {
  reset: "\x1b[0m", // Reset all styles

  // Text styles
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  underline: "\x1b[4m",
  blink: "\x1b[5m",
  inverse: "\x1b[7m", // Inverted colors
  hidden: "\x1b[8m",
  strikethrough: "\x1b[9m",

  // Text colors (foreground)
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
  bgGray: "\x1b[100m",
  bgBrightRed: "\x1b[101m",
  bgBrightGreen: "\x1b[102m",
  bgBrightYellow: "\x1b[103m",
  bgBrightBlue: "\x1b[104m",
  bgBrightMagenta: "\x1b[105m",
  bgBrightCyan: "\x1b[106m",
  bgBrightWhite: "\x1b[107m",
};

export {
  info,
  error,
  warn,
  working,
  done,
  info_nodebug,
  error_nodebug,
  warn_nodebug,
  working_nodebug,
  done_nodebug,
  inverted_text,
  center,
  colours,
};
