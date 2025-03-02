// ezOut
// Info, Error, Alert, Etc. messages

import * as debug from "../debug.js";

function info(text) {
  if (debug.debug == true) {
    console.log("[ INFO ] " + text);
  }
}

function error(text) {
  if (debug.debug == true) {
    console.log("[ ERROR ] " + text);
  }
}

function warn(text) {
  if (debug.debug == true) {
    console.log("[ WARN ] " + text);
  }
}

function working(text) {
  if (debug.debug == true) {
    console.log("[ WORKING ] " + text);
  }
}

function done(text) {
  if (debug.debug == true) {
    console.log("[ DONE ] " + text);
  }
}

function info_nodebug(text) {
  console.log("[ INFO ] " + text);
}

function error_nodebug(text) {
  console.log("[ ERROR ] " + text);
}

function warn_nodebug(text) {
  console.log("[ WARN ] " + text);
}

function working_nodebug(text) {
  console.log("[ WORKING ] " + text);
}

function done_nodebug(text) {
  console.log("[ DONE ] " + text);
}

function inverted_text(text) {
  console.log(`\x1b[7m${text}\n\x1b[0m`, "");
}

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
};
