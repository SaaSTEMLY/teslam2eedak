"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Code,
  Plus,
  Copy,
  Check,
  Trash2,
  Key,
  Loader2,
  ExternalLink,
  ShoppingBag,
  ShoppingCart,
  Package,
  Star,
  Heart,
  Search,
  MapPin,
  CreditCard,
  Receipt,
  MessageSquare,
  Mail,
  Tag,
  Sparkles,
  BookOpen,
  Shield,
  KeyRound,
  Link2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  SCOPE_GROUPS,
  ALL_SCOPES,
  type ApiScope,
  scopesToPermissions,
  permissionsToScopes,
} from "@/lib/api-key/scopes";
import { parseApiKeyMetadata } from "@/lib/api-key/metadata";
import type developerEn from "@/messages/developer/en";

// ── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Package,
  Receipt,
  Tag,
  MapPin,
  CreditCard,
  Star,
  Heart,
  Search,
  Sparkles,
  MessageSquare,
  Mail,
  KeyRound,
};

// ── Scope → translation key map ─────────────────────────────────────────────

const SCOPE_I18N: Record<
  ApiScope,
  { label: keyof typeof developerEn; desc: keyof typeof developerEn }
> = {
  "content:read": { label: "scopeContentRead", desc: "scopeContentReadDesc" },
  "products:read": {
    label: "scopeProductsRead",
    desc: "scopeProductsReadDesc",
  },
  "cart:read": { label: "scopeCartRead", desc: "scopeCartReadDesc" },
  "cart:write": { label: "scopeCartWrite", desc: "scopeCartWriteDesc" },
  "orders:read": { label: "scopeOrdersRead", desc: "scopeOrdersReadDesc" },
  "payments:read": {
    label: "scopePaymentsRead",
    desc: "scopePaymentsReadDesc",
  },
  "discounts:read": {
    label: "scopeDiscountsRead",
    desc: "scopeDiscountsReadDesc",
  },
  "addresses:read": {
    label: "scopeAddressesRead",
    desc: "scopeAddressesReadDesc",
  },
  "addresses:write": {
    label: "scopeAddressesWrite",
    desc: "scopeAddressesWriteDesc",
  },
  "billing:read": { label: "scopeBillingRead", desc: "scopeBillingReadDesc" },
  "billing:write": {
    label: "scopeBillingWrite",
    desc: "scopeBillingWriteDesc",
  },
  "reviews:read": { label: "scopeReviewsRead", desc: "scopeReviewsReadDesc" },
  "reviews:write": {
    label: "scopeReviewsWrite",
    desc: "scopeReviewsWriteDesc",
  },
  "wishlist:read": {
    label: "scopeWishlistRead",
    desc: "scopeWishlistReadDesc",
  },
  "wishlist:write": {
    label: "scopeWishlistWrite",
    desc: "scopeWishlistWriteDesc",
  },
  "search:read": { label: "scopeSearchRead", desc: "scopeSearchReadDesc" },
  "recommendations:read": {
    label: "scopeRecommendationsRead",
    desc: "scopeRecommendationsReadDesc",
  },
  "contact:write": {
    label: "scopeContactWrite",
    desc: "scopeContactWriteDesc",
  },
  "newsletter:write": {
    label: "scopeNewsletterWrite",
    desc: "scopeNewsletterWriteDesc",
  },
  "tokens:read": {
    label: "scopeTokensRead",
    desc: "scopeTokensReadDesc",
  },
  "tokens:write": {
    label: "scopeTokensWrite",
    desc: "scopeTokensWriteDesc",
  },
};

// ── Types ────────────────────────────────────────────────────────────────────

interface ApiKeyItem {
  id: string;
  name: string | null;
  start: string | null;
  prefix: string | null;
  enabled: boolean;
  expiresAt: string | null;
  createdAt: string;
  permissions: Record<string, string[]> | null;
  metadata: unknown;
}

interface DeveloperCardProps {
  translations: typeof developerEn;
}

const EXPIRY_OPTIONS = [
  { value: "0", labelKey: "expirationNever" as const },
  { value: "30", labelKey: "expiration30" as const },
  { value: "60", labelKey: "expiration60" as const },
  { value: "90", labelKey: "expiration90" as const },
  { value: "365", labelKey: "expiration365" as const },
];

// ── Scope Selector Component ─────────────────────────────────────────────────

function ScopeSelector({
  selected,
  onToggle,
  onSelectAll,
  onDeselectAll,
  t,
}: {
  selected: Set<ApiScope>;
  onToggle: (scope: ApiScope) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  t: typeof developerEn;
}) {
  const allSelected = selected.size === ALL_SCOPES.length;

  return (
    <div className="space-y-3">
      {/* Header with select all + count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t.scopes}</span>
          {selected.size > 0 && (
            <Badge variant="secondary" className="text-xs tabular-nums">
              {t.scopesSelected.replace("{count}", String(selected.size))}
            </Badge>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs h-7"
          onClick={allSelected ? onDeselectAll : onSelectAll}
        >
          {allSelected ? t.deselectAll : t.selectAll}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{t.scopesDescription}</p>

      {/* Scope groups grid */}
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SCOPE_GROUPS.map((group) => {
          const Icon = ICON_MAP[group.icon] || Code;
          const groupScopes = group.scopes as unknown as ApiScope[];
          const allGroupSelected = groupScopes.every((s) => selected.has(s));
          const someGroupSelected = groupScopes.some((s) => selected.has(s));

          return (
            <div
              key={group.resource}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                someGroupSelected
                  ? "border-primary/30 bg-primary/[0.03]"
                  : "border-border bg-card hover:border-muted-foreground/20",
              )}
            >
              {/* Group header — click to toggle all scopes in group */}
              <button
                type="button"
                onClick={() => {
                  if (allGroupSelected) {
                    groupScopes.forEach((s) => {
                      if (selected.has(s)) onToggle(s);
                    });
                  } else {
                    groupScopes.forEach((s) => {
                      if (!selected.has(s)) onToggle(s);
                    });
                  }
                }}
                className="flex items-center gap-2 w-full text-start mb-2"
              >
                <Icon
                  className={cn(
                    "size-3.5 shrink-0 transition-colors",
                    someGroupSelected
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {group.label}
                </span>
              </button>

              {/* Scope pills */}
              <div className="flex flex-wrap gap-1.5">
                {groupScopes.map((scope) => {
                  const i18n = SCOPE_I18N[scope];
                  const isOn = selected.has(scope);
                  return (
                    <button
                      key={scope}
                      type="button"
                      onClick={() => onToggle(scope)}
                      title={t[i18n.desc]}
                      className={cn(
                        "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-all",
                        "border cursor-pointer select-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        isOn
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
                      )}
                    >
                      {isOn && <Check className="size-3 me-1 shrink-0" />}
                      {t[i18n.label]}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function DeveloperCard({ translations: t }: DeveloperCardProps) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  // Create form state
  const [keyName, setKeyName] = useState("");
  const [expiryDays, setExpiryDays] = useState("0");
  const [selectedScopes, setSelectedScopes] = useState<Set<ApiScope>>(
    new Set(),
  );

  // Key reveal state
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadKeys = useCallback(async () => {
    try {
      const result = await authClient.apiKey.list();
      if (result.data) {
        setKeys(result.data as unknown as ApiKeyItem[]);
      }
    } catch {
      toast.error(t.failedToLoad);
    } finally {
      setLoading(false);
    }
  }, [t.failedToLoad]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    if (!keyName.trim()) {
      toast.error(t.nameRequired);
      return;
    }
    if (selectedScopes.size === 0) {
      toast.error(t.scopeRequired);
      return;
    }

    setCreating(true);
    try {
      const permissions = scopesToPermissions([...selectedScopes]);
      const result = await authClient.apiKey.create({
        name: keyName.trim(),
        prefix: "sk_",
        ...(expiryDays !== "0" && { expiresInDays: Number(expiryDays) }),
        permissions,
      });

      if (result.data?.key) {
        setRevealedKey(result.data.key);
        setShowCreate(false);
        setKeyName("");
        setExpiryDays("0");
        setSelectedScopes(new Set());
        await loadKeys();
      }
    } catch {
      toast.error(t.failedToCreate);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      // Use cascade revoke endpoint to delete key and all descendants
      const res = await fetch("/api/tokens/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId: id }),
      });
      if (!res.ok) throw new Error("revoke failed");

      // Remove the key and any children from local state
      const descendantIds = getDescendantIds(id, keys);
      setKeys((prev) => prev.filter((k) => !descendantIds.has(k.id)));
      setConfirmRevokeId(null);
      toast.success(t.keyRevoked);
    } catch {
      toast.error(t.failedToRevoke);
    } finally {
      setRevokingId(null);
    }
  };

  /** Collect the target key + all descendants via metadata.parentKeyId. */
  function getDescendantIds(
    rootId: string,
    allKeys: ApiKeyItem[],
  ): Set<string> {
    const ids = new Set<string>();
    const queue = [rootId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      ids.add(current);
      for (const k of allKeys) {
        const meta = parseApiKeyMetadata(k.metadata);
        if (meta?.parentKeyId === current && !ids.has(k.id)) {
          queue.push(k.id);
        }
      }
    }
    return ids;
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = useCallback((scope: ApiScope) => {
    setSelectedScopes((prev) => {
      const next = new Set(prev);
      if (next.has(scope)) next.delete(scope);
      else next.add(scope);
      return next;
    });
  }, []);

  const selectAllScopes = useCallback(() => {
    setSelectedScopes(new Set(ALL_SCOPES));
  }, []);

  const deselectAllScopes = useCallback(() => {
    setSelectedScopes(new Set());
  }, []);

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatus = useMemo(
    () => (key: ApiKeyItem) => {
      if (!key.enabled)
        return { label: t.disabled, className: "text-muted-foreground" };
      if (isExpired(key.expiresAt))
        return { label: t.expired, className: "text-destructive" };
      return {
        label: t.active,
        className: "text-green-600 dark:text-green-400",
      };
    },
    [t],
  );

  // ── Key Reveal ───────────────────────────────────────────────────────
  if (revealedKey) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <Check className="size-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t.keyCreated}</h3>
              <p className="text-sm text-muted-foreground">
                {t.keyCreatedDescription}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
            <code className="flex-1 break-all text-sm font-mono">
              {revealedKey}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(revealedKey)}
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="ms-1">{copied ? t.copied : t.copyKey}</span>
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setRevealedKey(null)}>{t.done}</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Layout ──────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted">
              <Code className="size-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              {t.learnMore}
              <ExternalLink className="size-3" />
            </a>
            <Button onClick={() => setShowCreate(true)} size="sm">
              <Plus className="size-4 me-1" />
              {t.createKey}
            </Button>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="rounded-lg border bg-card p-6 space-y-5">
          <h4 className="font-semibold">{t.createKey}</h4>

          {/* Name + Expiration row */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.keyName}</label>
              <input
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder={t.keyNamePlaceholder}
                maxLength={32}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t.expiration}</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t[opt.labelKey]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scope Selector */}
          <ScopeSelector
            selected={selectedScopes}
            onToggle={toggleScope}
            onSelectAll={selectAllScopes}
            onDeselectAll={deselectAllScopes}
            t={t}
          />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              onClick={() => setShowCreate(false)}
              size="sm"
            >
              {t.cancel}
            </Button>
            <Button onClick={handleCreate} disabled={creating} size="sm">
              {creating && <Loader2 className="size-4 me-1 animate-spin" />}
              {creating ? t.creating : t.create}
            </Button>
          </div>
        </div>
      )}

      {/* Key List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Key className="mx-auto size-10 text-muted-foreground/50 mb-3" />
          <h4 className="font-medium">{t.noKeys}</h4>
          <p className="text-sm text-muted-foreground mt-1">
            {t.noKeysDescription}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card divide-y">
          {keys.map((apiKey) => {
            const status = getStatus(apiKey);
            const scopes = permissionsToScopes(apiKey.permissions);
            const meta = parseApiKeyMetadata(apiKey.metadata);
            const isSubToken = meta?.createdVia === "delegation";
            const canDelegate = scopes.includes("tokens:write");
            return (
              <div
                key={apiKey.id}
                className="flex items-center justify-between p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {apiKey.name || "Unnamed key"}
                    </span>
                    <Badge
                      variant={
                        status.label === t.active ? "default" : "secondary"
                      }
                      className={cn(
                        "text-[10px] px-1.5",
                        status.label === t.expired &&
                          "bg-destructive/10 text-destructive border-destructive/20",
                        status.label === t.active &&
                          "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                      )}
                    >
                      {status.label}
                    </Badge>
                    {isSubToken && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 gap-1"
                        title={t.subTokenOf.replace(
                          "{name}",
                          meta.parentKeyName ?? "—",
                        )}
                      >
                        <Link2 className="size-3" />
                        {t.subToken}
                      </Badge>
                    )}
                    {canDelegate && (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 gap-1 border-primary/30 text-primary"
                      >
                        <KeyRound className="size-3" />
                        {t.canDelegate}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <code className="font-mono">
                      {apiKey.prefix}
                      {apiKey.start}...
                    </code>
                    <span>
                      {t.created}{" "}
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      {t.expiresLabel}{" "}
                      {apiKey.expiresAt
                        ? new Date(apiKey.expiresAt).toLocaleDateString()
                        : t.never}
                    </span>
                  </div>
                  {scopes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {scopes.map((scope) => (
                        <span
                          key={scope}
                          className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ms-4 shrink-0">
                  {confirmRevokeId === apiKey.id ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmRevokeId(null)}
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevoke(apiKey.id)}
                        disabled={revokingId === apiKey.id}
                      >
                        {revokingId === apiKey.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          t.confirm
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRevokeId(apiKey.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
