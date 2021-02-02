# Shopify theme development - workflow helpers (WIP)

This uses [Webpack](https://webpack.js.org/) and [ThemeKit](https://github.com/Shopify/node-themekit) to make development Shopify themes just a list easier.

It is intended to work with traditional Shopify themes and is not meant to be used when doing Shopify headless builds, etc.

## Painpoints hoping to solve
When using several templates that share the same schema settings - but set in each section directly - it gets
difficult to maintain, since you have to change them in each section. The same issue for `content block` types.

## Goals
- Allow working with modern javascript and CSS (no typescript support planned though)
- Ability to reuse schema definitions in sections
- Resuable `block type` definitions
- Use `ThemeKit` to handle syncing on file change, etc.
- Allow subfolders in assets that will be flattened during build

## Usage

- Install package (WIP)
- Add `yarn start` mapped to `shopify-theme-dev.js start` in your `package.json`
- Add `yarn build` mapped to `shopify-theme-dev.js start` in your `package.json` (WIP)

## Working with Section Schemas

### Separated Schemas
For schemas that are reusable you can create a `.json` object inside `src/schemas/` that holds
the Shopify section schema definition. The name of the file is the name that will be used in section `YAML`
definitions.

You can use `$PAGE_TITLE` as the section name and this will be set when the `YAML` file sets that value.

### YAML Definitions for Sections
Sections can be `YAML` files instead of liquid. They will get translated to liquid templates before
they are uploaded to Shopify. You can configure the following in a section `YAML` file:

```yaml
title: "Page - My custom page"
include: "dynamic-content"
schema: "cms"
```

- `title` will be used as the name inside the schema if it is set.
- `include` the snippet to include in this section; it will be passed the `section` object
- `schema` the schema json file to embed in this section's liquid code

The above example will result in:
```
{% include 'dynamic-content', section: section %}
{% schema %}
{
  "name": "My custom page",
  "settings": [
    ...
  ]
}
{% endschema %}
```
It will include the contents of: `src/schemas/cms.json`

## License

[Licensed as MIT](./LICENSE)
