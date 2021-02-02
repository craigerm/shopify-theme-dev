const createCompiler = require("./utils/create-compiler");
const config = require("./utils/config");

process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
createCompiler(config);

//const chalk = require("chalk");
//console.log(chalk.cyanBright("IT LOADED CHALK"));
//console.log("HELLO WORLD");
