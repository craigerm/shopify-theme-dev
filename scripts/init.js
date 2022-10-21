"use-strict";
console.log("Running script init");

const fs = require("fs-extra");
const spawn = require("cross-spawn");
const clone = require("git-clone/promise");
const path = require("path");
const paths = require("./utils/paths");
const { root } = require("postcss");
const args = process.argv.slice(2);
const name = args[0] || "";

const REPO_URL = "https://github.com/Shopify/dawn.git";

if (!name) {
  console.error("You must pass in name of project, etc.");
  process.exit(1);
}

const rootFolder = path.join(process.cwd(), name);

const srcFolder = path.join(rootFolder, "src");

console.log("Creating project", name);

const removeDir = (path) => {
  fs.remove(path);
};

const removeFile = (path) => {
  fs.remove(path);
};

const copyFile = (src, dest) => {
  fs.copySync(src, dest);
};

if (fs.existsSync(name)) {
  console.log(`Folder "${name} already exists, aborting.`);
  process.exit(1);
}

const runCommand = (command) => {
  const result = spawn.sync(command, {
    stdio: "inherit",
  });

  if (result.signal) {
    console.log(`Exec command failed: ${command}`);
    process.exit(0);
  }
};

const writeContentsToFile = (dest, contents) => {
  fs.outputFileSync(dest, contents);
};

const initialSetup = async () => {
  if (fs.existsSync(name)) {
    console.log(`Folder "${name} already exists, aborting.`);
    process.exit(1);
  }
  fs.mkdirSync(name);
  fs.mkdirSync("dist");
};

const downloadShopifyTheme = async () => {
  clone(REPO_URL, srcFolder);
  removeDir(path.join(srcFolder, ".git"));
  removeDir(path.join(srcFolder, ".github"));
  removeDir(path.join(srcFolder, ".vscode"));
  removeFile(path.join(srcFolder, ".gitignore"));
  removeFile(path.join(srcFolder, ".theme-check.yml"));
  removeFile(path.join(srcFolder, "LICENSE.md"));
  removeFile(path.join(srcFolder, "README.md"));
  removeFile(path.join(srcFolder, "release-notes.md"));
  removeFile(path.join(srcFolder, "translation.yml"));
};

const copyTemplate = (destDir, templateName, vars = {}, options = {}) => {
  const destFile = path.join(destDir, options.outputAs || templateName);
  const srcFile = path.join(__dirname, "templates", templateName);

  if (Object.keys(vars).length === 0) {
    copyFile(srcFile, destFile);
    return;
  }
  writeContentsToFile(outputFile);
};

const copyTemplates = async () => {
  copyTemplate(rootFolder, "gitignore", {}, { outputAs: ".gitignore" });
  copyTemplate(rootFolder, "babel.config.json");
  copyTemplate(rootFolder, "themekit_ignores");
  copyTemplate(rootFolder, "tool-versions");
  copyTemplate(rootFolder, "config.yml");
  copyTemplate(path.join(rootFolder, "test"), "sample.test.js");
};

(async function () {
  await initialSetup();
  await downloadShopifyTheme();
  await copyTemplates();
})();
