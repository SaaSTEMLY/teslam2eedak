import type { Metadata } from "next";
import Link from "@/components/Link/customLink";
import { LegalPageLayout } from "@/components/legal/legal-page-layout";
import { getMessages } from "@/lib/i18n";
import { baseMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const m = await getMessages("license");

  return {
    title: m.metaTitle,
    description: m.metaDescription,
    alternates: {
      canonical: "/license",
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: m.metaTitle,
      description: m.metaDescription,
      url: "/license",
    },
  };
}

export default async function LicensePage() {
  const m = await getMessages("license");
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

      <h3>{m.section1Subtitle1}</h3>
      <p>{m.section1Content1}</p>
      <ul>
        <li>
          {m.section1Item1} <strong>{m.section1Item1Bold}</strong>{" "}
          {m.section1Item1Content}
        </li>
        <li>{m.section1Item2}</li>
        <li>{m.section1Item3}</li>
      </ul>

      <h3>{m.section1Subtitle2}</h3>
      <p>{m.section1Content2}</p>
      <ul>
        <li>
          {m.section1Item4} <strong>{m.section1Item4Bold}</strong>
        </li>
        <li>{m.section1Item5}</li>
        <li>{m.section1Item6}</li>
      </ul>

      <h2>{m.section2Title}</h2>
      <p>{m.section2Intro}</p>
      <ul>
        <li>{m.section2Item1}</li>
        <li>{m.section2Item2}</li>
        <li>{m.section2Item3}</li>
        <li>{m.section2Item4}</li>
        <li>{m.section2Item5}</li>
      </ul>

      <h2>{m.section3Title}</h2>
      <p>{m.section3Intro}</p>
      <ul>
        <li>
          <strong>{m.section3Item1Bold}</strong> {m.section3Item1Content}
        </li>
        <li>
          <strong>{m.section3Item2Bold}</strong> {m.section3Item2Content}
        </li>
        <li>
          <strong>{m.section3Item3Bold}</strong> {m.section3Item3Content}
        </li>
        <li>
          <strong>{m.section3Item4Bold}</strong> {m.section3Item4Content}
        </li>
        <li>
          <strong>{m.section3Item5Bold}</strong> {m.section3Item5Content}
        </li>
        <li>
          <strong>{m.section3Item6Bold}</strong> {m.section3Item6Content}
        </li>
      </ul>

      <h2>{m.section4Title}</h2>
      <p>{m.section4Content1}</p>
      <p>{m.section4Content2}</p>

      <h2>{m.section5Title}</h2>
      <p>{m.section5Intro}</p>
      <ul>
        <li>{m.section5Item1}</li>
        <li>{m.section5Item2}</li>
        <li>{m.section5Item3}</li>
        <li>{m.section5Item4}</li>
        <li>{m.section5Item5}</li>
        <li>{m.section5Item6}</li>
      </ul>
      <p>{m.section5Content}</p>

      <h2>{m.section6Title}</h2>
      <p>{m.section6Intro}</p>
      <ul>
        <li>
          <strong>{m.section6Item1Bold}</strong> {m.section6Item1Content}
        </li>
        <li>
          <strong>{m.section6Item2Bold}</strong> {m.section6Item2Content}
        </li>
        <li>
          <strong>{m.section6Item3Bold}</strong> {m.section6Item3Content}
        </li>
      </ul>
      <p>
        {m.section6Content} <Link href="/terms">{m.section6Link}</Link>.
      </p>

      <h2>{m.section7Title}</h2>
      <p>{m.section7Content1}</p>
      <p>{m.section7Content2}</p>

      <h2>{m.section8Title}</h2>
      <p>{m.section8Content1}</p>
      <p>{m.section8Content2}</p>

      <h2>{m.section9Title}</h2>
      <p>{m.section9Content1}</p>
      <p>{m.section9Content2}</p>

      <h2>{m.section10Title}</h2>
      <p>{m.section10Content}</p>

      <h2>{m.section11Title}</h2>
      <p>{m.section11Content}</p>

      <h2>{m.section12Title}</h2>
      <p>{m.section12Content}</p>

      <h2>{m.section13Title}</h2>
      <p>
        {m.section13Content} <Link href="/contact">{m.section13Link}</Link>.
      </p>
    </LegalPageLayout>
  );
}
