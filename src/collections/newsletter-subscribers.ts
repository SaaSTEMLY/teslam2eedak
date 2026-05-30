import type { CollectionConfig } from "payload";

export const NewsletterSubscribers: CollectionConfig = {
  slug: "newsletter-subscribers",
  labels: {
    singular: "Newsletter Subscriber",
    plural: "Newsletter Subscribers",
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["email", "subscribedAt", "createdAt"],
    description: "Email addresses collected from the newsletter signup form.",
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true,
      admin: {
        description:
          "Subscriber email address collected from the newsletter signup form.",
      },
    },
    {
      name: "subscribedAt",
      type: "date",
      label: "Subscribed At",
      admin: {
        description:
          "Date and time when the user subscribed to the newsletter.",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
  ],
};
