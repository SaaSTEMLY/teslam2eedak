/**
 * Pure helpers for building a cart line item from a selected menu item +
 * modifiers + size + quantity. Used by the item sheet (client) and by the
 * cart route handlers (server), so it must stay framework-agnostic.
 */

export interface SizeOption {
  readonly label: string;
  readonly value: string;
  readonly priceQirsh: number;
}

export interface ModifierOption {
  readonly value: string;
  readonly label: string;
  readonly priceDelta: number;
}

export interface ModifierGroupSelection {
  readonly groupSlug: string;
  readonly groupLabel: string;
  readonly minSelectable: number;
  readonly maxSelectable: number;
  readonly options: ReadonlyArray<ModifierOption>;
  readonly selectedValues: ReadonlyArray<string>;
}

export interface LineItemInput {
  /** Base item price in qirsh when no size variant is chosen. */
  readonly basePriceQirsh: number;
  readonly sizes: ReadonlyArray<SizeOption>;
  readonly selectedSizeValue: string | null;
  readonly modifierGroups: ReadonlyArray<ModifierGroupSelection>;
  readonly quantity: number;
}

export interface LineItemResult {
  readonly unitPriceQirsh: number;
  readonly amountQirsh: number;
  readonly sizeLabel: string | null;
}

function resolveUnitPrice(input: LineItemInput): { unitPriceQirsh: number; sizeLabel: string | null } {
  if (input.sizes.length > 0 && input.selectedSizeValue) {
    const size = input.sizes.find((s) => s.value === input.selectedSizeValue);
    if (size) return { unitPriceQirsh: size.priceQirsh, sizeLabel: size.label };
  }
  return { unitPriceQirsh: input.basePriceQirsh, sizeLabel: null };
}

function sumModifierDeltas(groups: ReadonlyArray<ModifierGroupSelection>): number {
  let total = 0;
  for (const group of groups) {
    for (const value of group.selectedValues) {
      const opt = group.options.find((o) => o.value === value);
      if (opt) total += opt.priceDelta;
    }
  }
  return total;
}

export function computeLineItemAmount(input: LineItemInput): LineItemResult {
  const qty = Math.max(1, Math.floor(input.quantity));
  const { unitPriceQirsh, sizeLabel } = resolveUnitPrice(input);
  const modifierDelta = sumModifierDeltas(input.modifierGroups);
  const perUnit = unitPriceQirsh + modifierDelta;
  return {
    unitPriceQirsh: perUnit,
    amountQirsh: perUnit * qty,
    sizeLabel,
  };
}

// ── Modifier validation ────────────────────────────────────────────────────

export type ModifierValidationError =
  | {
      readonly kind: "below-min";
      readonly groupSlug: string;
      readonly required: number;
      readonly selected: number;
    }
  | {
      readonly kind: "above-max";
      readonly groupSlug: string;
      readonly maximum: number;
      readonly selected: number;
    }
  | {
      readonly kind: "unknown-option";
      readonly groupSlug: string;
      readonly value: string;
    };

export function validateModifierSelection(
  groups: ReadonlyArray<ModifierGroupSelection>,
): ReadonlyArray<ModifierValidationError> {
  const errors: ModifierValidationError[] = [];
  for (const group of groups) {
    const selected = group.selectedValues.length;
    if (selected < group.minSelectable) {
      errors.push({
        kind: "below-min",
        groupSlug: group.groupSlug,
        required: group.minSelectable,
        selected,
      });
    }
    if (selected > group.maxSelectable) {
      errors.push({
        kind: "above-max",
        groupSlug: group.groupSlug,
        maximum: group.maxSelectable,
        selected,
      });
    }
    for (const value of group.selectedValues) {
      if (!group.options.some((o) => o.value === value)) {
        errors.push({
          kind: "unknown-option",
          groupSlug: group.groupSlug,
          value,
        });
      }
    }
  }
  return errors;
}
