import { SaaSignalClient } from "saasignal";

let _client: SaaSignalClient | null = null;

function getClient(): SaaSignalClient {
  if (!process.env.SAASIGNAL_TOKEN) {
    throw new Error(
      "SAASIGNAL_TOKEN is required. Set it in your .env file to enable search, analytics, channels, and background jobs.",
    );
  }
  if (!_client) {
    _client = new SaaSignalClient({ token: process.env.SAASIGNAL_TOKEN });
  }
  return _client;
}

// ─── Search ──────────────────────────────────────────────

export async function searchQuery(
  indexId: string,
  query: string,
  opts: { limit?: number; filters?: Record<string, unknown> } = {},
) {
  const client = getClient();
  const res = await client.infra.decisioning.search.query(indexId, {
    query_text: query,
    limit: opts.limit ?? 10,
    ...(opts.filters ? { filter: opts.filters } : {}),
  });
  return {
    hits: res.results.map((r) => ({
      id: r.id,
      score: r.score,
      document: (r.metadata ?? {}) as Record<string, unknown>,
    })),
  };
}

export async function searchSuggest(indexId: string, query: string, limit = 5) {
  const client = getClient();
  return await client.infra.decisioning.search.suggest(indexId, {
    prefix: query,
    limit,
  });
}

export async function searchUpsertDocuments(
  indexId: string,
  documents: Record<string, unknown>[],
) {
  const client = getClient();
  return await client.infra.decisioning.search.upsertDocuments(indexId, {
    documents: documents as Array<{
      id: string;
      text?: string | null;
      metadata?: Record<string, unknown> | null;
    }>,
  });
}

export async function searchDeleteDocument(indexId: string, docId: string) {
  const client = getClient();
  await client.infra.decisioning.search.deleteDocument(indexId, docId);
  return {};
}

// ─── Ranking / Recommendations ───────────────────────────

export async function rankingIngestSignals(
  collectionId: string,
  signals: {
    userId: string;
    itemId: string;
    signal: string;
    weight?: number;
  }[],
) {
  const client = getClient();
  return await client.infra.decisioning.ranking.ingestSignals(collectionId, {
    signals: signals.map((s) => ({
      subject_id: s.userId,
      item_id: s.itemId,
      event: s.signal,
      weight: s.weight,
    })),
  });
}

export async function rankingRelated(
  collectionId: string,
  itemId: string,
  limit = 6,
) {
  const client = getClient();
  const res = await client.infra.decisioning.ranking.related(collectionId, {
    item_id: itemId,
    limit,
  });
  return {
    items: res.results.map((r) => ({
      id: r.item_id,
      score: r.score,
      metadata: r.metadata,
    })),
  };
}

export async function rankingUpsertItems(
  collectionId: string,
  items: { id: string; metadata?: Record<string, unknown> }[],
) {
  const client = getClient();
  return await client.infra.decisioning.ranking.upsertItems(collectionId, {
    items,
  });
}

// ─── Channels (Real-time) ────────────────────────────────

export async function channelPublish(
  channel: string,
  event: string,
  data: Record<string, unknown>,
) {
  const client = getClient();
  return await client.infra.channels.publish(channel, event, data);
}

export function channelSubscribeUrl(channel: string) {
  const client = getClient();
  return client.infra.channels.subscribeUrl(channel);
}

// ─── Background Jobs ─────────────────────────────────────

export async function jobCreate(
  queue: string,
  payload: Record<string, unknown>,
  opts?: { handler?: string; maxAttempts?: number },
) {
  const client = getClient();
  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
  return await client.infra.jobs.create({
    name: queue,
    trigger: { type: "queue", queue },
    payload,
    handler: opts?.handler ?? `${baseUrl}/api/jobs/process`,
    max_attempts: opts?.maxAttempts ?? 3,
  });
}

// ─── KV (Key-Value Store) ────────────────────────────────

export async function kvGet(key: string) {
  const client = getClient();
  try {
    return await client.infra.kv.get(key);
  } catch {
    return null;
  }
}

export async function kvSet(
  key: string,
  value: unknown,
  opts?: { ttl?: number },
) {
  const client = getClient();
  return await client.infra.kv.set(key, value, { ttl: opts?.ttl });
}

export async function kvIncrement(key: string, delta = 1) {
  const client = getClient();
  return await client.infra.kv.increment(key, delta);
}

export async function kvDelete(key: string) {
  const client = getClient();
  return await client.infra.kv.delete(key);
}

// ─── Browser Token ───────────────────────────────────────

export async function createBrowserToken(scopes?: string[]) {
  if (!process.env.SAASIGNAL_TOKEN) {
    throw new Error("SAASIGNAL_TOKEN is required to create browser tokens.");
  }
  return await SaaSignalClient.createBrowserToken({
    apiKey: process.env.SAASIGNAL_TOKEN,
    scopes: scopes ?? ["channels:subscribe"],
  });
}
