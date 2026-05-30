const messages = {
  resources: "Resources",
  blog: "Blog",
  products: "Menu",
  faq: "FAQ",
  about: "About",
  legal: "Legal",
  termsOfService: "Terms of Service",
  privacyPolicy: "Privacy Policy",
  license: "License",
  contactUs: "Contact Us",
  github: "GitHub",
  twitter: "Twitter",
  linkedin: "LinkedIn",
  tagline:
    "House-roasted koffee, scratch-made breakfast, and a menu you can scan. Maadi \u00B7 Cairo.",
  copyright: "\u00A9 2026 Koffee Kulture. All rights reserved.",

  // Developers
  developers: "Developers",
  apiDocs: "API Docs",
  openApiSpec: "OpenAPI Spec",
  llmsTxt: "LLMs.txt",
  humanDocs: "Markdown Docs",

  // Newsletter
  newsletterTitle: "Get the seasonal menu first",
  newsletterPlaceholder: "Your email",
  newsletterButton: "Subscribe",
  newsletterSubscribing: "Subscribing...",
  newsletterSuccess: "Welcome to the Kulture!",
  newsletterError: "Something went wrong. Try again.",
  newsletterInvalidEmail: "Please enter a valid email.",
} as const;

export default messages;
export type FooterMessages = Record<keyof typeof messages, string>;
