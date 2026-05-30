import type { CollectionConfig } from "payload";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  labels: {
    singular: "Review",
    plural: "Reviews",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "product", "rating", "status", "createdAt"],
    description: "Customer product reviews and ratings.",
  },
  access: {
    create: ({ req }) => !!req.user,
    read: () => true,
    update: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role?.includes("admin")) return true;
      return { customer: { equals: req.user.id } };
    },
    delete: ({ req }) => !!req.user?.role?.includes("admin"),
  },
  fields: [
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
      admin: {
        description: "The product this review is associated with.",
      },
    },
    {
      name: "customer",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      admin: {
        description: "The user who authored this review.",
      },
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
      admin: {
        description: "Star rating from 1 (lowest) to 5 (highest).",
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 200,
      admin: {
        description: "Short headline summarizing the review.",
      },
    },
    {
      name: "body",
      type: "textarea",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 2000,
      admin: {
        description: "Detailed review text from the customer.",
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        {
          label: { en: "Pending", ar: "قيد الانتظار", es: "Pendiente" },
          value: "pending",
        },
        {
          label: { en: "Approved", ar: "موافق عليه", es: "Aprobado" },
          value: "approved",
        },
        {
          label: { en: "Rejected", ar: "مرفوض", es: "Rechazado" },
          value: "rejected",
        },
      ],
      admin: {
        position: "sidebar",
        description:
          "Moderation status controlling public visibility of the review.",
      },
    },
    {
      name: "verifiedPurchase",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: "Whether this reviewer has purchased the product",
      },
    },
    {
      name: "helpfulCount",
      type: "number",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Number of users who found this review helpful",
      },
    },
  ],
};
