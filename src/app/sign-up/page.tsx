"use client";

import { SignUp } from "@stackframe/stack";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-semibold tracking-widest text-gray-300 uppercase">
              Trading Terminal
            </span>
          </div>
          <p className="text-gray-500 text-sm">Create your account</p>
        </div>
        <SignUp fullPage={false} />
      </div>
    </div>
  );
}
