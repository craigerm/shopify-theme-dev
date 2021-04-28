NOTE: This is a work in progress and is not stable as of yet.

# Shopify theme development

This uses [Webpack](https://webpack.js.org/) and [ThemeKit](https://github.com/Shopify/node-themekit) to make development Shopify themes just a list easier.

It is intended to work with traditional Shopify themes and is not meant to be used when doing Shopify headless builds, etc.

## Pain points hoping to solve
When using several templates that share the same schema settings - but set in each section directly - it gets
difficult to maintain, since you have to change them in each section. The same issue for `content block` types.

Or if you have block settings that you want to be shared and updated in one place.

## Goals
- Allow working with modern javascript and CSS (no typescript support planned though)
- Ability to reuse schema definitions in sections
- Resuable `block type` definitions
- Use `ThemeKit` to handle syncing on file change, etc.
- Allow subfolders in assets that will be flattened during build

## Usage

- Add `yarn start` mapped to `shopify-theme-dev.js start` in your `package.json`
- Add `yarn build` mapped to `shopify-theme-dev.js build` in your `package.json` (WIP)

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

### Partial Schemas

You can create a partial schema with an underscore (e.g. `src/schemas/_icons.json`) and include it in any other schema file. It will be injected inside that schema.

Example:

Icon partial (`src/schemas/_icons.json`):
```json
[
  {
    "type": "select",
    "id": "icon",
    "label": "Icon",
    "default": "",
    "options": [
      { "value": "icon-chevron", "label": "Chevron Icon" },
      { "value": "icon-star", "label": "Star Icon" }
    ]
  }
]

```

Schema file (`src/schemas/featured-section.json`)
```json
{
  "name": "$PAGE_TITLE",
  "max_blocks": 3,
  "blocks": [
    {
      "type": "product_item",
      "name": "Product",
      "settings": [
        "_icons"
      ]
    }
  ]
}
```

You can also a suffix and a prefix (usually a number) to the partial to change the id and label of the generated schema.

For example, including multiple icons in settings:
```json
{
  "name": "Featured Section",
  "settings": [
    "_icons#featured#1",
    "_icons#featured#1"
  ]
}
```

This will results in the following schema:
```json
{
  "name": "Featured Section",
  "settings": [
    {
      "type": "select",
      "id": "icon_featured1",
      "label": "Icon #1",
      "default": "",
      "options": [
        { "value": "icon-chevron", "label": "Chevron Icon" },
        { "value": "icon-star", "label": "Star Icon" }
      ]
    },
    {
      "type": "select",
      "id": "icon_featured2",
      "label": "Icon #2",
      "default": "",
      "options": [
        { "value": "icon-chevron", "label": "Chevron Icon" },
        { "value": "icon-star", "label": "Star Icon" }
      ]
    }
  ]
}
```

## License

[Licensed as MIT](./LICENSE)
