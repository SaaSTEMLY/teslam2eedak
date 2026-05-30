import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: {
    singular: "Media",
    plural: "Media",
  },
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 300,
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 512,
        position: "centre",
      },
      {
        name: "hero",
        width: 1920,
        height: undefined,
        position: "centre",
      },
    ],
    adminThumbnail: "thumbnail",
    focalPoint: true,
    crop: true,
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      localized: true,
      minLength: 1,
      maxLength: 500,
      admin: {
        description:
          "Accessible alternative text describing the image for screen readers and SEO.",
      },
    },
  ],
};
