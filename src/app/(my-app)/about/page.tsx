import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { ArrowLeft, ArrowRight, Zap, Code2, Eye, Globe } from "lucide-react";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("about");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/about",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/about",
    },
  };
}

export default async function AboutPage() {
  const m = await getMessages("about");

  const stats = [
    { value: m.stat1Value, label: m.stat1Label },
    { value: m.stat2Value, label: m.stat2Label },
    { value: m.stat3Value, label: m.stat3Label },
    { value: m.stat4Value, label: m.stat4Label },
  ];

  const values = [
    { icon: Zap, title: m.value1Title, description: m.value1Description },
    { icon: Code2, title: m.value2Title, description: m.value2Description },
    { icon: Eye, title: m.value3Title, description: m.value3Description },
    { icon: Globe, title: m.value4Title, description: m.value4Description },
  ];

  const team = [
    { name: m.team1Name, role: m.team1Role, bio: m.team1Bio },
    { name: m.team2Name, role: m.team2Role, bio: m.team2Bio },
    { name: m.team3Name, role: m.team3Role, bio: m.team3Bio },
  ];

  return (
    <main id="main-content">
      {/* Hero */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
          >
            <ArrowLeft className="size-4" />
            {m.backToHome}
          </Link>

          <h1 className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.pageTitle}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl leading-relaxed">
            {m.pageSubtitle}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            {m.missionTitle}
          </p>
          <div className="border-s-2 border-border ps-6 sm:ps-8">
            <p className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] leading-snug tracking-tight text-foreground/90">
              {m.missionDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none tracking-tight text-foreground">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-tight text-foreground mb-12 sm:mb-16">
            {m.valuesTitle}
          </h2>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-14">
            {values.map((value) => (
              <div key={value.title}>
                <value.icon className="mb-4 size-5 text-muted-foreground" />
                <h3 className="text-base font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-border/50 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.teamTitle}
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-lg">
            {m.teamSubtitle}
          </p>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:mt-16 sm:grid-cols-3 sm:gap-8">
            {team.map((member) => {
              const initials = member.name
                .split(" ")
                .map((n) => n[0])
                .join("");

              return (
                <div key={member.name}>
                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-muted">
                    <span className="text-sm font-semibold text-muted-foreground select-none">
                      {initials}
                    </span>
                  </div>
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground/70">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-24 sm:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none tracking-tight text-foreground">
            {m.ctaTitle}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground mx-auto max-w-md">
            {m.ctaDescription}
          </p>
          <div className="mt-10">
            <Link
              href="/products"
              className="group inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {m.ctaButton}
              <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
