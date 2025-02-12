// DEBUG MODE
let debug = false;
// DEBUG MODE

// autocmd
let autocmd = {
  on: true,
  command: "adypm +asdf",
  user: {
    username: "tomcat",
    password: "guilford",
  },
};
// autocmd

// Debug mode can also be enabled by using `npm run debug`

if (process.argv.includes("--debug-mode-enabled")) {
  debug = true;
}
if (process.argv.includes("--autocmd")) {
  autocmd.on = true;
}

export { debug, autocmd };
