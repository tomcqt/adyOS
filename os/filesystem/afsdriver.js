// adyOS File System Driver

async function setdefault(username) {
  return "/usr/" + username + "/fs/home/";
}

export { setdefault };
