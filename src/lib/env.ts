/**
 * Environment variable validation.
 * Import this at the top of instrumentation.ts or layout.tsx to fail fast.
 */

const requiredVars = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "ANTHROPIC_API_KEY",
] as const;

const optionalVars = [
  "NEXTAUTH_URL",
  "DAILY_MESSAGE_LIMIT",
  "WEEKLY_CONVERSATION_LIMIT",
  "DAILY_COST_THRESHOLD_CENTS",
  "MONTHLY_COST_THRESHOLD_CENTS",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "See .env.example for the full list."
    );
  }

  // Warn about optional vars in development
  if (process.env.NODE_ENV === "development") {
    for (const key of optionalVars) {
      if (!process.env[key]) {
        console.warn(`[env] Optional variable ${key} is not set.`);
      }
    }
  }
}
