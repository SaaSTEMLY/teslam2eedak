import Link from "@/components/Link/customLink";
import { Github, Twitter, Linkedin } from "lucide-react";
import { getMessages } from "@/lib/i18n";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";

export async function Footer() {
  const m = await getMessages("footer");

  const footerLinks = {
    resources: {
      title: m.resources,
      links: [
        { label: m.about, href: "/about" },
        { label: m.products, href: "/products" },
        { label: m.blog, href: "/blogs" },
        { label: m.faq, href: "/faq" },
      ],
    },
    developers: {
      title: m.developers,
      links: [
        { label: m.apiDocs, href: "/api/docs" },
        { label: m.openApiSpec, href: "/api/openapi.json" },
        { label: m.llmsTxt, href: "/llms.txt" },
        { label: m.humanDocs, href: "/to-humans.md" },
      ],
    },
    legal: {
      title: m.legal,
      links: [
        { label: m.termsOfService, href: "/terms" },
        { label: m.privacyPolicy, href: "/privacy" },
        { label: m.license, href: "/license" },
        { label: m.contactUs, href: "/contact" },
      ],
    },
  };

  const socialLinks = [
    { label: m.github, href: "#", icon: Github },
    { label: m.twitter, href: "#", icon: Twitter },
    { label: m.linkedin, href: "#", icon: Linkedin },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/30 dark:to-black/20">
      {/* Gradient separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Desktop layout: all sections in a row */}
        <div className="hidden md:flex md:items-start md:justify-between md:gap-8">
          {/* Brand column */}
          <div className="space-y-4 max-w-xs">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-foreground"
            >
              <span className="text-primary">K</span>offee{" "}
              <span className="text-primary">K</span>ulture
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {m.tagline}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:-translate-y-0.5"
                >
                  <social.icon className="size-4" />
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{m.copyright}</p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="space-y-4 max-w-xs">
            <h3 className="text-sm font-semibold text-foreground">
              {m.newsletterTitle}
            </h3>
            <NewsletterForm translations={m} compact />
          </div>
        </div>

        {/* Mobile layout: brand on top, links in flex rows, copyright at bottom */}
        <div className="md:hidden space-y-8">
          {/* Brand */}
          <div className="space-y-4 flex flex-col items-center">
            <Link
              href="/"
              className="text-xl font-extrabold tracking-tight text-foreground"
            >
              <span className="text-primary">K</span>offee{" "}
              <span className="text-primary">K</span>ulture
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {m.tagline}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex items-center justify-center size-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 hover:-translate-y-0.5"
                >
                  <social.icon className="size-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link sections in flex row */}
          <div className="flex flex-wrap gap-x-12 gap-y-6 justify-center">
            {Object.values(footerLinks).map((section) => (
              <div key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter (mobile) */}
          <div className="space-y-3 text-center">
            <h3 className="text-sm font-semibold text-foreground">
              {m.newsletterTitle}
            </h3>
            <NewsletterForm translations={m} compact />
          </div>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            {m.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
