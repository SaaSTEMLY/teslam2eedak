import type { CollectionConfig } from "payload";

export const ContactFormSubmissions: CollectionConfig = {
  slug: "contact-form-submissions",
  labels: {
    singular: "Contact Form Submission",
    plural: "Contact Form Submissions",
  },
  admin: {
    useAsTitle: "subject",
    defaultColumns: ["name", "email", "subject", "createdAt"],
    description: "Submissions from the public contact form.",
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      minLength: 1,
      maxLength: 150,
      admin: {
        description: "Full name of the person submitting the contact form.",
      },
    },
    {
      name: "email",
      type: "email",
      required: true,
      admin: {
        description: "Email address for follow-up correspondence.",
      },
    },
    {
      name: "subject",
      type: "text",
      required: true,
      minLength: 1,
      maxLength: 200,
      admin: {
        description: "Subject line summarizing the inquiry.",
      },
    },
    {
      name: "message",
      type: "textarea",
      required: true,
      minLength: 1,
      maxLength: 5000,
      admin: {
        description: "Full message body of the contact form submission.",
      },
    },
  ],
};
