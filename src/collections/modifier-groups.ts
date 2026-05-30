import type { CollectionConfig } from "payload";

const DEFAULT_RESTAURANT_ID = "kk-main";

const ALLERGEN_OPTIONS = [
  { label: { en: "Vegan", ar: "نباتي صرف", es: "Vegano" }, value: "vegan" },
  {
    label: { en: "Vegetarian", ar: "نباتي", es: "Vegetariano" },
    value: "vegetarian",
  },
  {
    label: { en: "Gluten-free", ar: "خالي من الجلوتين", es: "Sin gluten" },
    value: "gluten-free",
  },
  {
    label: { en: "Dairy-free", ar: "خالي من الألبان", es: "Sin lácteos" },
    value: "dairy-free",
  },
  {
    label: { en: "Contains nuts", ar: "يحتوي على مكسرات", es: "Contiene frutos secos" },
    value: "contains-nuts",
  },
  {
    label: { en: "Contains soy", ar: "يحتوي على صويا", es: "Contiene soja" },
    value: "contains-soy",
  },
  {
    label: { en: "Contains eggs", ar: "يحتوي على بيض", es: "Contiene huevo" },
    value: "contains-eggs",
  },
] as const;

export const ModifierGroups: CollectionConfig = {
  slug: "modifier-groups",
  labels: {
    singular: "Modifier Group",
    plural: "Modifier Groups",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "minSelectable", "maxSelectable", "updatedAt"],
    description:
      "Reusable named choice lists (e.g., 'Milk Choice', 'Extras'). Attach to menu items to expose customisations. Each option has a price delta in qirsh.",
  },
  access: {
    read: () => true,
    create: ({ req }) => !!req.user?.role?.includes("admin"),
    update: ({ req }) => !!req.user?.role?.includes("admin"),
    delete: ({ req }) => !!req.user?.role?.includes("admin"),
  },
  fields: [
    {
      name: "restaurantId",
      type: "text",
      defaultValue: DEFAULT_RESTAURANT_ID,
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      maxLength: 80,
      admin: {
        description: "Customer-facing label. e.g., 'Milk Choice'.",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: "Stable identifier. e.g., 'milk-choice'.",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }: { value?: string; data?: { name?: string } }) => {
            if (!value && data?.name) {
              return data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            }
            return value;
          },
        ],
      },
    },
    {
      name: "minSelectable",
      type: "number",
      required: true,
      min: 0,
      defaultValue: 0,
      admin: {
        description:
          "Minimum number of options the guest must pick. 0 means optional.",
      },
    },
    {
      name: "maxSelectable",
      type: "number",
      required: true,
      min: 1,
      defaultValue: 1,
      admin: {
        description:
          "Maximum number of options the guest may pick. 1 = pick-one radio.",
      },
    },
    {
      name: "options",
      type: "array",
      required: true,
      minRows: 1,
      labels: { singular: "Option", plural: "Options" },
      fields: [
        {
          name: "label",
          type: "text",
          required: true,
          localized: true,
          maxLength: 80,
          admin: { description: "e.g., 'Oat milk'." },
        },
        {
          name: "value",
          type: "text",
          required: true,
          admin: {
            description: "Stable identifier. e.g., 'oat-milk'.",
          },
          hooks: {
            beforeValidate: [
              ({
                value,
                data,
              }: {
                value?: string;
                data?: { label?: string };
              }) => {
                if (!value && data?.label) {
                  return data.label
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/(^-|-$)/g, "");
                }
                return value;
              },
            ],
          },
        },
        {
          name: "priceDelta",
          type: "number",
          required: true,
          defaultValue: 0,
          admin: {
            description:
              "Price delta in qirsh (1/100 EGP). e.g., 3500 = +35 LE.",
          },
        },
        {
          name: "isDefault",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Pre-selected when the item sheet opens." },
        },
        {
          name: "allergens",
          type: "select",
          hasMany: true,
          options: [...ALLERGEN_OPTIONS],
          admin: {
            description:
              "Allergens this option carries (e.g., oat-milk = vegan + dairy-free).",
          },
        },
        {
          name: "sortOrder",
          type: "number",
          defaultValue: 0,
          admin: { description: "Lower numbers appear first." },
        },
      ],
    },
  ],
};

export const ALLERGEN_VALUES = ALLERGEN_OPTIONS.map((o) => o.value);
export type AllergenValue = (typeof ALLERGEN_OPTIONS)[number]["value"];
