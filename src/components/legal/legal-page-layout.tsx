import type { ReactNode } from "react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  lastUpdatedLabel: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  lastUpdated,
  lastUpdatedLabel,
  children,
}: LegalPageLayoutProps) {
  return (
    <main id="main-content" className="pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-bold leading-none tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {lastUpdatedLabel} {lastUpdated}
          </p>
        </header>

        <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-6 prose-li:text-muted-foreground prose-ul:my-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground">
          {children}
        </article>
      </div>
    </main>
  );
}
