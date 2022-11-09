const fs = require("fs-extra");
const chalk = require("chalk");
const chokidar = require("chokidar");
const paths = require("../utils/paths");
const path = require("path");
const {
  transformSection,
  transformSettingsSchema,
} = require("./lib/transform-section");
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
    : srcFile.split(srcFolder + path.sep)[1];

  let isSectionTransform = false;

  if (folderName === "sections" && path.extname(srcFile) === ".yml") {
    isSectionTransform = true;
    partialPath = path.join(
      path.dirname(partialPath),
      path.basename(partialPath, ".yml") + ".liquid"
    );
  } else if (folderName === "sections" && path.basename(srcFile)[0] === "_") {
    isSectionTransform = true;
  }

  destFile = path.join(destPath, partialPath);

  if (mode === "REPLACE") {
    if (partialPath === "settings_schema.json") {
      destFile = transformSettingsSchema(srcFile, destFile);
    } else if (isSectionTransform) {
      destFile = transformSection(srcFile, destFile);
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

const getAllFilesRecursively = (folder, files = []) => {
  const dirFiles = fs.readdirSync(folder);

  for (f of dirFiles) {
    const fullPath = path.join(folder, f);
    if (fs.statSync(fullPath).isDirectory()) {
      files = getAllFilesRecursively(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
};

const copyFilesInFolder = (folderName, isDebug) => {
  const folderPath = path.join(paths.srcFolder, folderName);

  if (isDebug) {
    console.log(`[DEBUG] Copying folder: ${folderName}`);
    console.log(`[DEBUG] Folder path: ${folderPath}`);
  }

  const files = getAllFilesRecursively(folderPath);

  if (files.length === 0) {
    if (isDebug) {
      console.log("No matching files in folder.");
    }
  }

  for (let i = 0; i < files.length; i++) {
    if (isDebug) {
      console.log(` file: ${files[i]}`);
    }
    syncFileToOutput(folderName, files[i], "REPLACE", true);
  }
};

const syncFile = (config, filePath, mode) => {
  const localPath = filePath.split(paths.srcFolder + path.sep)[1];

  for (let folder of foldersToCopy) {
    const p = folder + path.sep;

    if (localPath.startsWith(p)) {
      console.log(chalk.blueBright(`[${mode}] ${localPath}`));
      const destFile = syncFileToOutput(folder, filePath, mode);
      const localDestFile = destFile.split(paths.distFolder)[1];
      themkitCli.syncFiles(config, [localDestFile]);
      return;
    }
  }

  throw new Error(`Could not sync file for: ${path}. Needs configuration`);
};

class TransformThemeFilesPLugin {
  constructor(config) {
    this.config = config;
  }

  apply(compiler) {
    const config = this.config;
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (_compilation) => {
      if (!isFirstCompile) {
        return;
      }

      if (config.isDebug) {
        console.log(
          chalk.bold.blueBright(`[DEBUG] Running plugin ${PLUGIN_NAME}`)
        );
      }

      isFirstCompile = false;

      // Copy folders
      for (const folder of foldersToCopy) {
        copyFilesInFolder(folder, config.isDebug);
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

      if (config.isDebug) {
        return;
      }

      watchesSetup = true;

      for (const folderName of foldersToCopy) {
        const folderPath = path.join(paths.srcFolder, folderName);
        chokidar
          .watch(folderPath)
          .on("change", (path) => syncFile(config, path, "REPLACE"))
          .on("unlink", (path) => syncFile(config, path, "DELETE"));
      }
    });
  }
}

module.exports = TransformThemeFilesPLugin;
