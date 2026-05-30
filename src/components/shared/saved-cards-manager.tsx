"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreditCard,
  Pencil,
  Trash2,
  Plus,
  Check,
  Loader2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface CardBillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  metadata: Record<string, string>;
  billingAddress: CardBillingAddress;
}

interface SavedCardsManagerProps {
  // Display mode
  mode?: "list" | "radio";

  // Radio mode props
  selectedCardId?: string;
  onCardSelect?: (cardId: string) => void;
  showNewCardOption?: boolean;

  // List mode props
  onSetDefault?: (cardId: string) => void;

  // Common props
  onCardsChange?: (cards: SavedCard[]) => void;
  className?: string;

  // Translations
  translations: {
    // Card display
    endingIn?: string;
    expires?: string;
    defaultCardBadge?: string;

    // Actions
    edit: string;
    remove: string;
    setAsDefault?: string;
    addCard: string;

    // Empty state
    noCardsTitle?: string;
    noCardsDescription?: string;

    // Edit dialog
    editCardTitle: string;
    editCardDescription: string;
    cardNickname?: string;
    cardNicknamePlaceholder: string;
    billingAddress: string;
    firstName: string;
    firstNamePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    address: string;
    addressPlaceholder: string;
    addressLine2?: string;
    addressLine2Placeholder: string;
    city: string;
    cityPlaceholder: string;
    state: string;
    statePlaceholder: string;
    postalCode: string;
    postalCodePlaceholder: string;
    country: string;
    cancel: string;
    save: string;
    saving?: string;

    // Delete dialog
    removeCardTitle: string;
    removeCardDescription: string;
    removeCardDescriptionNoAlias: string;
    removeCardButton: string;
    removing?: string;

    // Toasts
    toastCardUpdated: string;
    toastCardUpdateFailed: string;
    toastCardRemoved: string;
    toastCardRemoveFailed: string;
    toastDefaultUpdated?: string;
    toastDefaultFailed?: string;
    toastLoadFailed?: string;
  };

  // Option to add new card
  onAddNewCard?: () => void;
}

const INPUT_CLS =
  "h-11 rounded-xl border-border/50 bg-background/50 focus:border-primary/50 focus:ring-primary/20 focus:ring-4 transition-all duration-200";

function formatBrand(brand: string): string {
  const brands: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    diners: "Diners",
    jcb: "JCB",
    unionpay: "UnionPay",
  };
  return brands[brand] || brand.charAt(0).toUpperCase() + brand.slice(1);
}

export function SavedCardsManager({
  mode = "list",
  selectedCardId,
  onCardSelect,
  showNewCardOption = false,
  onSetDefault,
  onCardsChange,
  className,
  translations: t,
  onAddNewCard,
}: SavedCardsManagerProps) {
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<SavedCard | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SavedCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/billing");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      const fetchedCards: SavedCard[] = data.cards ?? [];
      setCards(fetchedCards);
      onCardsChange?.(fetchedCards);
    } catch {
      if (t.toastLoadFailed) {
        toast.error(t.toastLoadFailed);
      }
    } finally {
      setIsLoading(false);
    }
  }, [onCardsChange, t.toastLoadFailed]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleSetDefault = useCallback(
    async (cardId: string) => {
      if (!onSetDefault) return;
      setIsSettingDefault(cardId);

      try {
        const res = await fetch("/api/billing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "set-default",
            paymentMethodId: cardId,
          }),
        });

        if (!res.ok) throw new Error("Failed to set default");

        setCards((prev) =>
          prev.map((c) => ({ ...c, isDefault: c.id === cardId })),
        );

        if (t.toastDefaultUpdated) {
          toast.success(t.toastDefaultUpdated);
        }

        onSetDefault(cardId);
      } catch {
        if (t.toastDefaultFailed) {
          toast.error(t.toastDefaultFailed);
        }
      } finally {
        setIsSettingDefault(null);
      }
    },
    [onSetDefault, t.toastDefaultUpdated, t.toastDefaultFailed],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/billing?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Failed to delete");

      const updatedCards = cards.filter((c) => c.id !== deleteTarget.id);
      setCards(updatedCards);
      onCardsChange?.(updatedCards);

      toast.success(t.toastCardRemoved);
    } catch {
      toast.error(t.toastCardRemoveFailed);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }, [
    deleteTarget,
    cards,
    onCardsChange,
    t.toastCardRemoved,
    t.toastCardRemoveFailed,
  ]);

  const handleCardSaved = useCallback(() => {
    setEditingCard(null);
    fetchCards();
  }, [fetchCards]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-10 text-center",
          className,
        )}
      >
        <div className="flex items-center justify-center size-14 rounded-2xl bg-muted/60 mb-4">
          <CreditCard className="size-6 text-muted-foreground" />
        </div>
        {t.noCardsTitle && (
          <p className="text-sm font-medium text-foreground mb-1">
            {t.noCardsTitle}
          </p>
        )}
        {t.noCardsDescription && (
          <p className="text-xs text-muted-foreground mb-5 max-w-xs">
            {t.noCardsDescription}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onAddNewCard}
          className="rounded-xl gap-1.5"
        >
          <Plus className="size-3.5" />
          {t.addCard}
        </Button>
      </div>
    );
  }

  if (mode === "radio") {
    return (
      <div className={className}>
        <div className="space-y-2">
          {cards.map((card) => (
            <SavedCardRadioItem
              key={card.id}
              card={card}
              isSelected={selectedCardId === card.id}
              onSelect={() => onCardSelect?.(card.id)}
              onEdit={() => setEditingCard(card)}
              onDelete={() => setDeleteTarget(card)}
              translations={t}
            />
          ))}

          {showNewCardOption && (
            <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 bg-background/30 hover:border-border transition-all duration-200">
              <input
                type="radio"
                value="new"
                id="payment-new"
                checked={selectedCardId === "new"}
                onChange={() => onCardSelect?.("new")}
                className="size-4"
              />
              <Label
                htmlFor="payment-new"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <Plus className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{t.addCard}</span>
              </Label>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <EditCardDialog
          card={editingCard}
          open={!!editingCard}
          onOpenChange={(open) => {
            if (!open) setEditingCard(null);
          }}
          onSaved={handleCardSaved}
          translations={t}
        />

        {/* Delete Dialog */}
        <DeleteCardDialog
          card={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          translations={t}
        />
      </div>
    );
  }

  // List mode
  return (
    <div className={className}>
      <div className="space-y-2">
        {cards.map((card) => (
          <SavedCardListItem
            key={card.id}
            card={card}
            onEdit={() => setEditingCard(card)}
            onDelete={() => setDeleteTarget(card)}
            onSetDefault={
              onSetDefault ? () => handleSetDefault(card.id) : undefined
            }
            isSettingDefault={isSettingDefault === card.id}
            translations={t}
          />
        ))}
      </div>

      {/* Edit Dialog */}
      <EditCardDialog
        card={editingCard}
        open={!!editingCard}
        onOpenChange={(open) => {
          if (!open) setEditingCard(null);
        }}
        onSaved={handleCardSaved}
        translations={t}
      />

      {/* Delete Dialog */}
      <DeleteCardDialog
        card={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        translations={t}
      />
    </div>
  );
}

// ─── Radio Item ──────────────────────────────────────────────────────

function SavedCardRadioItem({
  card,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  translations: t,
}: {
  card: SavedCard;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  translations: SavedCardsManagerProps["translations"];
}) {
  const alias = card.metadata?.alias;
  const brandLabel = formatBrand(card.brand);
  const expiry = `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`;

  return (
    <div
      onClick={onSelect}
      className="group flex items-center space-x-3 p-4 rounded-xl border border-border/50 bg-background/30 hover:border-border transition-all duration-200 cursor-pointer"
    >
      <input
        type="radio"
        value={card.id}
        id={`card-${card.id}`}
        checked={isSelected}
        onChange={onSelect}
        className="size-4"
      />
      <Label
        htmlFor={`card-${card.id}`}
        className="flex-1 cursor-pointer flex items-center gap-3"
      >
        <div className="flex items-center justify-center size-10 rounded-lg bg-muted/60 shrink-0">
          <CreditCard className="size-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-medium text-foreground">
              {alias || `${brandLabel} ${t.endingIn || "••••"} ${card.last4}`}
            </span>
            {card.isDefault && t.defaultCardBadge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {t.defaultCardBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {alias && `${brandLabel} ${t.endingIn || "••••"} ${card.last4} • `}
            {t.expires || "Exp"} {expiry}
          </p>
        </div>
      </Label>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onEdit();
          }}
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── List Item ───────────────────────────────────────────────────────

function SavedCardListItem({
  card,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
  translations: t,
}: {
  card: SavedCard;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault?: () => void;
  isSettingDefault: boolean;
  translations: SavedCardsManagerProps["translations"];
}) {
  const alias = card.metadata?.alias;
  const brandLabel = formatBrand(card.brand);
  const expiry = `${String(card.expMonth).padStart(2, "0")}/${String(card.expYear).slice(-2)}`;

  return (
    <div
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
        card.isDefault
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border/50 bg-background/30 hover:border-border",
      )}
    >
      {/* Card Icon */}
      <div
        className={cn(
          "flex items-center justify-center size-10 rounded-lg shrink-0",
          card.isDefault ? "bg-primary/10" : "bg-muted/60",
        )}
      >
        <CreditCard
          className={cn(
            "size-5",
            card.isDefault ? "text-primary" : "text-muted-foreground",
          )}
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground truncate">
            {alias || `${brandLabel} ${t.endingIn || "••••"} ${card.last4}`}
          </span>
          {card.isDefault && t.defaultCardBadge && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
              {t.defaultCardBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {alias && `${brandLabel} ${t.endingIn || "••••"} ${card.last4} • `}
          {t.expires || "Exp"} {expiry}
        </p>
        {card.billingAddress?.addressLine1 && (
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {card.billingAddress.addressLine1}
              {card.billingAddress.city && `, ${card.billingAddress.city}`}
              {card.billingAddress.state && `, ${card.billingAddress.state}`}
              {card.billingAddress.postalCode &&
                ` ${card.billingAddress.postalCode}`}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {!card.isDefault && onSetDefault && t.setAsDefault && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSetDefault}
            disabled={isSettingDefault}
            className="h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {isSettingDefault ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3 mr-1" />
            )}
            {t.setAsDefault}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="size-8 rounded-lg text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Edit Card Dialog ────────────────────────────────────────────────

function EditCardDialog({
  card,
  open,
  onOpenChange,
  onSaved,
  translations: t,
}: {
  card: SavedCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  translations: SavedCardsManagerProps["translations"];
}) {
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState<CardBillingAddress>({
    firstName: "",
    lastName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setAlias(card.metadata?.alias || "");
      setAddress({
        firstName: card.billingAddress?.firstName || "",
        lastName: card.billingAddress?.lastName || "",
        addressLine1: card.billingAddress?.addressLine1 || "",
        addressLine2: card.billingAddress?.addressLine2 || "",
        city: card.billingAddress?.city || "",
        state: card.billingAddress?.state || "",
        postalCode: card.billingAddress?.postalCode || "",
        country: card.billingAddress?.country || "US",
      });
    }
  }, [card]);

  function handleAddressChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!card) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-metadata",
          paymentMethodId: card.id,
          alias: alias.trim(),
          billingAddress: address,
        }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success(t.toastCardUpdated);
      onSaved();
    } catch {
      toast.error(t.toastCardUpdateFailed);
    } finally {
      setIsSaving(false);
    }
  }

  if (!card) return null;

  const brandLabel = formatBrand(card.brand);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">{t.editCardTitle}</DialogTitle>
          <DialogDescription>{t.editCardDescription}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/30 text-xs text-muted-foreground">
            <CreditCard className="size-3.5 shrink-0" />
            {brandLabel} {t.endingIn || "••••"} {card.last4}
          </div>

          {t.cardNickname && (
            <div className="space-y-2">
              <Label htmlFor="edit-alias">{t.cardNickname}</Label>
              <Input
                id="edit-alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder={t.cardNicknamePlaceholder}
                className={INPUT_CLS}
              />
            </div>
          )}

          <Separator />

          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <MapPin className="size-3.5 text-muted-foreground" />
            {t.billingAddress}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-firstName">{t.firstName}</Label>
              <Input
                id="edit-firstName"
                name="firstName"
                value={address.firstName}
                onChange={handleAddressChange}
                placeholder={t.firstNamePlaceholder}
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-lastName">{t.lastName}</Label>
              <Input
                id="edit-lastName"
                name="lastName"
                value={address.lastName}
                onChange={handleAddressChange}
                placeholder={t.lastNamePlaceholder}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-addressLine1">{t.address}</Label>
            <Input
              id="edit-addressLine1"
              name="addressLine1"
              value={address.addressLine1}
              onChange={handleAddressChange}
              placeholder={t.addressPlaceholder}
              className={INPUT_CLS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-addressLine2">
              {t.addressLine2 || "Address Line 2"}
            </Label>
            <Input
              id="edit-addressLine2"
              name="addressLine2"
              value={address.addressLine2}
              onChange={handleAddressChange}
              placeholder={t.addressLine2Placeholder}
              className={INPUT_CLS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-city">{t.city}</Label>
              <Input
                id="edit-city"
                name="city"
                value={address.city}
                onChange={handleAddressChange}
                placeholder={t.cityPlaceholder}
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-state">{t.state}</Label>
              <Input
                id="edit-state"
                name="state"
                value={address.state}
                onChange={handleAddressChange}
                placeholder={t.statePlaceholder}
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-postalCode">{t.postalCode}</Label>
              <Input
                id="edit-postalCode"
                name="postalCode"
                value={address.postalCode}
                onChange={handleAddressChange}
                placeholder={t.postalCodePlaceholder}
                className={INPUT_CLS}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-country">{t.country}</Label>
            <select
              id="edit-country"
              name="country"
              value={address.country}
              onChange={handleAddressChange}
              className="flex h-11 w-full rounded-xl border border-border/50 bg-background/50 px-3 py-2 text-sm shadow-xs transition-all duration-200 outline-none focus:border-primary/50 focus:ring-primary/20 focus:ring-4"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>

          <Separator />

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl"
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl font-semibold gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t.saving || t.save}
                </>
              ) : (
                t.save
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Card Dialog ──────────────────────────────────────────────

function DeleteCardDialog({
  card,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
  translations: t,
}: {
  card: SavedCard | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  translations: SavedCardsManagerProps["translations"];
}) {
  const alias = card?.metadata?.alias;
  const brandLabel = card ? formatBrand(card.brand) : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">{t.removeCardTitle}</DialogTitle>
          <DialogDescription>
            {alias
              ? t.removeCardDescription.replace("{card}", alias)
              : t.removeCardDescriptionNoAlias
                  .replace("{brand}", brandLabel)
                  .replace("{last4}", card?.last4 || "")}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="rounded-xl"
          >
            {t.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl font-semibold gap-2"
          >
            {isDeleting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            {isDeleting ? t.removing || t.removeCardButton : t.removeCardButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
