// adyOS File System Driver

async function setdefault(username) {
  return "/home/" + username + "/";
}

async function rewritepath(path, username) {
  return path.replace("/home/" + username, "~");
}

export { setdefault, rewritepath };
