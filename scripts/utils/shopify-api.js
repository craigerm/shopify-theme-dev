const fetch = require("node-fetch");
const API_VERSION = "2022-07";

const fetchData = async (config, verb, path, params) => {
  let url = `https://${config.store}/admin/api/${API_VERSION}/${path}.json`;
  if (params) {
    url += `?${new URLSearchParams(params).toString()}`;
  }

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

const getShop = async (config) => {
  const data = await fetchData(config, "GET", `shop`, { fields: "domain" });
  return data ? data.shop : null;
};

const getTheme = async (config, themeId) => {
  const data = await fetchData(config, "GET", `themes/${themeId}`);
  return data ? data.theme : null;
};

module.exports = {
  getTheme,
  getShop,
};
