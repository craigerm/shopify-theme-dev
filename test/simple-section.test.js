const {
  buildSectionSchema,
} = require("../scripts/plugins/lib/transform-section");

describe("simple-section-builder", () => {
  test("No partials returns data as is", () => {
    const data = buildSectionSchema("Custom Page", {
      name: "$PAGE_TITLE",
      settings: [
        {
          type: "header",
          content: "Hero",
        },
        {
          type: "text",
          id: "text",
          label: "Text",
        },
      ],
    });

    expect(data).toEqual({
      name: "Custom Page",
      settings: [
        {
          type: "header",
          content: "Hero",
        },
        {
          type: "text",
          id: "text",
          label: "Text",
        },
      ],
    });
  });

  test("Can embed simple settings partial", () => {
    const data = buildSectionSchema("Custom Page", {
      name: "$PAGE_TITLE",
      settings: [
        {
          type: "text",
          id: "text",
          label: "Text",
        },
        "_theme",
      ],
    });
    expect(data).toEqual({
      name: "Custom Page",
      settings: [
        {
          type: "text",
          id: "text",
          label: "Text",
        },
        {
          type: "select",
          id: "theme",
          label: "Theme",
          options: [
            { value: "is-blue", label: "Blue" },
            { value: "is-red", label: "Red" },
          ],
          default: "is-blue",
        },
      ],
    });
  });

  test("Can embed simple block settings partial", () => {
    const data = buildSectionSchema("Custom Page", {
      name: "$PAGE_TITLE",
      blocks: [
        {
          type: "product_item",
          name: "Product",
          settings: [
            "_theme",
            {
              type: "product",
              id: "product",
              label: "Product",
            },
          ],
        },
      ],
      settings: [],
    });

    expect(data).toEqual({
      name: "Custom Page",
      blocks: [
        {
          type: "product_item",
          name: "Product",
          settings: [
            {
              type: "select",
              id: "theme",
              label: "Theme",
              options: [
                { value: "is-blue", label: "Blue" },
                { value: "is-red", label: "Red" },
              ],
              default: "is-blue",
            },
            {
              type: "product",
              id: "product",
              label: "Product",
            },
          ],
        },
      ],
      settings: [],
    });
  });
});
