// Login Screen

import * as wfi from "./../../../custom_modules/wfi.js";
import * as ezout from "./../../ezout.js";
import * as delay from "./../../../custom_modules/delay.js";
import * as debug from "../../../debug.js";
import { read } from "read";
import * as fs from "fs";
import * as crypto from "crypto";

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

  let usersdata;
  let done;

  if (exists) {
    ezout.info('"users.json" exists.');

    ezout.working("Reading for users");

    usersdata = JSON.parse(
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

  while (1 == 1) {
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

    q = await wfi.asks("> ");

    if (q == "1" && allowed[0]) {
      // login screen

      while (1 == 1) {
        console.log();
        let username = await wfi.asks("Username: ");
        let password = await read({
          prompt: "Password: ",
          silent: true,
          replace: "#",
        });
        ezout.working("Logging in");
        ezout.working("Hashing password");
        let password_hashed = crypto
          .createHash("sha256")
          .update(password)
          .digest("base64");
        ezout.done("Hashing password");
        ezout.working("Checking for account");
        let itemnum;
        usersdata.users.forEach((item, index) => {
          if (item.username == username) {
            itemnum = index;
          }
        });
        if (itemnum == null) {
          ezout.error("Account doesn't exist!");
        } else {
          if (usersdata.users[itemnum].password == password_hashed) {
            ezout.info("Logged in as " + username);
            ezout.done("Checking for account");
            ezout.done("Logging in");
            return username;
          } else {
            ezout.error("Incorrect password!");
          }
        }
        ezout.done("Checking for account");
        ezout.done("Logging in");
        console.log();
        break;
      }
    } else if (q == "2" && allowed[1]) {
      // signup screen

      let pwdout;
      console.log();
      let username = await wfi.asks("Username: ");
      while (1 == 1) {
        let password = await read({
          prompt: "Password: ",
          silent: true,
          replace: "#",
        });
        let password2 = await read({
          prompt: "Repeat password: ",
          silent: true,
          replace: "#",
        });

        if (debug.debug) {
          console.log();
        }
        ezout.working("Verifying password");
        if (password == password2) {
          ezout.done("Verifying password");
          ezout.info("Password verified");
          pwdout = password;
          if (debug.debug) {
            console.log();
          }
          break;
        } else {
          ezout.done("Verifying password");
          ezout.warn("Passwords do not match!");
          if (debug.debug) {
            console.log();
          }
        }
      }

      let question = await wfi.asks('Allow "super" access? (y/N) ');

      let sudo;
      if (question.toLowerCase() == "y") {
        sudo = true;
      } else {
        sudo = false;
      }

      ezout.working("Hashing password");
      let password_hashed = crypto
        .createHash("sha256")
        .update(pwdout)
        .digest("base64");
      ezout.done("Hashing password");

      ezout.working("Writing to memory");
      usersdata.users.push({
        username: username,
        password: password_hashed,
        sudo: sudo,
      });
      ezout.done("Writing to memory");

      ezout.working("Writing to file");
      await fs.promises.writeFile(
        "./os/filesystem/users.json",
        JSON.stringify(usersdata)
      );
      ezout.done("Writing to file");

      console.log();
      ezout.info_nodebug("Account created!");
      console.log();
    } else if (q == "1" && !allowed[0]) {
      ezout.warn_nodebug("That option is disabled.");
    } else if (q == "2" && !allowed[1]) {
      ezout.warn_nodebug("That option is disabled.");
    } else if (q == "q") {
      ezout.info_nodebug("Quitting");
      process.exit();
    } else {
      ezout.warn_nodebug("That isn't an option!");
    }
  }
}

export { show };
