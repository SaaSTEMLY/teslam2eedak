import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("terms");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/terms",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/terms",
    },
  };
}

export default async function TermsOfServicePage() {
  const m = await getMessages("terms");
  const legal = await getMessages("legal");

  return (
    <LegalPageLayout
      title={m.pageTitle}
      lastUpdated={m.lastUpdated}
      lastUpdatedLabel={legal.lastUpdated}
    >
      <p>{m.intro}</p>

      <h2>{m.section1Title}</h2>
      <p>{m.section1Content}</p>

      <h2>{m.section2Title}</h2>
      <p>{m.section2Intro}</p>
      <ul>
        <li>{m.section2Item1}</li>
        <li>{m.section2Item2}</li>
        <li>{m.section2Item3}</li>
        <li>{m.section2Item4}</li>
      </ul>

      <h2>{m.section3Title}</h2>
      <p>
        {m.section3Content} <Link href="/license">{m.section3Link}</Link>
        {m.section3Content2}
      </p>

      <h2>{m.section4Title}</h2>
      <p>{m.section4Intro}</p>
      <ul>
        <li>{m.section4Item1}</li>
        <li>{m.section4Item2}</li>
        <li>{m.section4Item3}</li>
        <li>{m.section4Item4}</li>
      </ul>

      <h2>{m.section5Title}</h2>
      <p>
        {m.section5Content} <Link href="/contact">{m.section5Link}</Link>.
      </p>

      <h2>{m.section6Title}</h2>
      <p>{m.section6Content}</p>

      <h2>{m.section7Title}</h2>
      <p>{m.section7Intro}</p>
      <ul>
        <li>{m.section7Item1}</li>
        <li>{m.section7Item2}</li>
        <li>{m.section7Item3}</li>
        <li>{m.section7Item4}</li>
        <li>{m.section7Item5}</li>
      </ul>

      <h2>{m.section8Title}</h2>
      <p>{m.section8Content}</p>

      <h2>{m.section9Title}</h2>
      <p>{m.section9Content}</p>

      <h2>{m.section10Title}</h2>
      <p>{m.section10Content}</p>

      <h2>{m.section11Title}</h2>
      <p>{m.section11Content}</p>

      <h2>{m.section12Title}</h2>
      <p>{m.section12Content}</p>

      <h2>{m.section13Title}</h2>
      <p>{m.section13Content}</p>

      <h2>{m.section14Title}</h2>
      <p>
        {m.section14Content} <Link href="/contact">{m.section14Link}</Link>.
      </p>
    </LegalPageLayout>
  );
}
