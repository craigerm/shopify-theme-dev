const fs = require("fs-extra");
const chalk = require("chalk");
const glob = require("glob");
const chokidar = require("chokidar");
const paths = require("../utils/paths");
const path = require("path");
const transformSection = require("./lib/transform-section");
const themkitCli = require("./lib/themkit-cli");

const PLUGIN_NAME = "TransformThemeFilesPlugin";

let isFirstCompile = true;
let watchesSetup = false;

const foldersToCopy = [
  "assets",
  "config",
  "layout",
  "locales",
  "templates",
  "snippets",
  "sections",
];

const syncFileToOutput = (folderName, srcFile, mode, errorOnExist = false) => {
  const destPath = path.join(paths.distFolder, folderName);
  const srcFolder = path.join(paths.srcFolder, folderName);

  // We always flatten unless it is templates folder.
  const shouldFlatten = folderName !== "templates";

  let partialPath = shouldFlatten
    ? path.basename(srcFile)
    : srcFile.split(srcFolder + "/")[1];

  const isSectionTransform =
    folderName === "sections" && path.extname(srcFile) === ".yml";

  if (isSectionTransform) {
    partialPath = path.join(
      path.dirname(partialPath),
      path.basename(partialPath, ".yml") + ".liquid"
    );
  }

  destFile = path.join(destPath, partialPath);

  if (mode === "REPLACE") {
    if (isSectionTransform) {
      transformSection(srcFile, destFile);
    } else {
      fs.copySync(srcFile, destFile, { errorOnExist: errorOnExist });
    }
    return destFile;
  }

  if (mode === "DELETE") {
    fs.removeSync(destFile);
    return destFile;
  }
  throw new Error(`Sync file mode '${mode}' not supported`);
};

const copyFilesInFolder = (folderName, isDebug) => {
  if (isDebug) {
    console.log(`[DEBUG] Copying folder: ${folderName}`);
  }

  const folderPath = path.join(paths.srcFolder, folderName);
  const files = glob.sync(folderPath + "/**/*", { nodir: true });

  for (let i = 0; i < files.length; i++) {
    if (isDebug) {
      console.log(` file: ${files[i]}`);
    }
    syncFileToOutput(folderName, files[i], "REPLACE", true);
  }
};

const syncFile = (filePath, mode) => {
  const localPath = filePath.split(paths.srcFolder + "/")[1];

  for (let folder of foldersToCopy) {
    const p = folder + "/";

    if (localPath.startsWith(p)) {
      console.log(chalk.blueBright(`[${mode}] ${localPath}`));
      const destFile = syncFileToOutput(folder, filePath, mode);
      const localDestFile = destFile.split(paths.distFolder)[1];
      themkitCli.syncFiles([localDestFile]);
      return;
    }
  }

  throw new Error(`Could not sync file for: ${path}. Needs configuration`);
};

class TransformThemeFilesPLugin {
  constructor(isDebug) {
    this.isDebug = isDebug;
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (_compilation) => {
      if (!isFirstCompile) {
        return;
      }

      if (this.isDebug) {
        console.log(
          chalk.bold.blueBright(`[DEBUG] Running plugin ${PLUGIN_NAME}`)
        );
      }

      isFirstCompile = false;

      // Copy folders
      for (const folder of foldersToCopy) {
        copyFilesInFolder(folder, this.isDebug);
      }

      // Copy config file
      const srcConfig = path.join(paths.root, "config.yml");
      const destConfig = path.join(paths.distFolder, "config.yml");
      fs.copySync(srcConfig, destConfig);
    });

    compiler.hooks.afterCompile.tap(PLUGIN_NAME, (_compilation) => {
      if (watchesSetup) {
        return;
      }

      watchesSetup = true;

      for (const folderName of foldersToCopy) {
        const folderPath = path.join(paths.srcFolder, folderName);
        chokidar
          .watch(folderPath)
          .on("change", (path) => syncFile(path, "REPLACE"))
          .on("unlink", (path) => syncFile(path, "DELETE"));
      }
    });
  }
}

module.exports = TransformThemeFilesPLugin;
