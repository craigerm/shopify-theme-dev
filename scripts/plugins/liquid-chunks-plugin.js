const path = require("path");
const fs = require("fs");
const paths = require("../utils/paths");

const PLUGIN_NAME = "LiquidChunksPlugin";
const chunkPrefix = "common-chunk-";

const chunkExpr = /^common-chunk-\S+\.js$/;

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

        const commonFiles = fs.readdirSync(assetsFolder).filter((x) => {
          return chunkExpr.test(x);
        });

        console.log(commonFiles);

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
