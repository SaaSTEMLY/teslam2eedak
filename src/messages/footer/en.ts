const messages = {
  resources: "Resources",
  blog: "Blog",
  products: "Products",
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
  tagline: "Production-ready Next.js SaaS template. Ship your product faster.",
  copyright: "\u00A9 2026 SaaSTARTER. All rights reserved.",

  // Developers
  developers: "Developers",
  apiDocs: "API Docs",
  openApiSpec: "OpenAPI Spec",
  llmsTxt: "LLMs.txt",
  humanDocs: "Markdown Docs",

  // Newsletter
  newsletterTitle: "Stay in the loop",
  newsletterPlaceholder: "Enter your email",
  newsletterButton: "Subscribe",
  newsletterSubscribing: "Subscribing...",
  newsletterSuccess: "You're subscribed!",
  newsletterError: "Something went wrong. Try again.",
  newsletterInvalidEmail: "Please enter a valid email.",
} as const;

export default messages;
export type FooterMessages = Record<keyof typeof messages, string>;
