import { getMergedOpenAPISpec } from "@/lib/docs/openapi-merger";
import { generateLlmsTxt } from "@/lib/docs/generators/llms-txt";

export const dynamic = "force-dynamic";

export async function GET() {
  const spec = await getMergedOpenAPISpec("public");
  const text = generateLlmsTxt(spec);
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
