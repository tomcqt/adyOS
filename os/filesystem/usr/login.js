// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";
import * as ezout from "./../../ezout.js";
import * as delay from "./../../../custom_modules/delay.js";
import * as fs from "fs";

async function show() {
  let exists, allowed, q;

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

    if (usersdata.users.length == 0) {
      allowed = [false, true];
      if (usersdata.signuplocked == true) {
        ezout.error("Can't do anything! (No users and sign up locked)");
        q = await wfi.asks("Nuke user info? (y/N) $ ");
        if (q.toLowerCase() == "y") {
          ezout.warn("Nuking users.json");
          await fs.promises.unlink("./os/filesystem/users.json");
          ezout.info("Nuked users file, shutting down.");
          process.exit();
        } else {
          ezout.info("Shutting down");
          process.exit();
        }
      }
    } else {
      if (usersdata.signuplocked == false) {
        allowed = [true, true];
      } else {
        allowed = [true, false];
      }
    }
  } else {
    ezout.error('"users.json" not found.');

    // create users.json

    ezout.working("Writing default users file");

    await fs.promises.writeFile(
      "./os/filesystem/users.json",
      JSON.stringify({
        users: [],
        signuplocked: false,
      })
    );

    ezout.done("Writing default users file");

    allowed = [false, true];
  }

  ezout.info("Starting login screen");

  console.log();
  if (allowed[0]) {
    console.log("1. Log in");
  } else {
    console.log("1. Disabled (Log in)");
  }
  if (allowed[1]) {
    console.log("2. Sign up");
  } else {
    console.log("2. Disabled (Sign up)");
  }
  console.log("q. Quit");

  while (1 == 1) {
    q = await wfi.asks("> ");

    if (q == "1" && allowed[0]) {
      ezout.warn("Login screen doesn't exist yet!");
    } else if (q == "2" && allowed[1]) {
      // signup screen
      console.log();
      let username = await wfi.asks("Username: ");
      while (1 == 1) {
        let password = await wfi.passwd("Password: ");
        let password2 = await wfi.passwd("Repeat password: ");

        ezout.working("Verifying password");
        if (password == password2) {
          ezout.done("Verifying password");
          ezout.info("Password verified");
          break;
        } else {
          ezout.done("Verifying password");
          ezout.warn("Passwords do not match!");
        }
      }
    } else if (q == "1" && !allowed[0]) {
      ezout.warn("That option is disabled.");
    } else if (q == "2" && !allowed[1]) {
      ezout.warn("That option is disabled.");
    } else if (q == "q") {
      ezout.info("Quitting");
      process.exit();
    } else {
      ezout.warn("That isn't an option!");
    }
  }
}

export { show };
