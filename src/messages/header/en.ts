const messages = {
  skipToContent: "Skip to content",
  home: "Home",
  menu: "Menu",
  products: "Menu",
  blog: "Blog",
  contact: "Visit",
  about: "About",
  login: "Login",
  cart: "Cart",
  cartWithCount: "Cart ({count})",
  accountSettings: "Account Settings",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  chooseColorScheme: "Choose color scheme",
  apiDocs: "API Docs",
  orderNowCta: "Order now",
} as const;

export default messages;
export type HeaderMessages = Record<keyof typeof messages, string>;
