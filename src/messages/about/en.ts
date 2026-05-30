const messages = {
  // Metadata
  metaTitle: "About Us",
  metaDescription:
    "Learn about the team and mission behind Koffee Kulture — the production-ready Next.js SaaS template built for speed.",

  // Hero
  pageTitle: "Built for builders.",
  pageSubtitle:
    "We believe shipping your product should take days, not months. Koffee Kulture gives you the foundation so you can focus on what matters — your idea.",

  // Mission
  missionTitle: "Our mission",
  missionDescription:
    "To eliminate the boilerplate barrier between a great idea and a live product. We craft opinionated, production-grade starter kits so founders and developers can launch faster and iterate sooner.",

  // Stats
  stat1Value: "10K+",
  stat1Label: "Developers",
  stat2Value: "99.9%",
  stat2Label: "Uptime",
  stat3Value: "50+",
  stat3Label: "Countries",
  stat4Value: "24/7",
  stat4Label: "Support",

  // Values
  valuesTitle: "What we stand for",
  value1Title: "Speed over perfection",
  value1Description:
    "Ship early, learn fast. Our templates are designed to get you to market in record time without sacrificing quality.",
  value2Title: "Developer experience",
  value2Description:
    "Clean code, strong types, and sensible defaults. We obsess over the details so you can focus on building.",
  value3Title: "Open by default",
  value3Description:
    "Transparent pricing, open documentation, and a community-first approach to every decision we make.",
  value4Title: "Global from day one",
  value4Description:
    "Built-in internationalization, RTL support, and accessible design — because great software has no borders.",

  // Team
  teamTitle: "The people behind the product",
  teamSubtitle:
    "A small, focused team obsessed with developer experience and product quality.",
  team1Name: "Alex Chen",
  team1Role: "Founder & Lead Engineer",
  team1Bio:
    "Full-stack developer with 10+ years building SaaS products. Previously at Vercel and Stripe.",
  team2Name: "Sara Martinez",
  team2Role: "Design & Frontend",
  team2Bio:
    "UI/UX designer who believes great interfaces should feel invisible. Advocates for accessibility everywhere.",
  team3Name: "Jordan Lee",
  team3Role: "Backend & Infrastructure",
  team3Bio:
    "Systems engineer focused on performance and reliability. Makes sure everything runs smoothly at scale.",

  // CTA
  ctaTitle: "Ready to ship?",
  ctaDescription:
    "Start building your SaaS today with a template that actually works out of the box.",
  ctaButton: "Explore products",

  // Navigation
  backToHome: "Back to home",
} as const;

export default messages;
export type AboutMessages = Record<keyof typeof messages, string>;
