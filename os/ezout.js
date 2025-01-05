// ezOut
// Info, Error, Alert, Etc. messages

function info(text) {
  console.log("[ INFO ] " + text);
}

function error(text) {
  console.log("[ ERROR ] " + text);
}

function working(text) {
  console.log("[ WORKING ] " + text);
}

function done(text) {
  console.log("[ DONE ] " + text);
}

export { info, error, working, done };
