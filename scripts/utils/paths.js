const path = require("path");

const isTest = process.env.NODE_ENV == "test";

// Folders
const root = path.resolve(process.cwd());
const srcFolder = path.resolve(root, isTest ? "test" : "src");
const distFolder = path.resolve(root, "dist");

module.exports = {
  // The root of the client caller directory
  root: root,

  // Source folders
  srcFolder: srcFolder,
  scriptsFolder: path.resolve(srcFolder, "scripts"),
  scriptsFolder: path.resolve(srcFolder, "scripts"),
  jsFolder: path.resolve(srcFolder, "js"),
  cssFolder: path.resolve(srcFolder, "css"),
  includesFolder: path.resolve(srcFolder, "includes"),
  schemasFolder: path.resolve(srcFolder, "schemas"),

  // Remove this from webpack soon (duplicate of abnove)
  //scriptIncludesFolder: path.resolve(srcFolder, 'includes'),

  // Build+dist folders
  distFolder: distFolder,
  distSnippetsFolder: path.resolve(distFolder, "snippets"),

  // Bundles
  themeBundleJs: path.resolve(srcFolder, "js", "theme.js"),
};
