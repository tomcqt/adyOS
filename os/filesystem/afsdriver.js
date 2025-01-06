// adyOS File System Driver

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

export { setdefault, rewritepath };
