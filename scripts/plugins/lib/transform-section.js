const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const YAML = require("yaml");
const paths = require("../../utils/paths");

const assertPartialName = (name) => {
  if (name[0] !== "_") {
    throw new Error(
      `Partial blocks or settings in schemas must start with an underscore (for: ${block})`
    );
  }
};

const readSchemaJSON = (schemaName) => {
  const schemaFile = path.join(paths.schemasFolder, schemaName + ".json");

  if (!fs.existsSync(schemaFile)) {
    throw new Error(`No schema exists for "${schemaFile}""`);
  }
  try {
    return JSON.parse(fs.readFileSync(schemaFile, "utf8"));
  } catch (err) {
    console.log(chalk.redBright(`ERROR: Failed to parse ${schemaName}.json`));
    throw `ERROR Failed to parse ${schemaName}.json => ${err.message}`;
    //throw err;
  }
};

const buildSchemaId = (id, prefix, suffix) => {
  let newId = prefix ? `${prefix}_${id}` : id;
  return newId + (suffix || "");
};

const buildLabel = (label, suffix) => {
  if (suffix) {
    return `${label} #${suffix}`;
  }
  return label;
};

const updateNames = (schema, prefix, suffix) => {
  if (schema.id) {
    schema.id = buildSchemaId(schema.id, prefix, suffix);
    schema.label = buildLabel(schema.label, suffix);
  } else if (schema.content) {
    schema.content = buildLabel(schema.content, suffix);
  }
  return schema;
};

const replaceSettings = (settings, prefix, suffix) => {
  let updatedSettings = [];

  settings.forEach((obj) => {
    // If it's an include we "flatten" the schema and only add the settings,
    // since it won't work if include object type information."
    if (typeof obj === "string") {
      let partialName = obj;

      if (obj.indexOf("#") !== -1) {
        [partialName, prefix, suffix] = obj.split("#");
      }

      assertPartialName(partialName);
      let schemaData = readSchemaJSON(partialName);
      schemaData.forEach((schema) => updateNames(schema, prefix, suffix));

      // Recursive
      const newSettings = replaceSettings(schemaData, prefix, suffix);
      updatedSettings = updatedSettings.concat(newSettings);
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

  try {
    // Replace all block settings if any
    replacedBlock.settings = replaceSettings(replacedBlock.settings);
  } catch (e) {
    throw e;
  }

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

const transformSection = (srcFile, destFile) => {
  const shortFileName = "src/" + srcFile.split("/src/")[1];
  console.log(chalk.blueBright(`Transforming yml to liquid: ${shortFileName}`));

  const content = fs.readFileSync(srcFile);
  const textContent = content.toString();
  const config = YAML.parse(textContent);

  if (!config.include) {
    throw new Error(`YML config needs an "include" value for: ${srcFile})`);
  }

  const sectionContents = [];
  const assigns = ["section: section"];

  if (config.assign_current_variant == true) {
    sectionContents.push("{% if product.selected_variant %}");
    sectionContents.push(
      "{%   assign current_variant = product.selected_variant %}"
    );
    sectionContents.push("{% else %}");
    sectionContents.push(
      "{%   assign current_variant = product.variants | first %}"
    );
    sectionContents.push("{% endif %}");
    assigns.push("current_variant: current_variant");
  } else if (config.assign_selected_variant == true) {
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

  try {
    sectionContents.push(buildSchema(config).trim());
  } catch (e) {
    console.error(
      "Caught error building schema for file %s => ",
      srcFile,
      config
    );
    throw e;
  }

  sectionContents.push("{% endschema %}\n");

  const liquidContent = sectionContents.join("\n");
  fs.outputFileSync(destFile, liquidContent);
};

module.exports = transformSection;
