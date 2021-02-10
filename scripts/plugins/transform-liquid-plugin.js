const fs = require("fs");
const chalk = require("chalk");
const YAML = require("yaml");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const paths = require("../utils/paths");

const assertPartialName = (name) => {
  if (name[0] !== "_") {
    throw new Error(
      `Partial blocks or settings in schemas must start with an underscore (for: ${block})`
    );
  }
};

const readSchemaJSON = (schemaName) => {
  const schemaFile = paths.schemasFolder + "/" + schemaName + ".json";
  if (!fs.existsSync(schemaFile)) {
    throw new Error(`No schema exists for "${schemaFile}""`);
  }
  try {
    return JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  } catch (err) {
    console.log(chalk.redBright(`ERROR: Failed to parse ${schemaName}.json`));
    throw err;
  }
};

const replaceSettings = (settings) => {
  let updatedSettings = [];

  settings.forEach((obj) => {
    // If it's an include we "flatten" the schema and only add the settings,
    // since it won't work if include object type information."
    if (typeof obj === "string") {
      assertPartialName(obj);
      const schemaData = readSchemaJSON(obj);
      updatedSettings = updatedSettings.concat(schemaData);
      return;
    }

    if (typeof obj !== "object") {
      throw new Error(
        `Settings must be an array of objects or partial strings, like "_image-list"`
      );
    }
    updatedSettings.push(obj);
  });

  return updatedSettings;
};

// If block is a string, like "_image-list"
// it will be treated as a partial and load the schema as needed.
const replaceBlock = (block) => {
  let replacedBlock = block;

  if (typeof replacedBlock === "string") {
    assertPartialName(replacedBlock);
    replacedBlock = readSchemaJSON(block);
  }

  if (typeof replacedBlock !== "object") {
    throw new Error(
      `Block must be an object or a partial string, like "_image-list"`
    );
  }

  // Replace all block settings if any
  replacedBlock.settings = replaceSettings(replacedBlock.settings);

  return replacedBlock;
};

const buildSchema = ({ title, schema, merge }) => {
  let json = readSchemaJSON(schema);

  // Replace the schema name
  json.name = title;

  // Replace all the blocks if partials are used
  if (json.blocks) {
    json.blocks = json.blocks.map(replaceBlock);
  }

  if (json.settings) {
    json.settings = replaceSettings(json.settings);
  }

  if (merge) {
    const related = readSchemaJSON(merge);

    // If include is just an array, then treat them
    // as settings.
    if (Array.isArray(related)) {
      related.settings = related;
      related.blocks = [];
    }

    if (related.settings && related.settings.length > 0) {
      const relatedSettings = replaceSettings(related.settings);
      json.settings = json.settings.concat(relatedSettings);
    }

    if (related.blocks && related.blocks.length > 0) {
      const relatedBlocks = related.blocks.map(replaceBlock);
      json.blocks = (json.blocks || []).concat(relatedBlocks);
    }
  }

  return JSON.stringify(json, null, 2);
};

const transformSections = (content, absoluteFrom) => {
  if (absoluteFrom.endsWith(".yml")) {
    const shortFileName = "src/" + absoluteFrom.split("/src/")[1];
    console.log(`Transforming yml to liquid ("${shortFileName}")`);

    const textContent = content.toString();
    const config = YAML.parse(textContent);

    if (!config.include) {
      throw new Error(
        `YML config needs an "include" value for: ${absoluteFrom})`
      );
    }

    const sectionContents = [];
    const assigns = ["section: section"];

    if (config.assign_selected_variant == true) {
      sectionContents.push(
        "{% assign selected_variant = product.selected_or_first_available_variant %}"
      );
      assigns.push("selected_variant: selected_variant");
    }

    if (config.assign_product == true) {
      assigns.push("product: product");
    }

    if (config.assign_collection == true) {
      assigns.push("collection: collection");
    }

    sectionContents.push(
      `{% include '${config.include}', ${assigns.join(", ")} %}`
    );

    sectionContents.push("{% schema %}");
    sectionContents.push(buildSchema(config).trim());
    sectionContents.push("{% endschema %}\n");

    return sectionContents.join("\n");
  }
  return content;
};

const foldersToCopy = [
  { name: "config" },
  { name: "layout" },
  { name: "locales" },
  { name: "templates" },
  { name: "snippets" },
  {
    name: "sections",
    transform: transformSections,
    to: "sections/[path][name].liquid",
  },
  {
    // Flatten assets
    from: paths.srcFolder + "/assets/**/*",
    to: paths.distFolder + "/assets/[name].[ext]",
  },
].map((folder) => {
  return {
    from: folder.from || paths.srcFolder + "/" + folder.name,
    to: folder.to || paths.distFolder + "/" + folder.name,
    transform: folder.transform,
  };
});

// Copy the config file to our dist folder
foldersToCopy.push("config.yml");

module.exports = () => {
  return new CopyWebpackPlugin({ patterns: foldersToCopy });
};
