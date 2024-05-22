const chalk = require("chalk");
const ShopifyAPI = require("./shopify-api");

const h = chalk.yellow;
const e = chalk.bold.red;
const i = chalk.bold.white;

module.exports = async (config) => {
  const theme = await ShopifyAPI.getTheme(config, config.themeId);
  const shop = await ShopifyAPI.getShop(config);

  if (!theme) {
    console.log(e`[ERROR] Could not find matching theme id: ${config.themeId}`);
    console.log(i(`Config: ${config.themekitEnv}`));
    console.log(i(`Store: ${config.store}`));
    process.exit(1);
  }

  const previewURL = `http://${shop.domain}/?preview_theme_id=${theme.id}`;

  console.log(h("*************************************************"));
  console.log(h(`Theme: ${theme.name}`));
  console.log(h(`ID: ${config.themeId}`));
  console.log(h(`Config: ${config.themekitEnv}`));
  console.log(h(`Store: ${config.store}`));
  console.log(h(`Preview URL: ${previewURL}`));
  console.log(h("*************************************************"));
};
