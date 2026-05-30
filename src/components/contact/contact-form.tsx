import { getMessages } from "@/lib/i18n";
import { ContactFormClient } from "./contact-form-client";

export async function ContactForm() {
  const messages = await getMessages("contact");
  return <ContactFormClient messages={messages} />;
}
