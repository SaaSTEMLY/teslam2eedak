/**
 * Pure cart accumulation primitives. The React cart context wraps these
 * with hooks + persistence; route handlers can also reuse them when
 * normalizing a client-submitted cart.
 *
 * A line entry is identified by a synthetic signature derived from
 * (itemId, sizeValue, sorted modifier selections, note). Identical configs
 * collapse into one line with quantity += newQty. Different configs of the
 * same item stay separate.
 */

/** Kept narrow so this module has no React/UI deps. The item-sheet
 * `ItemAddPayload` is intentionally structurally compatible with this
 * shape so the UI payload flows straight in. */
export interface CartLineSelection {
  readonly itemId: string | number;
  readonly sizeValue: string | null;
  readonly modifierSelections: ReadonlyArray<{
    readonly groupSlug: string;
    readonly optionValues: ReadonlyArray<string>;
  }>;
  readonly quantity: number;
  readonly note: string;
  readonly amountQirsh: number;
}

export interface CartLine extends CartLineSelection {
  readonly id: string;
}

export interface CartState {
  readonly lines: ReadonlyArray<CartLine>;
}

export const EMPTY_CART: CartState = { lines: [] };

function signatureFor(s: CartLineSelection): string {
  const modSig = [...s.modifierSelections]
    .map((g) => `${g.groupSlug}:${[...g.optionValues].sort().join(",")}`)
    .sort()
    .join("|");
  return [
    s.itemId,
    s.sizeValue ?? "",
    modSig,
    (s.note ?? "").trim(),
  ].join("§");
}

export function addToCart(
  state: CartState,
  selection: CartLineSelection,
): CartState {
  if (selection.quantity <= 0) return state;
  const sig = signatureFor(selection);
  const existing = state.lines.find((l) => l.id === sig);
  if (existing) {
    return {
      lines: state.lines.map((l) =>
        l.id === sig
          ? {
              ...l,
              quantity: l.quantity + selection.quantity,
              amountQirsh:
                (l.amountQirsh / l.quantity) *
                (l.quantity + selection.quantity),
            }
          : l,
      ),
    };
  }
  return {
    lines: [...state.lines, { ...selection, id: sig }],
  };
}

export function removeLine(state: CartState, lineId: string): CartState {
  return { lines: state.lines.filter((l) => l.id !== lineId) };
}

export function setLineQuantity(
  state: CartState,
  lineId: string,
  quantity: number,
): CartState {
  if (quantity <= 0) return removeLine(state, lineId);
  return {
    lines: state.lines.map((l) =>
      l.id === lineId
        ? {
            ...l,
            quantity,
            amountQirsh: (l.amountQirsh / l.quantity) * quantity,
          }
        : l,
    ),
  };
}

export function totalQuantity(state: CartState): number {
  return state.lines.reduce((acc, l) => acc + l.quantity, 0);
}

export function subtotalQirsh(state: CartState): number {
  return state.lines.reduce((acc, l) => acc + l.amountQirsh, 0);
}
