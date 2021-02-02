const path = require("path");

// Folders
const root = path.resolve(process.cwd());
const srcFolder = path.resolve(root, "src");
const distFolder = path.resolve(root, "dist");

module.exports = {
  // The root of the client caller directory
  root: root,

  // Source folders
  srcFolder: srcFolder,
  scriptsFolder: path.resolve(srcFolder, "scripts"),
  jsFolder: path.resolve(srcFolder, "js"),
  cssFolder: path.resolve(srcFolder, "css"),
  includesFolder: path.resolve(srcFolder, "includes"),
  schemasFolder: path.resolve(srcFolder, "schemas"),

  // Remove this from webpack soon (duplicate of abnove)
  //scriptIncludesFolder: path.resolve(srcFolder, 'includes'),

  // Build+dist folders
  distFolder: distFolder,

  // Bundles
  themeBundleJs: path.resolve(srcFolder, "js", "theme.js"),
};
