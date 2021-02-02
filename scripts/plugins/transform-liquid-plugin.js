const fs = require("fs");
const YAML = require("yaml");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const paths = require("../utils/paths");

const buildSchema = ({ title, schema }) => {
  const schemaFile = paths.schemasFolder + "/" + schema + ".json";

  if (!fs.existsSync(schemaFile)) {
    throw new Error(`No schema exists for "${schemaFile}""`);
  }

  let schemaContents = fs.readFileSync(schemaFile, "utf8");
  schemaContents = schemaContents.replace("$PAGE_TITLE", title);
  return schemaContents;
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

    const sectionContents = [
      `{% include '${config.include}', section: section %}`,
    ];

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
