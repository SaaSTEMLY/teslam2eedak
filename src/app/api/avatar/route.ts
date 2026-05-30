import { createAvatar } from "@dicebear/core";
import * as notionists from "@dicebear/notionists";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seed = url.searchParams.get("seed");

  if (!seed) {
    return NextResponse.json(
      { error: "Missing seed parameter" },
      { status: 400 },
    );
  }

  const avatar = createAvatar(notionists, { seed });
  const svg = avatar.toString();

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
