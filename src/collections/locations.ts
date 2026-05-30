import type { CollectionConfig } from "payload";

const DEFAULT_RESTAURANT_ID = "kk-main";

export const Locations: CollectionConfig = {
  slug: "locations",
  labels: {
    singular: "Branch",
    plural: "Branches",
  },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "city", "status", "updatedAt"],
    description:
      "Physical branches of the restaurant. Each has its own tables, hours, staff Live Orders Board, and may override menu item price/availability.",
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
      admin: {
        position: "sidebar",
        description:
          "Reserved for multi-tenant. Single-tenant deployments use the default.",
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
      maxLength: 120,
      admin: { description: "e.g., 'Maadi'" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: { position: "sidebar" },
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
      name: "status",
      type: "select",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      admin: { position: "sidebar" },
    },
    {
      type: "group",
      name: "address",
      label: "Address",
      fields: [
        {
          name: "street",
          type: "text",
          localized: true,
          admin: { description: "e.g., '9 Road 233, Degla'" },
        },
        { name: "city", type: "text", localized: true, defaultValue: "Cairo" },
        {
          name: "country",
          type: "text",
          defaultValue: "Egypt",
        },
        {
          name: "latitude",
          type: "number",
          admin: { description: "Decimal degrees, e.g., 29.9602" },
        },
        {
          name: "longitude",
          type: "number",
          admin: { description: "Decimal degrees, e.g., 31.2569" },
        },
        {
          name: "mapUrl",
          type: "text",
          admin: { description: "Optional Google Maps link" },
        },
      ],
    },
    {
      name: "phone",
      type: "text",
      admin: { description: "Public contact number for this branch" },
    },
    {
      name: "email",
      type: "email",
      admin: { description: "Optional public email for this branch" },
    },
    {
      name: "hours",
      type: "array",
      labels: { singular: "Hour Block", plural: "Hours" },
      admin: {
        description:
          "Opening hours per day. Leave a row blank to mark the day as closed.",
      },
      fields: [
        {
          name: "day",
          type: "select",
          required: true,
          options: [
            { label: "Monday", value: "mon" },
            { label: "Tuesday", value: "tue" },
            { label: "Wednesday", value: "wed" },
            { label: "Thursday", value: "thu" },
            { label: "Friday", value: "fri" },
            { label: "Saturday", value: "sat" },
            { label: "Sunday", value: "sun" },
          ],
        },
        {
          name: "openTime",
          type: "text",
          admin: { description: "24h format, e.g., '07:00'" },
        },
        {
          name: "closeTime",
          type: "text",
          admin: { description: "24h format, e.g., '23:00'" },
        },
      ],
    },
    {
      name: "vatPercent",
      type: "number",
      min: 0,
      max: 100,
      defaultValue: 14,
      admin: {
        position: "sidebar",
        description: "VAT rate applied to every cart at this branch.",
      },
    },
    {
      name: "serviceChargePercent",
      type: "number",
      min: 0,
      max: 100,
      defaultValue: 12,
      admin: {
        position: "sidebar",
        description:
          "Service charge applied to dine-in carts only at this branch.",
      },
    },
    {
      name: "allowedPaymentProviders",
      type: "select",
      hasMany: true,
      defaultValue: ["stripe", "cash-on-pickup"],
      options: [
        { label: "Stripe (card)", value: "stripe" },
        { label: "Cash on pickup", value: "cash-on-pickup" },
        { label: "Paymob", value: "paymob" },
        { label: "Fawry", value: "fawry" },
      ],
      admin: {
        description:
          "Payment providers offered at this branch. Cash-on-pickup is automatically disabled for dine-in.",
      },
    },
    {
      name: "averageOrderPrepMinutes",
      type: "number",
      min: 1,
      defaultValue: 8,
      admin: {
        position: "sidebar",
        description:
          "Used as the base ETA for ASAP pickup orders before queue depth is factored in.",
      },
    },
  ],
};
