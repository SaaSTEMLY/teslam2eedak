const messages = {
  // Metadata
  metaTitle: "Terms of Service",
  metaDescription:
    "Read the Terms of Service for SaaSTARTER. Understand your rights and responsibilities when using our platform.",

  // Page header
  pageTitle: "Terms of Service",
  lastUpdated: "February 5, 2026",

  // Content
  intro:
    'Welcome to SaaSTARTER. These Terms of Service ("Terms") govern your access to and use of our website, products, and services. By accessing or using SaaSTARTER, you agree to be bound by these Terms.',

  section1Title: "1. Acceptance of Terms",
  section1Content:
    "By accessing or using our services, you confirm that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are using our services on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.",

  section2Title: "2. Description of Services",
  section2Intro:
    "SaaSTARTER provides a production-ready Next.js SaaS template with eCommerce capabilities, authentication, payment processing, and related tools and services. Our services include:",
  section2Item1: "Access to the SaaSTARTER codebase and template files",
  section2Item2: "Documentation and implementation guides",
  section2Item3: "Updates and improvements to the template",
  section2Item4: "Community support through designated channels",

  section3Title: "3. License and Usage Rights",
  section3Content:
    "Upon purchasing SaaSTARTER, you receive a license to use the template according to the terms outlined in our",
  section3Link: "License Agreement",
  section3Content2:
    ". This license is non-exclusive and subject to the restrictions described therein.",

  section4Title: "4. Account Registration",
  section4Intro:
    "To access certain features, you may need to create an account. You agree to:",
  section4Item1:
    "Provide accurate and complete information during registration",
  section4Item2: "Maintain the security of your account credentials",
  section4Item3:
    "Promptly notify us of any unauthorized access to your account",
  section4Item4: "Accept responsibility for all activities under your account",

  section5Title: "5. Payment and Refunds",
  section5Content:
    "All purchases are processed through Stripe. Prices are displayed in USD and may be subject to applicable taxes. We offer a 14-day money-back guarantee for first-time purchases. Refund requests should be submitted via our",
  section5Link: "contact form",

  section6Title: "6. Intellectual Property",
  section6Content:
    "SaaSTARTER and its original content, features, and functionality are owned by SaaSTARTER and are protected by international copyright, trademark, and other intellectual property laws. The template code you purchase is licensed, not sold.",

  section7Title: "7. Prohibited Uses",
  section7Intro: "You agree not to:",
  section7Item1:
    "Redistribute, resell, or sublicense the template without authorization",
  section7Item2: "Use the services for any unlawful purpose",
  section7Item3: "Attempt to gain unauthorized access to our systems",
  section7Item4: "Interfere with or disrupt the integrity of our services",
  section7Item5: "Upload malicious code or content",

  section8Title: "8. Disclaimer of Warranties",
  section8Content:
    'Our services are provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not guarantee that the services will be uninterrupted, secure, or error-free.',

  section9Title: "9. Limitation of Liability",
  section9Content:
    "To the maximum extent permitted by law, SaaSTARTER shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.",

  section10Title: "10. Indemnification",
  section10Content:
    "You agree to indemnify and hold harmless SaaSTARTER and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the services or violation of these Terms.",

  section11Title: "11. Modifications to Terms",
  section11Content:
    "We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through our website. Your continued use of the services after such modifications constitutes acceptance of the updated Terms.",

  section12Title: "12. Termination",
  section12Content:
    "We may terminate or suspend your access to our services immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.",

  section13Title: "13. Governing Law",
  section13Content:
    "These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.",

  section14Title: "14. Contact Information",
  section14Content: "If you have questions about these Terms, please",
  section14Link: "contact us",
} as const;

export default messages;
export type TermsMessages = Record<keyof typeof messages, string>;
