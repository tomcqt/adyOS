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

    try {
      usersdata = JSON.parse(
        Buffer.from(
          await fs.promises.readFile("./os/filesystem/users.json")
        ).toString()
      );
    } catch (error) {
      usersdata = {};
    }

    ezout.done("Reading for users");

    ezout.info(JSON.stringify(usersdata).length);

    if (JSON.stringify(usersdata).length < 20) {
      allowed = [false, true];
      if (usersdata.signuplocked == true) {
        ezout.error_nodebug("Can't do anything! (No users and sign up locked)");
        q = await wfi.asks("Nuke user info? (y/N) $ ");
        if (q.toLowerCase() == "y") {
          ezout.warn_nodebug("Nuking users.json");
          await fs.promises.unlink("./os/filesystem/users.json");
          ezout.info_nodebug("Nuked users file, shutting down.");
          process.exit();
        } else {
          ezout.info_nodebug("Shutting down");
          process.exit();
        }
      } else {
        ezout.working("Writing default users file");

        await fs.promises.writeFile(
          "./os/filesystem/users.json",
          JSON.stringify({
            users: [],
            signuplocked: false,
            superlocked: false,
            sysname: "adyos",
          })
        );

        ezout.done("Writing default users file");

        usersdata = JSON.parse(
          Buffer.from(
            await fs.promises.readFile("./os/filesystem/users.json")
          ).toString()
        );
      }
    } else {
      if (usersdata.signuplocked == false) {
        allowed = [true, true];
      } else {
        allowed = [true, false];
      }
    }
  } else {
    ezout.error_nodebug('"users.json" not found.');

    // create users.json

    ezout.working("Writing default users file");

    await fs.promises.writeFile(
      "./os/filesystem/users.json",
      JSON.stringify({
        users: [],
        signuplocked: false,
        superlocked: false,
        sysname: "adyos",
      })
    );

    ezout.done("Writing default users file");

    usersdata = JSON.parse(
      Buffer.from(
        await fs.promises.readFile("./os/filesystem/users.json")
      ).toString()
    );

    allowed = [false, true];
  }

  ezout.info("Starting login screen");

  while (1 == 1) {
    if (!debug.debug) {
      console.clear();
    }

    let login, signup;

    if (allowed[0]) {
      login = "L. log in";
    } else {
      login = "L. disabled (log in)";
    }
    if (allowed[1]) {
      signup = "S. sign up";
    } else {
      signup = "S. disabled (sign up)";
    }

    let text = `   ┓  ┏┓┏┓ ${login}
┏┓┏┫┓┏┃┃┗┓ ${signup}
┗┻┗┻┗┫┗┛┗┛ Q. quit
     ┛    
choose then press enter`;

    console.log(text);
    q = await read({
      prompt: "",
      silent: true,
      replace: "",
    });

    if (q.toLowerCase() == "l" && allowed[0]) {
      // login screen

      while (1 == 1) {
        console.log();
        let username = await wfi.asks("Username: ");
        let password = await read({
          prompt: "Password: ",
          silent: true,
          replace: "•",
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
          ezout.error_nodebug("Account doesn't exist!");
          await delay.wait(1000);
        } else {
          if (usersdata.users[itemnum].password == password_hashed) {
            ezout.info("Logged in as " + username);
            ezout.done("Checking for account");
            ezout.done("Logging in");
            return username;
          } else {
            ezout.error_nodebug("Incorrect password!");
            await delay.wait(1000);
          }
        }
        ezout.done("Checking for account");
        ezout.done("Logging in");
        console.log();
        break;
      }
    } else if (q.toLowerCase() == "s" && allowed[1]) {
      // signup screen

      let pwdout;
      console.log();
      let username;
      while (true) {
        username = await wfi.asks("Username: ");
        if ((username.length <= 16 && username.length >= 3) || debug.debug) {
          break;
        } else {
          ezout.warn_nodebug(
            "Your username is the wrong size! It must be between 3 and 16 characters long."
          );
          await delay.wait(1000);
        }
      }

      let dont_continue = false;

      usersdata.users.forEach(async function (item) {
        if (item.username == username) {
          dont_continue = true;
          ezout.error_nodebug("Account already exists!");
        }
      });

      ezout.info(dont_continue);

      if (dont_continue === false) {
        while (1 == 1) {
          let password = await read({
            prompt: "Password: ",
            silent: true,
            replace: "•",
          });
          let password2 = await read({
            prompt: "Repeat password: ",
            silent: true,
            replace: "•",
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
            ezout.error_nodebug("Passwords do not match!");
            await delay.wait(1000);
            if (debug.debug) {
              console.log();
            }
          }
        }

        let question;
        if (!usersdata.superlocked && !debug.debug) {
          question = await wfi.asks('Allow "super" access? (y/N) ');
        } else {
          question = "n";
        }

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

        ezout.working("Creating home directory");

        let dir =
          "./os/filesystem/home/" +
          (
            username.replace(/[^a-z0-9]/gi, "") +
            btoa(username).replace(/[^a-z0-9]/gi, "")
          ).toLowerCase();

        if (!fs.existsSync(dir)) {
          await fs.promises.mkdir(dir);
        } else {
          ezout.warn("Home directory already exists!");
        }
        ezout.done("Creating home directory");

        console.log();
        ezout.info_nodebug("Account created!");
        console.log();

        allowed = [true, true];
      } else if (debug.debug) {
        console.log("what the sigma?");
      }
      await delay.wait(1000);
    } else if (q.toLowerCase() == "l" && !allowed[0]) {
      ezout.warn_nodebug("That option is disabled.");
      await delay.wait(1000);
    } else if (q.toLowerCase() == "s" && !allowed[1]) {
      ezout.warn_nodebug("That option is disabled.");
      await delay.wait(1000);
    } else if (q.toLowerCase() == "q") {
      ezout.info_nodebug("Quitting");
      process.exit();
    } else {
      ezout.warn_nodebug("That isn't an option!");
      await delay.wait(1000);
    }
  }
}

export { show };
