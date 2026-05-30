import type { CollectionConfig } from "payload";

export const Blogs: CollectionConfig = {
  slug: "blogs",
  labels: {
    singular: "Blog Post",
    plural: "Blog Posts",
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "publishedAt", "createdAt"],
    description: "Manage blog posts for the website.",
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 200,
      admin: {
        description:
          "The headline of the blog post, displayed in listings and detail pages.",
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      minLength: 1,
      admin: {
        description: "URL-friendly version of the title (e.g., my-blog-post)",
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
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
      name: "excerpt",
      type: "textarea",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 300,
      admin: {
        description: "Brief summary shown in blog listings (max 300 chars)",
      },
    },
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Cover image for this blog post",
      },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      localized: true,
      admin: {
        description: "Main body content of the blog post in rich text format.",
      },
    },
    {
      name: "author",
      type: "text",
      required: true,
      minLength: 1,
      defaultValue: "Koffee Kulture Team",
      admin: {
        description: "Display name of the post author.",
      },
    },
    {
      name: "category",
      type: "select",
      required: true,
      options: [
        {
          label: { en: "Engineering", ar: "هندسة", es: "Ingeniería" },
          value: "engineering",
        },
        {
          label: { en: "Product", ar: "منتج", es: "Producto" },
          value: "product",
        },
        {
          label: { en: "Company", ar: "شركة", es: "Empresa" },
          value: "company",
        },
        {
          label: { en: "Tutorial", ar: "شرح", es: "Tutorial" },
          value: "tutorial",
        },
        {
          label: { en: "Announcement", ar: "إعلان", es: "Anuncio" },
          value: "announcement",
        },
      ],
      defaultValue: "engineering",
      admin: {
        description: "Primary content category for filtering and organization.",
      },
    },
    {
      name: "tags",
      type: "array",
      admin: {
        description: "Add tags to help categorize the post",
      },
      fields: [
        {
          name: "tag",
          type: "text",
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
      ],
      defaultValue: "draft",
      admin: {
        position: "sidebar",
        description:
          "Publication status controlling visibility on the website.",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "When this post should be considered published",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
