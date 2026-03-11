import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { getMigrations } from "better-auth/db/migration";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

  const auth = betterAuth({
    database: new PostgresDialect({ pool }),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }: { user: { email: string }, url: string }) => {
        console.log("[DEV] Verify:", user.email, url);
      },
    },
  });

  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
  console.log("Tables to create:", toBeCreated.map((t) => t.table));
  console.log("Fields to add:", toBeAdded.map((t) => t.table));

  if (toBeCreated.length > 0 || toBeAdded.length > 0) {
    await runMigrations();
    console.log("Migrations complete.");
  } else {
    console.log("Already up to date.");
  }

  await pool.end();
}

main().catch(console.error);
