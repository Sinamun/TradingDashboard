'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, authClient, signOut } from '@/lib/auth-client';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [nameValue, setNameValue] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSaved, setNameSaved] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Pre-fill name input once session loads (only on first load)
  const sessionName = session?.user.name ?? '';

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  if (!session) {
    router.replace('/sign-in');
    return null;
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    setNameSaved(false);
    const trimmed = nameValue.trim();
    if (!trimmed) { setNameError('Name cannot be empty'); return; }
    setNameLoading(true);
    try {
      const res = await authClient.updateUser({ name: trimmed });
      if (res.error) { setNameError(res.error.message ?? 'Failed to update name'); return; }
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch {
      setNameError('Network error');
    } finally {
      setNameLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSaved(false);
    if (!currentPw) { setPwError('Current password is required'); return; }
    if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      const res = await authClient.changePassword({ currentPassword: currentPw, newPassword: newPw });
      if (res.error) { setPwError(res.error.message ?? 'Failed to change password'); return; }
      setPwSaved(true);
      setCurrentPw('');
      setNewPw('');
      setTimeout(() => setPwSaved(false), 2500);
    } catch {
      setPwError('Network error');
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== 'delete') {
      setDeleteError('Type "delete" to confirm');
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/user/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setDeleteError(data.error ?? 'Failed to delete account');
        return;
      }
      await signOut();
      router.push('/sign-in');
    } catch {
      setDeleteError('Network error');
    } finally {
      setDeleteLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50';
  const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

  return (
    <div className="min-h-screen bg-gray-950 font-[var(--font-inter)]">
      <header className="border-b border-gray-800 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-300 transition-colors text-sm">
            ← Back
          </Link>
          <span className="text-gray-700">|</span>
          <h1 className="text-sm font-semibold tracking-widest text-gray-300 uppercase">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* Display Name */}
        <section className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Display Name</h2>
          <form onSubmit={handleSaveName} className="space-y-3">
            <div>
              <label className={labelClass}>Name</label>
              <input
                className={inputClass}
                value={nameValue || sessionName}
                onChange={(e) => setNameValue(e.target.value)}
                placeholder={sessionName || 'Your name'}
              />
            </div>
            {nameError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">{nameError}</p>
            )}
            {nameSaved && (
              <p className="text-xs text-emerald-400">Name updated.</p>
            )}
            <button
              type="submit"
              disabled={nameLoading}
              className="w-full py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
            >
              {nameLoading ? 'Saving…' : 'Save Name'}
            </button>
          </form>
        </section>

        {/* Email (read-only) */}
        <section className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Email</h2>
          <div>
            <label className={labelClass}>Email address</label>
            <input
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              value={session.user.email}
              readOnly
              disabled
            />
            <p className="mt-1.5 text-xs text-gray-600">Email cannot be changed.</p>
          </div>
        </section>

        {/* Change Password */}
        <section className="rounded-lg border border-gray-800 bg-gray-900/50 p-5">
          <h2 className="text-sm font-semibold text-gray-200 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                className={inputClass}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                autoComplete="new-password"
                placeholder="Min 8 characters"
              />
            </div>
            {pwError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">{pwError}</p>
            )}
            {pwSaved && (
              <p className="text-xs text-emerald-400">Password changed.</p>
            )}
            <button
              type="submit"
              disabled={pwLoading}
              className="w-full py-2 rounded-md text-sm font-semibold bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              {pwLoading ? 'Saving…' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-red-900/50 bg-gray-900/50 p-5">
          <h2 className="text-sm font-semibold text-red-400 mb-1">Danger Zone</h2>
          <p className="text-xs text-gray-500 mb-4">
            Permanently deletes your account and all positions. This cannot be undone.
          </p>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Type <span className="text-red-400 font-mono">delete</span> to confirm</label>
              <input
                className={`${inputClass} border-red-900/50 focus:border-red-500 focus:ring-red-500/50`}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="delete"
              />
            </div>
            {deleteError && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded px-3 py-2">{deleteError}</p>
            )}
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirm !== 'delete'}
              className="w-full py-2 rounded-md text-sm font-semibold bg-red-800 text-red-200 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {deleteLoading ? 'Deleting…' : 'Delete Account'}
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
