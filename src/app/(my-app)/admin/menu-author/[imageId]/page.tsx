import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";

import { getPayload } from "@/lib/payload";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { STATIC_MENU_IMAGES } from "../page";
import { HotspotEditor } from "./hotspot-editor";

interface PageProps {
  params: Promise<{ imageId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { imageId } = await params;
  return generatePageMetadata({
    title: `Menu Author — ${imageId}`,
    description: "Hotspot authoring canvas.",
    path: `/admin/menu-author/${imageId}`,
    noIndex: true,
  });
}

export default async function HotspotPage({ params }: PageProps) {
  const payload = await getPayload();
  const session = await (
    payload as unknown as {
      betterAuth: { api: { getSession: (opts: { headers: Headers }) => Promise<{ user?: { role?: string } } | null> } };
    }
  ).betterAuth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/auth/sign-in");
  if (!(session.user.role ?? "").includes("admin")) redirect("/");

  const { imageId } = await params;
  const image = STATIC_MENU_IMAGES.find((i) => i.id === imageId);
  if (!image) notFound();

  type ProductDoc = {
    id: string | number;
    name?: string;
    hotspotBoxes?: unknown;
  };

  const { docs } = await payload.find({
    collection: "products",
    where: { _status: { equals: "published" } },
    limit: 500,
    sort: "name",
  });

  const items = (docs as ProductDoc[])
    .map((d) => ({
      id: d.id,
      name: typeof d.name === "string" ? d.name : `#${d.id}`,
      hotspots: Array.isArray(d.hotspotBoxes)
        ? (d.hotspotBoxes as ReadonlyArray<{
            locale?: string;
            menuImageId?: string;
            x?: number;
            y?: number;
            w?: number;
            h?: number;
          }>)
        : [],
    }))
    .filter((it) =>
      it.hotspots.some((h) => h.menuImageId === imageId) || true,
    );

  return (
    <HotspotEditor
      imageId={image.id}
      imageUrl={image.url}
      imageLabel={image.label}
      items={items.map((it) => ({
        id: it.id,
        name: it.name,
        currentHotspot: it.hotspots.find((h) => h.menuImageId === imageId),
      }))}
    />
  );
}
