const messages = {
  // Hero
  heroTagline: "Maadi · Cairo · since 2021",
  heroTitle: "Order the Klassiks.",
  heroTitleFaded: "Or build your own.",
  heroDescription:
    "House-roasted koffee, all-day breakfast, and the bagels Kairo whispers about. Scan the table QR or order ahead — your drink finds you.",
  heroGetStarted: "Scan & Order",
  heroSeeFeatures: "See the Menu",

  // Logo Marquee
  builtWith: "As poured at",

  // Features
  featuresTitle: "Built for",
  featuresTitleFaded: "the daily kup.",
  featureEcommerceTitle: "Dine-in QR",
  featureEcommerceDesc:
    "Scan the table, customise your drink, pay in seconds. No waiting for a waiter.",
  featureAdminTitle: "Click & Collect",
  featureAdminDesc:
    "Order ahead, walk in, walk out. We brew it the minute you tap pay.",
  featureAuthTitle: "Real Modifiers",
  featureAuthDesc:
    "Oat milk, extra shot, half-sweet — the way you actually drink it.",
  featurePaymentsTitle: "Pay Your Way",
  featurePaymentsDesc:
    "Card on the QR or cash on pickup. Whatever you've got on you.",
  featureI18nTitle: "بالعربي",
  featureI18nDesc:
    "Full Arabic menu and order flow. Right-to-left, bottom-up flavours.",
  featureSeoTitle: "Live Status",
  featureSeoDesc:
    "Tracker page tells you when it's brewed, plated, or set on the bar.",

  // Pricing (= signature drinks)
  pricingTitle: "The Klassiks.",
  pricingSubtitle: "Sized M or L. Brewed your way.",
  planFrontendLiteName: "Espresso",
  planFrontendLiteDesc: "Short, sharp, Italian-style pull.",
  planFrontendLiteFeature1: "Single or double shot",
  planFrontendLiteFeature2: "House Arabica blend",
  planFrontendLiteFeature3: "Free oat milk swap on request",
  planFrontendLiteFeature4: "Ready in 90 seconds",
  planFrontendLiteCta: "Order Espresso",
  planFrontendProName: "Flat White",
  planFrontendProDesc: "Velvet milk on a double shot.",
  planFrontendProFeature1: "Double ristretto base",
  planFrontendProFeature2: "Microfoam textured milk",
  planFrontendProFeature3: "Choose whole, oat, almond or soy",
  planFrontendProFeature4: "Ready in 3 minutes",
  planFrontendProCta: "Order Flat White",
  planBackendFrontendLiteName: "Spanish Latte",
  planBackendFrontendLiteDesc: "Condensed milk meets condensed mornings.",
  planBackendFrontendLiteFeature1: "Sweetened condensed milk",
  planBackendFrontendLiteFeature2: "Double shot of espresso",
  planBackendFrontendLiteFeature3: "M or L size",
  planBackendFrontendLiteFeature4: "Best with a Krema Kroissant",
  planBackendFrontendLiteCta: "Order Spanish Latte",
  planBackendFrontendProName: "Salted Karamel",
  planBackendFrontendProDesc: "Our top seller. Karamel, espresso, sea salt.",
  planBackendFrontendProFeature1: "House karamel syrup",
  planBackendFrontendProFeature2: "Double espresso",
  planBackendFrontendProFeature3: "Maldon salt finish",
  planBackendFrontendProFeature4: "Iced or hot",
  planBackendFrontendProCta: "Order Salted Karamel",

  // Testimonials
  testimonialsTitle: "Cairo",
  testimonialsTitleFaded: "loves us.",
  testimonial1Quote:
    "Best flat white in Maadi. Their oat milk is the real deal — no aftertaste.",
  testimonial1Name: "Hana Mostafa",
  testimonial1Title: "Regular, Maadi",
  testimonial2Quote:
    "I order on my walk in from the metro. By the time I'm at the counter, my Salted Karamel is waiting.",
  testimonial2Name: "Karim ElOraby",
  testimonial2Title: "Pickup regular",
  testimonial3Quote:
    "The savoury bagels alone are worth the trip. Spanish Latte is the bonus.",
  testimonial3Name: "Layla Rashad",
  testimonial3Title: "Brunch fan",

  // FAQ
  faqTitle: "Asked &",
  faqSubtitle: "Answered.",

  // Final CTA
  ctaTitle: "Open the menu.",
  ctaTitleFaded: "Order your Klassik.",
  ctaButton: "Scan to Start",
  ctaGuarantee: "No app. No login. Just sip.",

  // Newsletter CTA
  ctaNewsletterLabel: "Or get the seasonal menu first",

  // Pricing badge
  pricingPopular: "Top Seller",

  // Bento Grid
  bentoTitle: "Why we keep your kup full",
  bentoSubtitle: "Small things that make the daily run feel less like a chore.",
  bentoCodePreview: "Live Menu",
  bentoDarkMode: "Night Mode",
  bentoLighthouse: "Brewed in 4 min",
  bentoPerformance: "House Roasted",
  bentoAccessibility: "Allergen Aware",
  bentoBestPractices: "Plant-based Milks",
  bentoSeo: "Order Tracker",
  bentoCartReady: "Cart-side Combos",
  bentoI18nReady: "AR + EN",
  bentoStripe: "Card or Cash",
  bentoDatabase: "Maadi, Cairo",
} as const;

export default messages;
export type HomeMessages = Record<keyof typeof messages, string>;
