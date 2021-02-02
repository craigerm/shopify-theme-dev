#!/usr/bin/env node

"use-strict";

const chalk = require("chalk");

process.on("unhandledRejection", (err) => {
  console.log(chalk.redBright("Unexpected error!"));
  throw err;
});

const spawn = require("cross-spawn");
const args = process.argv.slice(2);
const cmd = args[0];

if (["start", "build"].indexOf(cmd) == -1) {
  console.log(`Command "${cmd}" not supported.`);
  process.exit(1);
}

const script = require.resolve(`../scripts/${cmd}.js`);

const result = spawn.sync(process.execPath, [script], { stdio: "inherit" });
//  process.execPath,
//  nodeArgs
//    .concat(require.resolve(`../scripts/${cmd}.js`))
//    .concat(args.slice(scriptIndex + 1)),
//  { stdio: "inherit" }
//);

if (result.signal) {
  console.log("Spawning script failed for some reason.");
  process.exit(0);
}

process.exit(result.status);
