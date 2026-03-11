import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const auth = betterAuth({
  database: new PostgresDialect({ pool }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      // Phase 2: replace with Resend
      console.log(`[DEV] Verify email for ${user.email}: ${url}`);
    },
  },
});
