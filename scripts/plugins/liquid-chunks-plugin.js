const path = require("path");
const fs = require("fs");
const paths = require("../utils/paths");

const PLUGIN_NAME = "LiquidChunksPlugin";

const chunkExpr = /^chunk-\S+\.js$/;

class LiquidChunksPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync(
      PLUGIN_NAME,
      async (_compilation, callback) => {
        const assetsFolder = path.join(paths.distFolder, "assets");
        const chunkSnippetFile = path.join(
          paths.distSnippetsFolder,
          "common-chunks-js.liquid"
        );
        const preloadSnippetFile = path.join(
          paths.distSnippetsFolder,
          "script-preloads.liquid"
        );

        const commonFiles = fs.readdirSync(assetsFolder).filter((x) => {
          return chunkExpr.test(x);
        });

        let preloads = [
          `<link rel="preload" href="{{ 'bundle.theme.css' | asset_url }}" as="style">`,
        ];

        // Save script preloads
        const jsPreloads = commonFiles.map((filename) => {
          return `<link rel="preload" href="{{ '${filename}' | asset_url }}" as="script">`;
        });

        jsPreloads.push(
          `<link rel="preload" href="{{ 'bundle.theme.js' | asset_url }}" as="script">`
        );

        preloads = preloads.concat(jsPreloads);
        fs.mkdirSync(paths.distSnippetsFolder, { recursive: true });
        fs.writeFileSync(preloadSnippetFile, preloads.join("\n"));

        // Save script includes
        const content = commonFiles
          .map((filename) => {
            return `<script src="{{ '${filename}' | asset_url }}" defer="defer"></script>`;
          })
          .join("\n");

        fs.mkdirSync(paths.distSnippetsFolder, { recursive: true });
        fs.writeFileSync(chunkSnippetFile, content);
        callback();
      }
    );
  }
}

module.exports = LiquidChunksPlugin;
