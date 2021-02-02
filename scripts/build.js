const createCompiler = require("./utils/create-compiler");
const config = require("./utils/config");

process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";
createCompiler(config);
