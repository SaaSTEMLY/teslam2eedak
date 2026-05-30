const messages = {
  lastUpdated: "Last updated:",
} as const;

export default messages;
export type LegalMessages = Record<keyof typeof messages, string>;
