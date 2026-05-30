import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getPayload } from "@/lib/payload";
import { headers } from "next/headers";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Staff — Koffee Kulture",
  description: "Live Orders Board for Koffee Kulture branches.",
  path: "/staff",
  noIndex: true,
});

interface LocationDoc {
  id: string | number;
  name?: string;
  slug?: string;
  status?: string;
}

export default async function StaffIndexPage() {
  const payload = await getPayload();
  const session = await (
    payload as unknown as {
      betterAuth: { api: { getSession: (opts: { headers: Headers }) => Promise<{ user?: { role?: string } } | null> } };
    }
  ).betterAuth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/staff");
  }
  if (!(session.user.role ?? "").includes("admin")) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold">Staff access required</h1>
          <p className="text-muted-foreground">
            Your account doesn&rsquo;t have staff permissions yet. Ask a
            manager to grant you the admin role.
          </p>
        </div>
      </main>
    );
  }

  const { docs } = await payload.find({
    collection: "locations",
    where: { status: { equals: "active" } },
    limit: 50,
  });

  const locations = (docs as LocationDoc[]).filter((l) => Boolean(l.slug));

  return (
    <main className="min-h-[80vh] py-12 px-4" id="main-content">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Staff
          </p>
          <h1 className="font-serif text-3xl font-bold">
            Live Orders Board
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a branch to see incoming, in-progress, and ready orders.
          </p>
        </header>

        {locations.length === 0 ? (
          <p className="text-muted-foreground">
            No active branches yet. Add one in the admin panel.
          </p>
        ) : (
          <ul className="grid gap-3">
            {locations.map((loc) => (
              <li key={String(loc.id)}>
                <Link
                  href={`/staff/${loc.id}`}
                  className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition"
                >
                  <h2 className="font-semibold text-lg">{loc.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    /{loc.slug}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
