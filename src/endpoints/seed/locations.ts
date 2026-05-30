/**
 * KK location + tables seed. Single Maadi branch with five tables
 * matching the GOAL §10 success-criteria scenarios.
 */

export interface LocationSeed {
  readonly name: { en: string; ar: string; es?: string };
  readonly slug: string;
  readonly status: "active" | "inactive";
  readonly address: {
    readonly street: { en: string; ar: string };
    readonly city: { en: string; ar: string };
    readonly country: string;
    readonly latitude: number;
    readonly longitude: number;
  };
  readonly phone: string;
  readonly hours: ReadonlyArray<{
    readonly day:
      | "mon"
      | "tue"
      | "wed"
      | "thu"
      | "fri"
      | "sat"
      | "sun";
    readonly openTime: string;
    readonly closeTime: string;
  }>;
  readonly vatPercent: number;
  readonly serviceChargePercent: number;
  readonly allowedPaymentProviders: ReadonlyArray<string>;
  readonly averageOrderPrepMinutes: number;
}

export interface TableSeed {
  readonly label: string;
  readonly shortId: string;
  readonly status: "active" | "inactive";
  readonly capacity?: number;
}

export const locationSeed: LocationSeed = {
  name: { en: "Maadi", ar: "المعادي", es: "Maadi" },
  slug: "maadi",
  status: "active",
  address: {
    street: { en: "9 Road 233, Degla", ar: "٩ شارع ٢٣٣، دجلة" },
    city: { en: "Cairo", ar: "القاهرة" },
    country: "Egypt",
    latitude: 29.9602,
    longitude: 31.2569,
  },
  phone: "+20 2 0000 0000",
  hours: [
    { day: "mon", openTime: "07:00", closeTime: "23:00" },
    { day: "tue", openTime: "07:00", closeTime: "23:00" },
    { day: "wed", openTime: "07:00", closeTime: "23:00" },
    { day: "thu", openTime: "07:00", closeTime: "23:00" },
    { day: "fri", openTime: "07:00", closeTime: "23:00" },
    { day: "sat", openTime: "07:00", closeTime: "23:00" },
    { day: "sun", openTime: "07:00", closeTime: "23:00" },
  ],
  vatPercent: 14,
  serviceChargePercent: 12,
  allowedPaymentProviders: ["stripe", "cash-on-pickup"],
  averageOrderPrepMinutes: 8,
};

export const tableSeeds: ReadonlyArray<TableSeed> = [
  { label: "Table 1", shortId: "T1AAAA", status: "active", capacity: 2 },
  { label: "Table 2", shortId: "T2AAAA", status: "active", capacity: 2 },
  { label: "Table 3", shortId: "T3AAAA", status: "active", capacity: 4 },
  { label: "Window 1", shortId: "W1AAAA", status: "active", capacity: 4 },
  { label: "Patio 1", shortId: "P1AAAA", status: "inactive", capacity: 6 },
];
