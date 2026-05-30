const ALLOW_TEST_IN_PROD = true;

/**
 * Environment Variable Validation
 *
 * This module validates critical environment variables at startup
 * to prevent deploying with missing security configurations.
 */

const CRITICAL_ENV_VARS = [
  {
    name: "STRIPE_WEBHOOK_SECRET",
    required: true,
    pattern: /^whsec_/,
    errorMessage:
      "⚠️  CRITICAL: STRIPE_WEBHOOK_SECRET is not set!\n" +
      "   Without this, anyone can send fake payment webhooks and create fraudulent orders.\n" +
      "   Get this from: Stripe Dashboard → Developers → Webhooks → Signing secret\n" +
      "   Expected format: whsec_...",
  },
  {
    name: "STRIPE_SECRET_KEY",
    required: true,
    pattern: /^sk_(test|live)_/,
    errorMessage:
      "STRIPE_SECRET_KEY is missing or invalid.\n" +
      "   Expected format: sk_test_... or sk_live_...",
  },
  {
    name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    required: true,
    pattern: /^pk_(test|live)_/,
    errorMessage:
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing or invalid.\n" +
      "   Expected format: pk_test_... or pk_live_...",
  },
  {
    name: "PAYLOAD_SECRET",
    required: true,
    minLength: 32,
    errorMessage:
      "PAYLOAD_SECRET must be set and at least 32 characters long for security.",
  },
  {
    name: "BETTER_AUTH_SECRET",
    required: true,
    minLength: 32,
    errorMessage:
      "BETTER_AUTH_SECRET must be set and at least 32 characters long for security.",
  },
  {
    name: "RESEND_API_KEY",
    required: process.env.NODE_ENV === "production",
    pattern: /^re_/,
    errorMessage:
      "RESEND_API_KEY is required for all transactional emails.\n" +
      "   Get this from: https://resend.com — API Keys\n" +
      "   Expected format: re_...\n" +
      "   (In local dev, emails are logged to console instead.)",
  },
  {
    name: "SAASIGNAL_TOKEN",
    required: true,
    pattern: /^sk_live_/,
    errorMessage:
      "SAASIGNAL_TOKEN is required for search, analytics, channels, and jobs.\n" +
      "   Get this from: https://saasignal.com — Project → API Keys\n" +
      "   Expected format: sk_live_...",
  },
];

const WARNINGS = {
  DEV_MODE_KEYS: [
    {
      name: "STRIPE_SECRET_KEY",
      devPrefix: "sk_test_",
      prodPrefix: "sk_live_",
    },
    {
      name: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      devPrefix: "pk_test_",
      prodPrefix: "pk_live_",
    },
  ],
  DATABASE: {
    name: "DATABASE_URL",
    localPattern: /^file:/,
    remotePattern: /^libsql:/,
  },
};

interface ValidationError {
  variable: string;
  message: string;
  severity: "error" | "warning";
}

export function validateEnvironment(): {
  isValid: boolean;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  // Check critical environment variables
  for (const config of CRITICAL_ENV_VARS) {
    const value = process.env[config.name];

    if (!value) {
      if (config.required) {
        errors.push({
          variable: config.name,
          message: config.errorMessage,
          severity: "error",
        });
      }
      continue;
    }

    // Check pattern if specified
    if (config.pattern && !config.pattern.test(value)) {
      errors.push({
        variable: config.name,
        message: config.errorMessage,
        severity: "error",
      });
    }

    // Check minimum length if specified
    if (config.minLength && value.length < config.minLength) {
      errors.push({
        variable: config.name,
        message: config.errorMessage,
        severity: "error",
      });
    }
  }

  // Production-specific warnings
  if (isProduction && !ALLOW_TEST_IN_PROD) {
    for (const check of WARNINGS.DEV_MODE_KEYS) {
      const value = process.env[check.name];
      if (value?.startsWith(check.devPrefix)) {
        errors.push({
          variable: check.name,
          message:
            `⚠️  WARNING: Using TEST mode Stripe keys in PRODUCTION!\n` +
            `   You are using "${check.devPrefix}..." keys in production.\n` +
            `   Switch to "${check.prodPrefix}..." keys before going live!`,
          severity: "warning",
        });
      }
    }
  }

  // Database configuration warnings
  const databaseUrl =
    process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (isProduction && databaseUrl) {
    // Check for local file path in production
    if (WARNINGS.DATABASE.localPattern.test(databaseUrl)) {
      errors.push({
        variable: "DATABASE_URL",
        message:
          `❌ CRITICAL: Using local SQLite file in PRODUCTION!\n` +
          `   Current value: ${databaseUrl}\n` +
          `   Local file databases don't work in Vercel's serverless environment.\n` +
          `   Solution: Use Turso (libSQL) for production.\n` +
          `   1. Create a Turso database: https://turso.tech\n` +
          `   2. Set DATABASE_URL=libsql://your-db.turso.io\n` +
          `   3. Set DATABASE_AUTH_TOKEN=your_turso_token\n` +
          `   OR use: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN\n` +
          `   See DEPLOYMENT.md for full setup guide.`,
        severity: "error",
      });
    }

    // Check for missing auth token with remote database
    const authToken =
      process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;
    if (WARNINGS.DATABASE.remotePattern.test(databaseUrl) && !authToken) {
      errors.push({
        variable: "DATABASE_AUTH_TOKEN",
        message:
          `❌ CRITICAL: DATABASE_AUTH_TOKEN is required for remote databases!\n` +
          `   You are using a remote database (${databaseUrl})\n` +
          `   but neither DATABASE_AUTH_TOKEN nor TURSO_AUTH_TOKEN is set.\n` +
          `   Get your token from: turso db tokens create <database-name>`,
        severity: "error",
      });
    }
  }

  return {
    isValid: errors.filter((e) => e.severity === "error").length === 0,
    errors,
  };
}

/**
 * Print environment validation errors and exit if critical issues found
 */
export function validateEnvironmentOrExit(): void {
  const { isValid, errors } = validateEnvironment();

  if (errors.length > 0) {
    console.error("\n" + "=".repeat(80));
    console.error("🔒 ENVIRONMENT CONFIGURATION ISSUES DETECTED");
    console.error("=".repeat(80) + "\n");

    const criticalErrors = errors.filter((e) => e.severity === "error");
    const warnings = errors.filter((e) => e.severity === "warning");

    if (criticalErrors.length > 0) {
      console.error("❌ CRITICAL ERRORS:\n");
      criticalErrors.forEach((error) => {
        console.error(`Variable: ${error.variable}`);
        console.error(error.message);
        console.error("");
      });
    }

    if (warnings.length > 0) {
      console.warn("⚠️  WARNINGS:\n");
      warnings.forEach((warning) => {
        console.warn(`Variable: ${warning.variable}`);
        console.warn(warning.message);
        console.warn("");
      });
    }

    console.error("=".repeat(80) + "\n");

    if (!isValid) {
      console.error(
        "❌ Application startup aborted due to critical configuration errors.",
      );
      console.error(
        "   Please fix the above issues in your .env file and try again.\n",
      );
      process.exit(1);
    } else {
      console.warn(
        "⚠️  Application starting with warnings. Please review the issues above.\n",
      );
    }
  }
}

// Auto-validate when imported in production
if (process.env.NODE_ENV === "production") {
  validateEnvironmentOrExit();
}
