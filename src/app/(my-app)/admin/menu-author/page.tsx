import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getPayload } from "@/lib/payload";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Menu Author — Koffee Kulture",
  description: "Draw hotspots on menu images and link them to items.",
  path: "/admin/menu-author",
  noIndex: true,
});

interface MenuImageOption {
  id: string;
  label: string;
  url: string;
}

const STATIC_MENU_IMAGES: ReadonlyArray<MenuImageOption> = [
  { id: "menu1", label: "Sip Into Summer (Drinks)", url: "/menu1.jpg" },
  { id: "menu2", label: "Breakfast", url: "/menu2.jpg" },
  { id: "menu3", label: "All Day", url: "/menu3.jpg" },
];

export default async function MenuAuthorIndex() {
  const payload = await getPayload();
  const session = await (
    payload as unknown as {
      betterAuth: { api: { getSession: (opts: { headers: Headers }) => Promise<{ user?: { role?: string } } | null> } };
    }
  ).betterAuth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth/sign-in?redirect=/admin/menu-author");
  }
  if (!(session.user.role ?? "").includes("admin")) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4">
        <p className="text-muted-foreground">Admin role required.</p>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh] py-12 px-4" id="main-content">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Admin
          </p>
          <h1 className="font-serif text-3xl font-bold">Menu Author</h1>
          <p className="text-sm text-muted-foreground">
            Pick a menu image, draw rectangles, and link each to a menu item.
            Coordinates are stored normalized so the same record renders at any
            display size.
          </p>
        </header>

        <ul className="grid sm:grid-cols-2 gap-3">
          {STATIC_MENU_IMAGES.map((img) => (
            <li key={img.id}>
              <Link
                href={`/admin/menu-author/${encodeURIComponent(img.id)}`}
                className="block rounded-2xl border border-border bg-card p-4 hover:border-primary/50 transition"
              >
                <h2 className="font-semibold text-lg">{img.label}</h2>
                <p className="text-xs text-muted-foreground">{img.url}</p>
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          Desktop only — drawing rectangles on a phone is awkward (GOAL §14).
        </p>
      </div>
    </main>
  );
}

export { STATIC_MENU_IMAGES };
