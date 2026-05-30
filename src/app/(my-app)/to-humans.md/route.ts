import { getMergedOpenAPISpec } from "@/lib/docs/openapi-merger";
import { generateHumansMd } from "@/lib/docs/generators/humans-md";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = await getMergedOpenAPISpec("public");
  const md = generateHumansMd(spec);
  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
