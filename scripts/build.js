// Set these before loading anything
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const createCompiler = require("./utils/create-compiler");
const config = require("./utils/config");

createCompiler(config);
