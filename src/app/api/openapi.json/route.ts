import { getMergedOpenAPISpec } from "@/lib/docs/openapi-merger";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = await getMergedOpenAPISpec("public");
  return Response.json(spec, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
