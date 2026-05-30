const messages = {
  // Hero
  heroTagline: "Next.js SaaS Template",
  heroTitle: "Ship fast.",
  heroTitleFaded: "Stay minimal.",
  heroDescription:
    "Auth, payments, eCommerce, admin panel \u2014 everything wired up. Just add your idea.",
  heroGetStarted: "Get Started",
  heroSeeFeatures: "See what\u2019s included",

  // Logo Marquee
  builtWith: "Built with",

  // Features
  featuresTitle: "Everything",
  featuresTitleFaded: "you need.",
  featureEcommerceTitle: "eCommerce",
  featureEcommerceDesc:
    "Products, cart, checkout, and order management out of the box.",
  featureAdminTitle: "Admin Panel",
  featureAdminDesc:
    "Manage users, products, orders, and content from one place.",
  featureAuthTitle: "Authentication",
  featureAuthDesc: "Social login, 2FA, magic links, and email verification.",
  featurePaymentsTitle: "Payments",
  featurePaymentsDesc:
    "Subscriptions and one-time payments with full Stripe integration.",
  featureI18nTitle: "i18n",
  featureI18nDesc: "Static and dynamic translations with full RTL support.",
  featureSeoTitle: "SEO",
  featureSeoDesc: "Perfect Lighthouse scores, structured data, and meta tags.",

  // Pricing
  pricingTitle: "Choose your tier.",
  pricingSubtitle: "Frontend or full-stack. Pick Lite or Pro.",
  planFrontendLiteName: "Frontend Lite",
  planFrontendLiteDesc: "Marketing site + SEO foundations.",
  planFrontendLiteFeature1: "Landing, about, FAQ, blog, contact",
  planFrontendLiteFeature2: "SEO + performance setup",
  planFrontendLiteFeature3: "All UI components",
  planFrontendLiteFeature4: "1 year of updates",
  planFrontendLiteCta: "Get Frontend Lite",
  planFrontendProName: "Frontend Pro",
  planFrontendProDesc: "Auth UI, dark/light mode, i18n, RTL.",
  planFrontendProFeature1: "Everything in Frontend Lite",
  planFrontendProFeature2: "Auth pages + sessions UI",
  planFrontendProFeature3: "Dark/light mode toggle",
  planFrontendProFeature4: "i18n + RTL support",
  planFrontendProCta: "Get Frontend Pro",
  planBackendFrontendLiteName: "Backend+Frontend Lite",
  planBackendFrontendLiteDesc: "Admin, products, checkout, database.",
  planBackendFrontendLiteFeature1: "Everything in Frontend Pro",
  planBackendFrontendLiteFeature2: "Admin dashboard",
  planBackendFrontendLiteFeature3: "Products, cart, checkout",
  planBackendFrontendLiteFeature4: "PGlite + production DB adapters",
  planBackendFrontendLiteCta: "Get B+F Lite",
  planBackendFrontendProName: "Backend+Frontend Pro",
  planBackendFrontendProDesc: "Stripe payments + full eCommerce.",
  planBackendFrontendProFeature1: "Everything in B+F Lite",
  planBackendFrontendProFeature2: "Stripe payments",
  planBackendFrontendProFeature3: "Order management",
  planBackendFrontendProFeature4: "Discounts + coupons",
  planBackendFrontendProCta: "Get B+F Pro",

  // Testimonials
  testimonialsTitle: "Developers",
  testimonialsTitleFaded: "love it.",
  testimonial1Quote:
    "Saved me 3 months of development time. The code quality is exceptional.",
  testimonial1Name: "Alex Chen",
  testimonial1Title: "Founder, LaunchPad",
  testimonial2Quote:
    "Best Next.js template I\u2019ve used. Launched my SaaS in 2 weeks.",
  testimonial2Name: "Emily Park",
  testimonial2Title: "Indie Maker",
  testimonial3Quote: "The auth and Stripe setup alone saved me weeks of work.",
  testimonial3Name: "Lisa Zhang",
  testimonial3Title: "Software Engineer, StartupX",

  // FAQ
  faqTitle: "Questions.",
  faqSubtitle: "Everything you need to know.",

  // Final CTA
  ctaTitle: "Start shipping",
  ctaTitleFaded: "today.",
  ctaButton: "Get SaaSTARTER",
  ctaGuarantee: "14-day money-back guarantee",

  // Newsletter CTA
  ctaNewsletterLabel: "Or get updates in your inbox",

  // Pricing badge
  pricingPopular: "Most Popular",

  // Bento Grid
  bentoTitle: "Everything you need, nothing you don\u2019t",
  bentoSubtitle:
    "A carefully curated set of features that work together seamlessly.",
  bentoCodePreview: "Live Code Preview",
  bentoDarkMode: "Dark Mode Built-in",
  bentoLighthouse: "Lighthouse Scores",
  bentoPerformance: "Performance",
  bentoAccessibility: "Accessibility",
  bentoBestPractices: "Best Practices",
  bentoSeo: "SEO",
  bentoCartReady: "Cart Ready",
  bentoI18nReady: "i18n Ready",
  bentoStripe: "Stripe",
  bentoDatabase: "PostgreSQL",
} as const;

export default messages;
export type HomeMessages = Record<keyof typeof messages, string>;
