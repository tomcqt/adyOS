// DEBUG MODE
let debug = false;
// DEBUG MODE

// AUTO COMMAND
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

// Debug mode can also be enabled by using `npm run debug`

if (process.argv.includes("--debug-mode-enabled")) {
  debug = true;
}
if (process.argv.includes("--autocmd")) {
  autocmd.on = true;
}

export { debug, autocmd };
