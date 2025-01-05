// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";
import * as ezout from "./../../ezout.js";
import * as fs from "fs";

async function show() {
  let exists, allowed;

  ezout.working("Checking for users file");

  try {
    await fs.promises.access("./os/filesystem/users.json"); // remember to look from the root dir
    exists = true;
  } catch (error) {
    exists = false;
  }

  ezout.done("Checking for users file");

  // console.log(exists);

  if (exists) {
    ezout.info('"users.json" exists.');

    ezout.working("Reading for users");

    let usersdata = JSON.parse(
      Buffer.from(
        await fs.promises.readFile("./os/filesystem/users.json")
      ).toString()
    );

    ezout.done("Reading for users");

    if (usersdata.users == []) {
      allowed = [false, true];
    } else {
      allowed = [true, true];
    }
  } else {
    ezout.error('"users.json" not found.');

    // create users.json

    ezout.working("Writing default users file");

    await fs.promises.writeFile(
      "./os/filesystem/users.json",
      JSON.stringify({
        users: [],
      })
    );

    ezout.done("Writing default users file");

    allowed = [false, true];
  }

  ezout.info("Starting login screen");

  return {};
}

export { show };
