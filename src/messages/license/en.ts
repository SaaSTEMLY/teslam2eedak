const messages = {
  // Metadata
  metaTitle: "License",
  metaDescription:
    "Understand the license terms for using Koffee Kulture. Learn what you can and cannot do with our template.",

  // Page header
  pageTitle: "License Agreement",
  lastUpdated: "February 5, 2026",

  // Content
  intro:
    'This License Agreement ("Agreement") is a legal agreement between you ("Licensee") and Koffee Kulture ("Licensor") governing the use of the Koffee Kulture template and associated materials.',

  section1Title: "1. Grant of License",
  section1Content:
    "Upon purchase, Koffee Kulture grants you a non-exclusive, non-transferable license to use the template subject to the terms of this Agreement.",

  section1Subtitle1: "Standard License",
  section1Content1: "The Standard License permits you to:",
  section1Item1: "Use the template to create",
  section1Item1Bold: "one (1) end product",
  section1Item1Content: "for yourself or a client",
  section1Item2: "Modify the template to suit your project requirements",
  section1Item3: "Use the template in a product that end users are charged for",

  section1Subtitle2: "Extended License",
  section1Content2:
    "The Extended License includes all Standard License rights, plus the ability to:",
  section1Item4: "Use the template to create",
  section1Item4Bold: "unlimited end products",
  section1Item5: "Use the template for multiple clients or projects",
  section1Item6:
    "Create products where the template forms the basis of a product offered to multiple end users",

  section2Title: "2. Permitted Uses",
  section2Intro: "You may:",
  section2Item1: "Create personal or commercial projects using the template",
  section2Item2: "Modify, adapt, and customize the code for your projects",
  section2Item3:
    "Use the template as a starting point for client work (one project per Standard License)",
  section2Item4: "Deploy your end product to any hosting platform",
  section2Item5:
    "Use the template in combination with other tools and libraries",

  section3Title: "3. Prohibited Uses",
  section3Intro: "You may NOT:",
  section3Item1Bold: "Redistribute or resell",
  section3Item1Content:
    "the template or any derivative in a way that allows others to extract the original template",
  section3Item2Bold: "Share, sublicense, or transfer",
  section3Item2Content: "your license to another person or entity",
  section3Item3Bold: "Create competing products",
  section3Item3Content:
    "that are substantially similar to the template for sale or distribution",
  section3Item4Bold: "Use in multiple projects",
  section3Item4Content: "beyond what your license permits",
  section3Item5Bold: "Remove or alter",
  section3Item5Content: "any proprietary notices, labels, or marks",
  section3Item6Bold: "Use for illegal purposes",
  section3Item6Content: "or in violation of any applicable laws",

  section4Title: "4. Ownership",
  section4Content1:
    "The template and all associated intellectual property rights remain the exclusive property of Koffee Kulture. This Agreement grants you a license to use the template; it does not transfer ownership.",
  section4Content2:
    "You retain ownership of any custom code, content, or modifications you create while using the template.",

  section5Title: "5. Third-Party Components",
  section5Intro:
    "The template includes third-party open-source components, each governed by their respective licenses. These include but are not limited to:",
  section5Item1: "Next.js (MIT License)",
  section5Item2: "React (MIT License)",
  section5Item3: "Tailwind CSS (MIT License)",
  section5Item4: "shadcn/ui components (MIT License)",
  section5Item5: "Radix UI (MIT License)",
  section5Item6: "Framer Motion (MIT License)",
  section5Content:
    "You must comply with the licenses of these third-party components when using the template.",

  section6Title: "6. Support and Updates",
  section6Intro: "Your purchase includes:",
  section6Item1Bold: "Lifetime access",
  section6Item1Content: "to the version purchased and all future updates",
  section6Item2Bold: "Community support",
  section6Item2Content: "through our designated channels",
  section6Item3Bold: "Documentation",
  section6Item3Content: "and implementation guides",
  section6Content:
    "Priority support is available to Pro plan customers as outlined in our",
  section6Link: "Terms of Service",

  section7Title: "7. Warranty Disclaimer",
  section7Content1:
    'The template is provided "as is" without warranty of any kind, express or implied. Koffee Kulture does not warrant that the template will meet your requirements, be uninterrupted, or be error-free.',
  section7Content2:
    "You assume all responsibility and risk for the use of the template and your reliance thereon.",

  section8Title: "8. Limitation of Liability",
  section8Content1:
    "In no event shall Koffee Kulture be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the template, even if advised of the possibility of such damages.",
  section8Content2:
    "Koffee Kulture's total liability shall not exceed the amount paid by you for the template.",

  section9Title: "9. Termination",
  section9Content1:
    "This license is effective until terminated. Your rights under this Agreement will terminate automatically without notice if you fail to comply with any of its terms.",
  section9Content2:
    "Upon termination, you must cease all use of the template and destroy any copies in your possession.",

  section10Title: "10. Refunds",
  section10Content:
    "We offer a 14-day money-back guarantee for first-time purchases. If you're not satisfied with the template, contact us within 14 days of purchase for a full refund. Refund requests after this period will be evaluated on a case-by-case basis.",

  section11Title: "11. License Verification",
  section11Content:
    "Koffee Kulture reserves the right to verify license compliance. Unauthorized use of the template may result in legal action and liability for damages.",

  section12Title: "12. Governing Law",
  section12Content:
    "This Agreement shall be governed by and construed in accordance with the laws of the State of California, United States. Any disputes arising under this Agreement shall be resolved in the courts of California.",

  section13Title: "13. Contact",
  section13Content:
    "For questions about this License Agreement or to report unauthorized use, please",
  section13Link: "contact us",
} as const;

export default messages;
export type LicenseMessages = Record<keyof typeof messages, string>;
