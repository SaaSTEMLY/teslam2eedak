import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactMap } from "@/components/contact/contact-map";
import { Mail, MapPin, Clock } from "lucide-react";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("contact");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/contact",
    },
  };
}

export default async function ContactPage() {
  const m = await getMessages("contact");

  const contactInfo = [
    {
      icon: Mail,
      label: m.emailLabel,
      value: m.emailValue,
      description: m.emailDescription,
    },
    {
      icon: MapPin,
      label: m.locationLabel,
      value: m.locationValue,
      description: m.locationDescription,
    },
    {
      icon: Clock,
      label: m.hoursLabel,
      value: m.hoursValue,
      description: m.hoursDescription,
    },
  ];
  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
          {m.pageTitle}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          {m.pageSubtitle}
        </p>

        <div className="mt-16 grid grid-cols-1 gap-12 sm:mt-20 lg:grid-cols-5 lg:gap-16">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <div key={item.label} className="group">
                  <item.icon className="mb-3 size-5 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50 pt-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {m.proPlanNote}{" "}
                <Link
                  href="/#faq"
                  className="text-foreground hover:text-muted-foreground transition-colors"
                >
                  {m.faqLink}
                </Link>
                .
              </p>
            </div>

            <ContactMap />
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {m.formTitle}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">
              {m.formSubtitle}
            </p>
            <ContactForm />
          </div>
        </div>
      </div>
    </main>
  );
}
