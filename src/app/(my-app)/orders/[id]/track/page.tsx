import type { Metadata } from "next";

import { generatePageMetadata } from "@/lib/seo";

import { TrackerClient } from "./tracker-client";

interface TrackPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: TrackPageProps): Promise<Metadata> {
  const { id } = await params;
  return generatePageMetadata({
    title: `Order #${id} — Koffee Kulture`,
    description: "Track your Koffee Kulture order — live status from the bar.",
    path: `/orders/${id}/track`,
    noIndex: true,
  });
}

export default async function TrackPage({ params }: TrackPageProps) {
  const { id } = await params;
  return <TrackerClient orderId={id} />;
}
