// DEBUG MODE
let debug = false;
// DEBUG MODE

// Debug mode can also be enabled by using `npm run debug`

if (process.argv.includes("--debug-mode-enabled")) {
  debug = true;
}
export { debug };
