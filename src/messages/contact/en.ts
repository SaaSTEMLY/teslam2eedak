const messages = {
  // Page metadata
  metaTitle: "Contact Us",
  metaDescription:
    "Get in touch with the Koffee Kulture team. We'd love to hear from you — whether it's a question, feedback, or partnership inquiry.",

  // Page heading
  pageTitle: "Get in touch.",
  pageSubtitle:
    "Whether you have a question about features, pricing, or anything else — our team is ready to answer.",

  // Contact info
  emailLabel: "Email",
  emailValue: "hello@saastarter.dev",
  emailDescription: "We aim to respond within 24 hours.",

  locationLabel: "Location",
  locationValue: "San Francisco, CA",
  locationDescription: "Working remotely, shipping globally.",

  hoursLabel: "Hours",
  hoursValue: "Mon – Fri, 9am – 6pm PST",
  hoursDescription: "Support available during business hours.",

  // Additional info
  proPlanNote:
    "Pro plan customers get priority support via private Discord. For general questions, check our",
  faqLink: "FAQ",

  // Form section
  formTitle: "Send a message",
  formSubtitle: "Fill out the form and we'll get back to you shortly.",

  // Form fields
  nameFieldLabel: "Name",
  namePlaceholder: "John Doe",
  nameRequired: "Name is required.",
  nameTooLong: "Name must be 150 characters or fewer.",

  emailFieldLabel: "Email",
  emailPlaceholder: "john@example.com",
  emailRequired: "Email is required.",
  emailInvalid: "Please enter a valid email address.",

  subjectFieldLabel: "Subject",
  subjectPlaceholder: "How can we help?",
  subjectRequired: "Subject is required.",
  subjectTooLong: "Subject must be 200 characters or fewer.",

  messageFieldLabel: "Message",
  messagePlaceholder: "Tell us more about your question or project...",
  messageRequired: "Message is required.",
  messageTooLong: "Message must be 5,000 characters or fewer.",

  // Form states
  submitButton: "Send Message",
  submittingButton: "Sending...",
  submitError: "Something went wrong. Please try again.",

  // Success state
  successTitle: "Message sent!",
  successMessage:
    "Thank you for reaching out. We'll get back to you within 24 hours.",
  sendAnotherButton: "Send another message",
} as const;

export default messages;
export type ContactMessages = Record<keyof typeof messages, string>;
