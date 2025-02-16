// DEBUG MODE
let debug = false;
// DEBUG MODE

// AUTO COMMAND
let autocmd = {
  on: false,
  command: "adypm +asdf",
  user: {
    username: "tomcat",
    password: "guilford",
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
