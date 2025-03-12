// cursor.js - get the cursor position
// code from https://stackoverflow.com/questions/71246585/nodejs-readlines-cursor-behavior-and-position

const getpos = () =>
  new Promise((resolve) => {
    const termcodes = { cursorGetPosition: "\u001b[6n" };

    process.stdin.setEncoding("utf8");
    process.stdin.setRawMode(true);

    const readfx = function () {
      const buf = process.stdin.read();
      const str = JSON.stringify(buf); // "\u001b[9;1R"
      const regex = /\[(.*)/g;
      const xy = regex.exec(str)[0].replace(/\[|R"/g, "").split(";");
      const pos = { rows: xy[0], cols: xy[1] };
      process.stdin.setRawMode(false);
      resolve(pos);
    };

    process.stdin.once("readable", readfx);
    process.stdout.write(termcodes.cursorGetPosition);
  });

export { getpos };
