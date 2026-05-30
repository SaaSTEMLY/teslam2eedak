import type { Messages } from "@/lib/i18n";

const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "Stripe",
  "PostgreSQL",
  "Tailwind",
  "shadcn/ui",
  "Vercel",
];

export function LogoMarquee({ messages: m }: { messages: Messages<"home"> }) {
  return (
    <section className="border-y border-border/40 py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 sm:px-6 lg:px-8">
        <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
          {m.builtWith}
        </span>
        {stack.map((name) => (
          <span
            key={name}
            className="text-sm font-medium text-muted-foreground/50 transition-colors hover:text-foreground"
          >
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}
