import type { CollectionConfig } from "payload";

export const FAQs: CollectionConfig = {
  slug: "faqs",
  labels: {
    singular: "FAQ",
    plural: "FAQs",
  },
  admin: {
    useAsTitle: "question",
    defaultColumns: ["question", "order", "isActive", "createdAt"],
    description: "Manage frequently asked questions displayed on the website.",
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: "question",
      type: "text",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 300,
      admin: {
        description: "The question being asked",
      },
    },
    {
      name: "answer",
      type: "textarea",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 2000,
      admin: {
        description: "The answer to the question",
      },
    },
    {
      name: "order",
      type: "number",
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        description: "Display order (lower numbers appear first)",
        position: "sidebar",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        description: "Whether this FAQ should be displayed on the website",
        position: "sidebar",
      },
    },
  ],
};
