import { getLocale } from "@/lib/locale";
import { getMessages } from "@/lib/i18n";
import { CartDrawer } from "./cart-drawer";

export async function CartDrawerWrapper() {
  const locale = await getLocale();
  const messages = await getMessages("cart");

  return <CartDrawer locale={locale} translations={messages} />;
}
