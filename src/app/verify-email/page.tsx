"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResend() {
    setError(null);
    const { error } = await authClient.sendVerificationEmail({
      email: "",  // Better Auth reads from session
      callbackURL: "/dashboard",
    });
    if (error) {
      setError(error.message ?? "Failed to resend. Try signing in again.");
    } else {
      setResent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-semibold tracking-widest text-gray-300 uppercase">
            Trading Terminal
          </span>
        </div>

        <h1 className="text-lg font-semibold text-gray-100 mb-2">Check your inbox</h1>
        <p className="text-sm text-gray-400 mb-6">
          We&apos;ve sent a verification link to your email address. Click the link to activate your account.
        </p>

        {resent ? (
          <p className="text-emerald-400 text-sm mb-4">Verification email resent.</p>
        ) : (
          <button
            onClick={handleResend}
            className="w-full rounded-md bg-gray-800 hover:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-200 transition-colors mb-4"
          >
            Resend verification email
          </button>
        )}

        {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

        <Link href="/sign-in" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
