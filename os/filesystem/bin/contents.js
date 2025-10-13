import * as ezout from "../../ezout.js";
import * as fs from "fs";

// directory system
// return directory contents
// contents
async function contents(arg) {
  ezout.info(arg.dir.path);
  let contents = await fs.promises.readdir("./os/filesystem" + arg.dir.path);
  let contents2 = [];
  ezout.info("Contents: " + contents);

  // remove hidden folders & files before anything happens
  contents.forEach((i, j) => {
    if (i.charAt(0) === ".") {
      contents.splice(j, 1);
    }
  });

  console.log(
    "Contents of " +
      arg.dir.pathrw +
      ":" +
      (contents.length == 0 ? " (empty)" : "")
  );
  contents.forEach((item) => {
    ezout.info("Item: " + item);

    let type = fs.statSync("./os/filesystem" + arg.dir.path + item).isFile();
    contents2.push([item, type]);

    ezout.info(type);
  });
  ezout.info(contents2);
  let lsl /* longest string length */ = Math.max(
    ...contents2.map((el) => el[0].length)
  );
  contents2.forEach((item) => {
    console.log(
      item[0],
      " ".repeat(lsl - item[0].length) + (item[1] ? "File" : "Directory")
    );
  });

  ezout.info("Contents length: " + contents.length);
  ezout.info("Contents 2 length: " + contents2.length);

  return 0;
}

export default {
  func: contents,
  name: ["contents", "ls", "dir"],
  description: "List the contents of a directory",
  usage: "contents",
};
