import { headers } from "next/headers";

export async function GET() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") || "http";
  const specUrl = `${protocol}://${host}/api/openapi.json`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Documentation</title>
  <link rel="icon" type="image/x-icon" href="/logo/main/favicon.ico" />
</head>
<body>
  <script
    id="api-reference"
    data-url="${specUrl}"
    data-configuration='${JSON.stringify({
      theme: "kepler",
      hiddenClients: [],
      defaultHttpClient: { targetKey: "javascript", clientKey: "fetch" },
      metaData: { title: "API Documentation" },
    })}'
  ></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference@1.28"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
