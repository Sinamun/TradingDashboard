import { betterAuth } from "better-auth";
import { Pool } from "pg";
import { PostgresDialect } from "kysely";
import { Resend } from "resend";
import { verificationEmail, resetPasswordEmail } from "./email-templates";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

const resend = new Resend(process.env.RESEND_BULLIST_KEY);

export const auth = betterAuth({
  database: new PostgresDialect({ pool }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: "Bullist <noreply@bullist.co>",
        to: user.email,
        subject: "Reset your Bullist password",
        html: resetPasswordEmail(user.name ?? "", url),
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "Bullist <noreply@bullist.co>",
        to: user.email,
        subject: "Verify your Bullist account",
        html: verificationEmail(user.name ?? "", url),
      });
    },
  },
});
