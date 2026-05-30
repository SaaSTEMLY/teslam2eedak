import type { CollectionConfig, CollectionAfterChangeHook } from "payload";

const incrementUsageOnOrder: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return doc;

  const code = doc.discountCode;
  if (!code || typeof code !== "string") return doc;

  try {
    const result = await req.payload.find({
      collection: "discount-codes",
      where: { code: { equals: code.toUpperCase().trim() } },
      limit: 1,
      depth: 0,
    });

    const discount = result.docs[0];
    if (!discount) return doc;

    await req.payload.update({
      collection: "discount-codes",
      id: discount.id,
      data: {
        currentUses: (discount.currentUses ?? 0) + 1,
      },
    });
  } catch {
    // Non-critical — don't block order creation
  }

  return doc;
};

export const DiscountCodes: CollectionConfig = {
  slug: "discount-codes",
  labels: {
    singular: "Discount Code",
    plural: "Discount Codes",
  },
  admin: {
    useAsTitle: "code",
    defaultColumns: [
      "code",
      "discountType",
      "discountValue",
      "isActive",
      "currentUses",
      "maxUses",
    ],
    description: "Manage discount and promo codes for the store.",
    group: "Ecommerce",
  },
  access: {
    create: ({ req }) => !!req.user?.role?.includes("admin"),
    read: ({ req }) => !!req.user?.role?.includes("admin"),
    update: ({ req }) => !!req.user?.role?.includes("admin"),
    delete: ({ req }) => !!req.user?.role?.includes("admin"),
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      admin: {
        description: "The code customers enter at checkout (case-insensitive)",
      },
      hooks: {
        beforeValidate: [
          ({ value }) => {
            if (typeof value === "string") {
              return value.toUpperCase().trim();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Internal note about this discount (not shown to customers)",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "discountType",
          type: "select",
          required: true,
          options: [
            { label: "Percentage", value: "percentage" },
            { label: "Flat Amount (USD)", value: "flat" },
          ],
          defaultValue: "percentage",
          admin: {
            width: "50%",
          },
        },
        {
          name: "discountValue",
          type: "number",
          required: true,
          min: 0,
          admin: {
            width: "50%",
            description:
              "For percentage: enter 10 for 10%. For flat: enter amount in cents (e.g., 500 = $5.00)",
          },
        },
      ],
    },
    {
      name: "maxDiscountAmount",
      type: "number",
      min: 0,
      admin: {
        description:
          "Maximum discount in cents (e.g., 5000 = $50.00). Only applies to percentage discounts. Leave blank for no cap.",
        condition: (data) => data.discountType === "percentage",
      },
    },
    {
      name: "minimumOrderAmount",
      type: "number",
      min: 0,
      admin: {
        description:
          "Minimum order subtotal in cents required to use this code (e.g., 1000 = $10.00). Leave blank for no minimum.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "maxUses",
          type: "number",
          min: 0,
          admin: {
            width: "50%",
            description:
              "Maximum total uses across all customers. Leave blank for unlimited.",
          },
        },
        {
          name: "currentUses",
          type: "number",
          defaultValue: 0,
          admin: {
            width: "50%",
            description: "Number of times this code has been used.",
            readOnly: true,
          },
        },
      ],
    },
    {
      name: "maxUsesPerCustomer",
      type: "number",
      min: 0,
      admin: {
        description:
          "Maximum uses per customer email. Leave blank for unlimited per customer.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "validFrom",
          type: "date",
          admin: {
            width: "50%",
            description: "Start date. Leave blank for immediately active.",
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
        },
        {
          name: "validUntil",
          type: "date",
          admin: {
            width: "50%",
            description: "Expiration date. Leave blank for no expiration.",
            date: {
              pickerAppearance: "dayAndTime",
            },
          },
        },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Only active codes can be applied at checkout.",
      },
    },
    {
      name: "appliesToProducts",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      admin: {
        description:
          "Restrict this code to specific products. Leave empty to apply to all products.",
      },
    },
    {
      name: "appliesToCategories",
      type: "select",
      hasMany: true,
      options: [
        {
          label: { en: "Software", ar: "برمجيات", es: "Software" },
          value: "software",
        },
        {
          label: { en: "Templates", ar: "قوالب", es: "Plantillas" },
          value: "templates",
        },
        {
          label: { en: "Courses", ar: "دورات", es: "Cursos" },
          value: "courses",
        },
        {
          label: { en: "Services", ar: "خدمات", es: "Servicios" },
          value: "services",
        },
        {
          label: { en: "Other", ar: "أخرى", es: "Otros" },
          value: "other",
        },
      ],
      admin: {
        description:
          "Restrict this code to specific product categories. Leave empty to apply to all categories.",
      },
    },
  ],
};

export { incrementUsageOnOrder };
