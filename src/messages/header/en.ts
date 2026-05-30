const messages = {
  skipToContent: "Skip to content",
  home: "Home",
  products: "Products",
  blog: "Blog",
  contact: "Contact",
  about: "About",
  login: "Login",
  cart: "Cart",
  cartWithCount: "Cart ({count})",
  accountSettings: "Account Settings",
  openMenu: "Open menu",
  closeMenu: "Close menu",
  chooseColorScheme: "Choose color scheme",
  apiDocs: "API Docs",
} as const;

export default messages;
export type HeaderMessages = Record<keyof typeof messages, string>;
