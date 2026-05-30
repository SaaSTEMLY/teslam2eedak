import type { CollectionConfig } from "payload";

const DEFAULT_RESTAURANT_ID = "kk-main";

const SHORT_ID_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SHORT_ID_LENGTH = 6;

function generateShortId() {
  let out = "";
  for (let i = 0; i < SHORT_ID_LENGTH; i++) {
    out += SHORT_ID_ALPHABET[Math.floor(Math.random() * SHORT_ID_ALPHABET.length)];
  }
  return out;
}

export const Tables: CollectionConfig = {
  slug: "tables",
  labels: {
    singular: "Table",
    plural: "Tables",
  },
  admin: {
    useAsTitle: "label",
    defaultColumns: ["label", "location", "status", "shortId", "updatedAt"],
    description:
      "Physical tables at a branch. Each table has a short-ID encoded in its QR code; deactivated tables fall back to the pickup flow when scanned.",
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
      name: "location",
      type: "relationship",
      relationTo: "locations",
      required: true,
      admin: {
        description: "Which branch this table lives at.",
      },
    },
    {
      name: "label",
      type: "text",
      required: true,
      maxLength: 60,
      admin: {
        description: "Human-readable, shown to staff. e.g., 'Table 7'.",
      },
    },
    {
      name: "capacity",
      type: "number",
      min: 1,
      max: 100,
      admin: { description: "Optional seating capacity for reporting." },
    },
    {
      name: "shortId",
      type: "text",
      unique: true,
      required: true,
      maxLength: SHORT_ID_LENGTH,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Encoded in the QR URL. Auto-generated; never reuse a deactivated table's ID.",
      },
      hooks: {
        beforeValidate: [
          ({ value }: { value?: string }) => value || generateShortId(),
        ],
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      admin: {
        position: "sidebar",
        description:
          "Inactive tables still resolve the QR URL, but the menu page redirects to the pickup flow with a friendly message.",
      },
    },
    {
      name: "notes",
      type: "textarea",
      admin: {
        description:
          "Optional staff notes (e.g., 'window seat', 'high chair').",
      },
    },
  ],
};
