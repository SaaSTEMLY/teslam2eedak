"use client";

import { useEffect, useRef, useState } from "react";

interface ChannelEvent {
  event: string;
  data: Record<string, unknown>;
}

interface UseSaaSignalChannelOptions {
  channel: string;
  onEvent: (event: ChannelEvent) => void;
  enabled?: boolean;
}

export function useSaaSignalChannel({
  channel,
  onEvent,
  enabled = true,
}: UseSaaSignalChannelOptions) {
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let es: EventSource | null = null;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/saasignal/browser-token", {
          method: "POST",
        });
        if (!res.ok || cancelled) return;

        const { token, subscribeUrl } = await res.json();
        if (cancelled) return;

        const url =
          subscribeUrl ??
          `https://api.saasignal.com/infra/channels/${encodeURIComponent(channel)}/subscribe?token=${encodeURIComponent(token)}`;

        es = new EventSource(url);

        es.onopen = () => {
          if (!cancelled) setConnected(true);
        };
        es.onerror = () => {
          if (!cancelled) setConnected(false);
        };

        es.onmessage = (msg) => {
          try {
            const parsed = JSON.parse(msg.data) as ChannelEvent;
            onEventRef.current(parsed);
          } catch {
            // Ignore malformed messages
          }
        };
      } catch (err) {
        console.error("SaaSignal channel connection failed:", err);
        if (!cancelled) setConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      es?.close();
      setConnected(false);
    };
  }, [channel, enabled]);

  return { connected };
}
