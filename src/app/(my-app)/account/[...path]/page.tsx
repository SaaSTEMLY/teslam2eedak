import { AccountPageContent } from "@/components/account/account-page-content";
import { getMessages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";

export default async function AccountPage() {
  const messages = await getMessages("account");
  const addCardMessages = await getMessages("add-card-dialog");
  const wishlistMessages = await getMessages("wishlist");
  const developerMessages = await getMessages("developer");
  const locale = await getLocale();

  return (
    <AccountPageContent
      translations={messages}
      addCardTranslations={addCardMessages}
      wishlistTranslations={wishlistMessages}
      developerTranslations={developerMessages}
      locale={locale}
    />
  );
}
