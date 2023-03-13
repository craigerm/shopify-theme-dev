const {
  buildSectionSchema,
} = require("../scripts/plugins/lib/transform-section");

describe("Naming overrides", () => {
  test("Can change prefix and label of partial", () => {
    const data = buildSectionSchema("Custom Page", {
      name: "$PAGE_TITLE",
      settings: [
        {
          type: "text",
          id: "text",
          label: "Text",
        },
        "_theme#desktop##Theme for desktop",
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
          id: "desktop_theme",
          label: "Theme for desktop",
          options: [
            { value: "is-blue", label: "Blue" },
            { value: "is-red", label: "Red" },
          ],
          default: "is-blue",
        },
      ],
    });
  });

  test("Can change prefix and label of nested partials", () => {
    const data = buildSectionSchema("Custom Page", {
      name: "$PAGE_TITLE",
      settings: ["_headline#hero#1", "_headline#hero#2"],
    });

    console.log(JSON.stringify(data, null, 2));
    expect(data).toEqual({
      name: "Custom Page",
      settings: [
        {
          type: "text",
          id: "hero_title1",
          label: "Title #1",
        },
        {
          type: "select",
          id: "hero_theme1",
          label: "Theme #1",
          options: [
            { value: "is-blue", label: "Blue" },
            { value: "is-red", label: "Red" },
          ],
          default: "is-blue",
        },
        {
          type: "text",
          id: "hero_title2",
          label: "Title #2",
        },
        {
          type: "select",
          id: "hero_theme2",
          label: "Theme #2",
          options: [
            { value: "is-blue", label: "Blue" },
            { value: "is-red", label: "Red" },
          ],
          default: "is-blue",
        },
      ],
    });
  });
});
