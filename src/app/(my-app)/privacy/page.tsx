import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("privacy");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/privacy",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/privacy",
    },
  };
}

export default async function PrivacyPolicyPage() {
  const m = await getMessages("privacy");
  const legal = await getMessages("legal");

  return (
    <LegalPageLayout
      title={m.pageTitle}
      lastUpdated={m.lastUpdated}
      lastUpdatedLabel={legal.lastUpdated}
    >
      <p>{m.intro}</p>

      <h2>{m.section1Title}</h2>

      <h3>{m.section1Subtitle1}</h3>
      <p>{m.section1Content1}</p>
      <ul>
        <li>{m.section1Item1}</li>
        <li>{m.section1Item2}</li>
        <li>{m.section1Item3}</li>
        <li>{m.section1Item4}</li>
      </ul>
      <p>{m.section1Content2}</p>
      <ul>
        <li>{m.section1Item5}</li>
        <li>{m.section1Item6}</li>
        <li>{m.section1Item7}</li>
        <li>{m.section1Item8}</li>
      </ul>

      <h3>{m.section1Subtitle2}</h3>
      <p>{m.section1Content3}</p>
      <ul>
        <li>{m.section1Item9}</li>
        <li>{m.section1Item10}</li>
        <li>{m.section1Item11}</li>
        <li>{m.section1Item12}</li>
      </ul>

      <h2>{m.section2Title}</h2>
      <p>{m.section2Intro}</p>
      <ul>
        <li>{m.section2Item1}</li>
        <li>{m.section2Item2}</li>
        <li>{m.section2Item3}</li>
        <li>{m.section2Item4}</li>
        <li>{m.section2Item5}</li>
        <li>{m.section2Item6}</li>
        <li>{m.section2Item7}</li>
      </ul>

      <h2>{m.section3Title}</h2>
      <p>{m.section3Intro}</p>
      <ul>
        <li>
          <strong>{m.section3Item1Title}</strong> {m.section3Item1Content}
        </li>
        <li>
          <strong>{m.section3Item2Title}</strong> {m.section3Item2Content}
        </li>
        <li>
          <strong>{m.section3Item3Title}</strong> {m.section3Item3Content}
        </li>
      </ul>
      <p>{m.section3Content}</p>

      <h2>{m.section4Title}</h2>
      <p>{m.section4Intro}</p>
      <ul>
        <li>
          <strong>{m.section4Item1Title}</strong> {m.section4Item1Content}
        </li>
        <li>
          <strong>{m.section4Item2Title}</strong> {m.section4Item2Content}
        </li>
        <li>
          <strong>{m.section4Item3Title}</strong> {m.section4Item3Content}
        </li>
      </ul>
      <p>{m.section4Content}</p>

      <h2>{m.section5Title}</h2>
      <p>{m.section5Intro}</p>
      <ul>
        <li>
          <strong>{m.section5Item1Title}</strong> {m.section5Item1Content}
        </li>
        <li>
          <strong>{m.section5Item2Title}</strong> {m.section5Item2Content}
        </li>
        <li>
          <strong>{m.section5Item3Title}</strong> {m.section5Item3Content}
        </li>
      </ul>
      <p>{m.section5Content}</p>

      <h2>{m.section6Title}</h2>
      <p>{m.section6Intro}</p>
      <ul>
        <li>{m.section6Item1}</li>
        <li>{m.section6Item2}</li>
        <li>{m.section6Item3}</li>
        <li>{m.section6Item4}</li>
      </ul>
      <p>{m.section6Content}</p>

      <h2>{m.section7Title}</h2>
      <p>{m.section7Content}</p>

      <h2>{m.section8Title}</h2>
      <p>{m.section8Intro}</p>
      <ul>
        <li>{m.section8Item1}</li>
        <li>{m.section8Item2}</li>
        <li>{m.section8Item3}</li>
        <li>{m.section8Item4}</li>
        <li>{m.section8Item5}</li>
        <li>{m.section8Item6}</li>
      </ul>
      <p>
        {m.section8Content} <Link href="/contact">{m.section8Link}</Link>.
      </p>

      <h2>{m.section9Title}</h2>
      <p>{m.section9Content}</p>

      <h2>{m.section10Title}</h2>
      <p>{m.section10Content}</p>

      <h2>{m.section11Title}</h2>
      <p>{m.section11Content}</p>

      <h2>{m.section12Title}</h2>
      <p>
        {m.section12Content} <Link href="/contact">{m.section12Link}</Link>.
      </p>
    </LegalPageLayout>
  );
}
