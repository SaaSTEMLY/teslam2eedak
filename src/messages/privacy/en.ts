const messages = {
  // Metadata
  metaTitle: "Privacy Policy",
  metaDescription:
    "Learn how SaaSTARTER collects, uses, and protects your personal information. Your privacy matters to us.",

  // Page header
  pageTitle: "Privacy Policy",
  lastUpdated: "February 5, 2026",

  // Content
  intro:
    "At SaaSTARTER, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.",

  section1Title: "1. Information We Collect",
  section1Subtitle1: "Personal Information",
  section1Content1:
    "We may collect personal information that you voluntarily provide when you:",
  section1Item1: "Create an account or make a purchase",
  section1Item2: "Subscribe to our newsletter",
  section1Item3: "Contact us through our support channels",
  section1Item4: "Participate in surveys or promotions",
  section1Content2: "This information may include:",
  section1Item5: "Name and email address",
  section1Item6: "Billing address and payment information",
  section1Item7: "Company name and job title",
  section1Item8: "Any other information you choose to provide",

  section1Subtitle2: "Automatically Collected Information",
  section1Content3:
    "When you access our services, we may automatically collect certain information, including:",
  section1Item9: "IP address and browser type",
  section1Item10: "Device information and operating system",
  section1Item11: "Pages visited and time spent on our site",
  section1Item12: "Referring website addresses",

  section2Title: "2. How We Use Your Information",
  section2Intro: "We use the information we collect to:",
  section2Item1: "Process transactions and deliver purchased products",
  section2Item2: "Send administrative information and service updates",
  section2Item3: "Respond to inquiries and provide customer support",
  section2Item4: "Improve our website and services",
  section2Item5: "Send marketing communications (with your consent)",
  section2Item6: "Protect against fraudulent or unauthorized activity",
  section2Item7: "Comply with legal obligations",

  section3Title: "3. Information Sharing",
  section3Intro: "We may share your information with:",
  section3Item1Title: "Service Providers:",
  section3Item1Content:
    "Third-party vendors who assist us in operating our business (payment processors, email services, analytics providers)",
  section3Item2Title: "Legal Requirements:",
  section3Item2Content: "When required by law or to respond to legal process",
  section3Item3Title: "Business Transfers:",
  section3Item3Content:
    "In connection with a merger, acquisition, or sale of assets",
  section3Content:
    "We do not sell, rent, or trade your personal information to third parties for marketing purposes.",

  section4Title: "4. Third-Party Services",
  section4Intro:
    "Our services integrate with third-party providers, including:",
  section4Item1Title: "Stripe:",
  section4Item1Content:
    "For payment processing. Stripe's privacy policy governs payment data.",
  section4Item2Title: "Analytics Services:",
  section4Item2Content: "To understand how users interact with our site.",
  section4Item3Title: "Email Services:",
  section4Item3Content: "To send transactional and marketing emails.",
  section4Content:
    "We encourage you to review the privacy policies of these third-party services.",

  section5Title: "5. Cookies and Tracking Technologies",
  section5Intro:
    "We use cookies and similar tracking technologies to enhance your experience. These may include:",
  section5Item1Title: "Essential Cookies:",
  section5Item1Content: "Required for basic site functionality",
  section5Item2Title: "Analytics Cookies:",
  section5Item2Content: "Help us understand site usage",
  section5Item3Title: "Preference Cookies:",
  section5Item3Content: "Remember your settings and preferences",
  section5Content:
    "You can control cookies through your browser settings. Note that disabling certain cookies may affect site functionality.",

  section6Title: "6. Data Security",
  section6Intro:
    "We implement appropriate technical and organizational measures to protect your personal information, including:",
  section6Item1: "Encryption of data in transit and at rest",
  section6Item2: "Regular security assessments",
  section6Item3: "Access controls and authentication",
  section6Item4: "Secure development practices",
  section6Content:
    "However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",

  section7Title: "7. Data Retention",
  section7Content:
    "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. When information is no longer needed, we will securely delete or anonymize it.",

  section8Title: "8. Your Rights",
  section8Intro: "Depending on your location, you may have the right to:",
  section8Item1: "Access the personal information we hold about you",
  section8Item2: "Request correction of inaccurate information",
  section8Item3: "Request deletion of your personal information",
  section8Item4: "Object to or restrict certain processing",
  section8Item5: "Data portability",
  section8Item6: "Withdraw consent at any time",
  section8Content: "To exercise these rights, please",
  section8Link: "contact us",

  section9Title: "9. Children's Privacy",
  section9Content:
    "Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete it promptly.",

  section10Title: "10. International Data Transfers",
  section10Content:
    "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.",

  section11Title: "11. Changes to This Policy",
  section11Content:
    'We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.',

  section12Title: "12. Contact Us",
  section12Content:
    "If you have questions or concerns about this Privacy Policy or our data practices, please",
  section12Link: "contact us",
} as const;

export default messages;
export type PrivacyMessages = Record<keyof typeof messages, string>;
