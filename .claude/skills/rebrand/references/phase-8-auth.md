# Phase 8: Auth Pages

## 8.1 Auth UI Messages

**`src/messages/auth/{en,ar,es}.ts`** — Auth flow text (sign in, sign up, forgot password, etc.)
**`src/messages/auth-ui/{en,ar,es}.ts`** — Auth UI component text.

## 8.2 Account Pages

**`src/messages/account/{en,ar,es}.ts`** — Account settings page text. Includes:

- **Wishlist tab** (`src/components/account/wishlist-card.tsx`)
- **Order status listener** (`src/components/account/order-status-listener.tsx`)

Both pull text from `account` and `wishlist` i18n namespaces.

## 8.3 Auth Branded Card

**`src/components/auth/branded-auth-card.tsx`** — Update if it contains hardcoded brand elements.

## 8.4 Google OAuth

**`.env`:**

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Google Cloud Console:

1. Create OAuth 2.0 Client ID
2. Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
3. Authorized JavaScript origins: `https://yourdomain.com`
