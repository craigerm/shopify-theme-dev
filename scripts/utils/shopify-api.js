const fetch = require("node-fetch");
const API_VERSION = "2022-07";

const fetchData = async (config, verb, path) => {
  const url = `https://${config.store}/admin/api/${API_VERSION}/${path}.json`;
  const options = {
    method: verb,
    headers: {
      "content-type": "application/json",
      "x-shopify-access-token": config.password,
    },
  };

  const response = await fetch(url, options);

  if (response.status === 404) {
    return null;
  }

  if (response.status < 200 || response.status > 299) {
    console.log("Error body:", await response.text());
    throw new Error(`Fetch failed with status ${response.status} for: ${url}`);
  }

  return await response.json();
};

const getTheme = async (config, themeId) => {
  const data = await fetchData(config, "GET", `themes/${themeId}`);
  return data ? data.theme : null;
};

module.exports = {
  getTheme,
};
