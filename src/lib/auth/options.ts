import type {
  BetterAuthOptions,
  PayloadAuthOptions,
} from "payload-auth/better-auth";
import { nextCookies } from "better-auth/next-js";
import { passkey } from "@better-auth/passkey";
import { apiKey } from "better-auth/plugins";
import Stripe from "stripe";
import { brandedEmailHtml } from "../email/template";
import { sendEmail } from "../email/resend";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

/**
 * Check if Google OAuth is enabled based on environment variables
 * Use this server-side function to conditionally enable Google login
 */
export function isGoogleAuthEnabled(): boolean {
  return !!(googleClientId && googleClientSecret);
}

export const betterAuthOptions = {
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password — Koffee Kulture",
        html: await brandedEmailHtml({
          icon: "&#128274;",
          heading: "Reset Your Password",
          subheading: `Hi ${user.name || "there"}, we received a password reset request.`,
          preheader:
            "Use the link below to set a new password for your account.",
          body: `<p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">We received a request to reset the password for your account. Click the button below to choose a new password.</p>
                 <p style="margin: 16px 0 0; font-size: 14px; color: #8a8a8a; line-height: 1.6;">This link will expire shortly. If you didn't request a password reset, you can safely ignore this email.</p>`,
          ctaLabel: "Reset Password",
          ctaUrl: url,
        }),
      });
    },
  },
  session: {
    freshAge: 0,
  },
  ...(googleClientId &&
    googleClientSecret && {
      socialProviders: {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      },
    }),
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email — Koffee Kulture",
        html: await brandedEmailHtml({
          icon: "&#9993;",
          heading: "Verify Your Email",
          subheading: `Welcome${user.name ? `, ${user.name}` : ""}! Just one more step.`,
          preheader: "Please verify your email address to get started.",
          body: `<p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">Thanks for signing up! Please verify your email address by clicking the button below so you can start using your account.</p>`,
          ctaLabel: "Verify Email Address",
          ctaUrl: url,
        }),
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({ user, newEmail, url }) => {
        await sendEmail({
          to: newEmail,
          subject: "Confirm Email Change — Koffee Kulture",
          html: await brandedEmailHtml({
            icon: "&#128231;",
            heading: "Confirm Email Change",
            subheading: `Hi ${user.name || "there"}, please confirm your new email.`,
            preheader:
              "You requested to change your email address. Confirm to complete the update.",
            body: `<p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">You requested to change the email address on your account. Click the button below to confirm this change.</p>
                   <p style="margin: 16px 0 0; font-size: 14px; color: #8a8a8a; line-height: 1.6;">If you didn't request this change, you can safely ignore this email and your account will remain unchanged.</p>`,
            ctaLabel: "Confirm New Email",
            ctaUrl: url,
          }),
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, token }) => {
        const baseURL =
          process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";
        const deleteUrl = `${baseURL}/delete-account/confirm?token=${token}`;
        await sendEmail({
          to: user.email,
          subject: "Confirm Account Deletion — Koffee Kulture",
          html: await brandedEmailHtml({
            icon: "&#9888;",
            heading: "Confirm Account Deletion",
            subheading: `Hi ${user.name || "there"}, this action is permanent.`,
            preheader:
              "You requested to delete your account. Confirm to proceed.",
            body: `<p style="margin: 0; font-size: 15px; color: #4a4a4a; line-height: 1.7;">You requested to permanently delete your account. This action cannot be undone and all your data will be removed.</p>
                   <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 16px;">
                     <tr>
                       <td style="padding: 12px 16px; background: #fef2f2; border-radius: 8px;">
                         <p style="margin: 0; font-size: 14px; color: #dc2626; line-height: 1.6;">&#9888; This will permanently delete your account, saved addresses, and all associated data.</p>
                       </td>
                     </tr>
                   </table>
                   <p style="margin: 16px 0 0; font-size: 14px; color: #8a8a8a; line-height: 1.6;">If you didn't request this, you can safely ignore this email and your account will remain active.</p>`,
            ctaLabel: "Delete My Account",
            ctaUrl: deleteUrl,
          }),
        });
      },
      beforeDelete: async (user) => {
        const { getPayload } = await import("@/lib/payload");
        const payload = await getPayload();

        // Delete Stripe customer (removes all cards, payment methods, and addresses)
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
          apiVersion: "2026-01-28.clover",
        });

        // Look up stored Stripe customer ID first
        const users = await payload.find({
          collection: "users",
          where: { email: { equals: user.email } },
          limit: 1,
        });
        const storedCustomerId = (
          users.docs[0] as { stripeCustomerId?: string } | undefined
        )?.stripeCustomerId;

        if (storedCustomerId) {
          try {
            await stripe.customers.del(storedCustomerId);
          } catch {
            // Customer may already be deleted — fall through to email lookup
            const existing = await stripe.customers.list({
              email: user.email,
              limit: 1,
            });
            if (existing.data[0]) {
              await stripe.customers.del(existing.data[0].id);
            }
          }
        } else {
          const existing = await stripe.customers.list({
            email: user.email,
            limit: 1,
          });
          if (existing.data[0]) {
            await stripe.customers.del(existing.data[0].id);
          }
        }

        // Delete all saved addresses for this user
        await payload.delete({
          collection: "addresses",
          where: { customer: { equals: Number(user.id) } },
        });
      },
    },
  },
  databaseHooks: {
    user: {
      delete: {
        before: async (user) => {
          const { getPayload } = await import("@/lib/payload");
          const payload = await getPayload();

          const randomId = crypto.randomUUID().slice(0, 8);

          // Anonymize user data instead of hard deleting
          // Sessions and accounts are already deleted by Better-Auth's internalAdapter
          await payload.update({
            collection: "users",
            id: Number(user.id),
            data: {
              name: `deleted-user-${randomId}`,
              email: `deleted-${randomId}@deleted.local`,
              emailVerified: false,
              image: "",
            },
          });

          // Prevent the actual hard delete — keep the anonymized record
          return false;
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    passkey(),
    apiKey({
      enableSessionForAPIKeys: true,
      defaultPrefix: "sk_",
      defaultKeyLength: 64,
      enableMetadata: true,
      keyExpiration: {
        defaultExpiresIn: null,
        minExpiresIn: 1,
        maxExpiresIn: 365,
      },
      rateLimit: {
        enabled: true,
        timeWindow: 60000,
        maxRequests: 100,
      },
    }),
  ],
} satisfies BetterAuthOptions;

export const betterAuthPluginOptions = {
  betterAuthOptions,
  disableDefaultPayloadAuth: true,
  accounts: {
    hidden: true,
  },
  verifications: {
    hidden: true,
  },
  pluginCollectionOverrides: {
    passkeys: ({ collection }) => ({
      ...collection,
      admin: {
        ...(collection.admin ?? {}),
        hidden: true,
      },
    }),
    apiKeys: ({ collection }) => ({
      ...collection,
      admin: {
        ...(collection.admin ?? {}),
        hidden: true,
      },
    }),
  },
  users: {
    slug: "users",
    roles: ["user", "admin"] as const,
    defaultRole: "user",
    adminRoles: ["admin"],
    collectionOverrides: ({ collection }) => ({
      ...collection,
      fields: [
        ...collection.fields.map((field) => {
          // Enable image field to be returned in API responses
          if ("name" in field && field.name === "image") {
            return {
              ...field,
              saveToJWT: true,
            };
          }
          return field;
        }),
        {
          name: "stripeCustomerId",
          type: "text" as const,
          index: true,
          admin: {
            position: "sidebar" as const,
            readOnly: true,
          },
        },
      ],
    }),
  },
} satisfies PayloadAuthOptions;

export type ConstructedBetterAuthPluginOptions = typeof betterAuthPluginOptions;
