import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getPayload } from "@/lib/payload";
import { generatePageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

import { BoardClient } from "./board-client";

interface BoardPageProps {
  params: Promise<{ locationId: string }>;
}

export async function generateMetadata({
  params,
}: BoardPageProps): Promise<Metadata> {
  const { locationId } = await params;
  return generatePageMetadata({
    title: `Live Orders — Branch #${locationId}`,
    description: "Staff Live Orders Board for this branch.",
    path: `/staff/${locationId}`,
    noIndex: true,
  });
}

export default async function StaffBoardPage({ params }: BoardPageProps) {
  const payload = await getPayload();
  const session = await (
    payload as unknown as {
      betterAuth: { api: { getSession: (opts: { headers: Headers }) => Promise<{ user?: { role?: string } } | null> } };
    }
  ).betterAuth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/sign-in");
  }
  if (!(session.user.role ?? "").includes("admin")) {
    redirect("/staff");
  }

  const { locationId } = await params;
  const numericId = /^\d+$/.test(locationId)
    ? Number(locationId)
    : locationId;
  let locationName = `Branch #${locationId}`;
  try {
    const loc = await payload.findByID({
      collection: "locations",
      id: numericId,
    });
    const name = (loc as { name?: string }).name;
    if (name) locationName = name;
  } catch {
    // Stay with the fallback label.
  }

  return (
    <BoardClient
      locationId={locationId}
      locationName={locationName}
    />
  );
}
