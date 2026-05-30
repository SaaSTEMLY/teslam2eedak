import type { CollectionConfig } from "payload";

export const Wishlists: CollectionConfig = {
  slug: "wishlists",
  labels: {
    singular: "Wishlist Item",
    plural: "Wishlist Items",
  },
  admin: {
    useAsTitle: "id",
    defaultColumns: ["customer", "product", "addedAt"],
    description: "Customer wishlists / saved products.",
  },
  access: {
    create: ({ req }) => !!req.user,
    read: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role?.includes("admin")) return true;
      return { customer: { equals: req.user.id } };
    },
    update: ({ req }) => {
      if (!req.user) return false;
      return { customer: { equals: req.user.id } };
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      if (req.user.role?.includes("admin")) return true;
      return { customer: { equals: req.user.id } };
    },
  },
  fields: [
    {
      name: "customer",
      type: "relationship",
      relationTo: "users",
      required: true,
      index: true,
      admin: {
        description: "The user who added this item to their wishlist.",
      },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
      index: true,
      admin: {
        description: "The product saved to the wishlist.",
      },
    },
    {
      name: "variant",
      type: "relationship",
      relationTo: "variants",
      admin: {
        description: "Optional specific product variant saved to the wishlist.",
      },
    },
    {
      name: "addedAt",
      type: "date",
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: "sidebar",
        description: "Timestamp when the item was added to the wishlist.",
      },
    },
  ],
};
