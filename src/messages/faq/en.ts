const messages = {
  // Metadata
  metaTitle: "FAQ",
  metaDescription:
    "Frequently asked questions about SaaSTARTER. Find answers about pricing, features, support, and more.",

  // Page header
  backToHome: "Home",
  pageTitle: "Questions.",
  pageSubtitle: "Everything you need to know about SaaSTARTER.",
  contactLink: "Contact us",
  contactPrompt: "if you need more help.",

  // Empty state
  noFaqsTitle: "No FAQs available",
  noFaqsDescription: "Check back soon or",
  noFaqsContactLink: "contact us",

  // Default FAQs
  faq1Question: "What's included in SaaSTARTER?",
  faq1Answer:
    "SaaSTARTER includes a complete Next.js application with authentication (better-auth), payments (Stripe), eCommerce functionality, admin dashboard, internationalization, and over 50 pre-built components. Everything you need to launch a SaaS product.",

  faq2Question: "Do I need coding experience?",
  faq2Answer:
    "Basic knowledge of React and TypeScript is recommended. SaaSTARTER is designed for developers who want to ship faster, not for complete beginners. However, the code is well-documented and follows best practices.",

  faq3Question: "Is this a subscription or one-time payment?",
  faq3Answer:
    "SaaSTARTER is a one-time purchase. You pay once and get lifetime access to the codebase. No recurring fees, no hidden costs.",

  faq4Question: "Can I use this for client projects?",
  faq4Answer:
    "Yes! Your license allows you to use SaaSTARTER for unlimited personal and client projects. You can build and deploy as many applications as you want.",

  faq5Question: "What payment methods do you accept?",
  faq5Answer:
    "We accept all major credit cards, debit cards, and digital wallets through Stripe. This includes Visa, Mastercard, American Express, and more.",

  faq6Question: "Do you offer refunds?",
  faq6Answer:
    "Yes, we offer a 14-day money-back guarantee. If you're not satisfied with SaaSTARTER, contact us within 14 days of purchase for a full refund.",

  faq7Question: "How do updates work?",
  faq7Answer:
    "Starter plan includes free updates for 1 year. Pro plan includes lifetime updates. You'll get access to our private repository where all updates are pushed regularly.",

  faq8Question: "What kind of support is included?",
  faq8Answer:
    "Starter plan includes community support via GitHub Discussions. Pro plan includes priority support via private Discord channel and a 1-on-1 setup call to help you get started.",
} as const;

export default messages;
export type FaqMessages = Record<keyof typeof messages, string>;
