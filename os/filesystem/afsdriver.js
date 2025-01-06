// adyOS File System Driver

import * as fs from "fs";

function setdefault(username) {
  return "/home/" + username + "/";
}

function rewritepath(path, username) {
  if (typeof path !== "string") {
    throw new Error('Expected "path" to be a string, but got ' + typeof path);
  }

  let newpath = path.replace("/home/" + username, "~");
  return newpath;
}

async function getsystemname() {
  let file = await fs.promises.readFile("./os/filesystem/users.json");
  let json = await JSON.parse(Buffer.from(file));
  return json.sysname;
}

export { setdefault, rewritepath, getsystemname };
