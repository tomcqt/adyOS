// Debug: Force debug mode while running the normal boot script
let debug = false; // true: Enabled - false: Disabled

// AutoCommand: Lets you run commands automatically for testing purposes.
let autocmd = {
  on: false, // set this to true if you want to use it
  command: "", // add the command you want to run here
  user: {
    //
    username: "", // add account username here
    password: "", // add account password here
  },
};
// AUTO COMMAND

// No Panic: Disables the panic screen while in debug mode.
let nopanic = false; // true: Sends usual Node.JS errors - false: Use adyOS panics

// Debug mode can also be enabled by using `npm run debug` or `./bin/debug` if on Linux
// That function is handled by this code
if (process.argv.includes("--debug-mode-enabled")) {
  debug = true;
}
if (process.argv.includes("--autocmd")) {
  autocmd.on = true;
}
if (process.argv.includes("--no-panic")) {
  nopanic = true;
}

export { debug, autocmd, nopanic };
