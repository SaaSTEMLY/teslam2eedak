import type { Metadata } from "next";

import { generatePageMetadata } from "@/lib/seo";

import { QrPayClient } from "./qr-pay-client";

interface PayPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PayPageProps): Promise<Metadata> {
  const { id } = await params;
  return generatePageMetadata({
    title: `Pay for order #${id} — Koffee Kulture`,
    description: "Complete your card payment to send the order to the bar.",
    path: `/orders/${id}/pay`,
    noIndex: true,
  });
}

export default async function PayPage({ params }: PayPageProps) {
  const { id } = await params;
  return <QrPayClient orderId={id} />;
}
