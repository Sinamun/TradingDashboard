'use client';

import { useState, useEffect } from 'react';

type AssetType = 'stock' | 'call' | 'put';
type Currency = 'USD' | 'GBP' | 'EUR' | 'GBX';

interface FormState {
  ticker: string;
  display_name: string;
  asset_type: AssetType;
  entry_price: string;
  quantity: string;
  currency: Currency;
  platform: string;
  strike: string;
  expiry: string;
  source: string;
  notes: string;
}

export interface EditValues {
  id: string;
  ticker: string;
  display_name: string | null;
  asset_type: AssetType;
  entry: number;
  qty: number;
  currency: string;
  platform: string;
  strike: string | null;
  expiry: string | null;
  source: string | null;
  notes: string | null;
}

const DEFAULT_FORM: FormState = {
  ticker: '',
  display_name: '',
  asset_type: 'stock',
  entry_price: '',
  quantity: '',
  currency: 'USD',
  platform: 'ibkr',
  strike: '',
  expiry: '',
  source: '',
  notes: '',
};

const PLATFORM_OPTIONS = [
  { value: 'ibkr', label: 'IBKR' },
  { value: 'freetrade', label: 'FreeTrade' },
  { value: 'trading212', label: 'Trading212' },
  { value: 'crypto', label: 'Crypto' },
];

const inputClass =
  'w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50';
const labelClass = 'block text-xs font-medium text-gray-400 mb-1';

export default function PositionModal({
  isOpen,
  onClose,
  onSuccess,
  editValues,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editValues?: EditValues;
}) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Populate form when editValues changes
  useEffect(() => {
    if (editValues) {
      setForm({
        ticker: editValues.ticker,
        display_name: editValues.display_name ?? '',
        asset_type: editValues.asset_type,
        entry_price: String(editValues.entry),
        quantity: String(editValues.qty),
        currency: (editValues.currency as Currency) || 'USD',
        platform: editValues.platform || 'ibkr',
        strike: editValues.strike ?? '',
        expiry: editValues.expiry ?? '',
        source: editValues.source ?? '',
        notes: editValues.notes ?? '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setError(null);
  }, [editValues, isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOption = form.asset_type === 'call' || form.asset_type === 'put';
  const isEdit = !!editValues;

  function set(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Client-side required validation
    if (!form.ticker.trim()) { setError('Ticker is required'); return; }
    if (!form.entry_price || Number(form.entry_price) <= 0) { setError('Entry price must be positive'); return; }
    if (!form.quantity || Number(form.quantity) <= 0) { setError('Quantity must be positive'); return; }
    if (isOption && !form.strike) { setError('Strike price is required for options'); return; }
    if (isOption && !form.expiry) { setError('Expiry date is required for options'); return; }

    setLoading(true);
    try {
      const payload = {
        ticker: form.ticker.trim().toUpperCase(),
        display_name: form.display_name.trim() || null,
        yahoo_ticker: null,
        asset_type: form.asset_type,
        entry_price: form.entry_price,
        quantity: form.quantity,
        currency: form.currency,
        platform: form.platform || 'ibkr',
        strike: isOption ? form.strike : null,
        expiry: isOption ? form.expiry : null,
        source: form.source.trim() || null,
        notes: form.notes.trim() || null,
      };

      const url = isEdit ? `/api/positions/${editValues.id}` : '/api/positions';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string };
        setError(data.error ?? 'Something went wrong');
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError('Network error — please try again');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-gray-200 uppercase tracking-wider">
            {isEdit ? 'Edit Position' : 'Add Position'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Ticker + Display Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Ticker *</label>
              <input
                className={inputClass}
                placeholder="PLTR, ARCG.L"
                value={form.ticker}
                onChange={(e) => set('ticker', e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className={labelClass}>Display Name</label>
              <input
                className={inputClass}
                placeholder="Company name"
                value={form.display_name}
                onChange={(e) => set('display_name', e.target.value)}
              />
            </div>
          </div>

          {/* Asset Type */}
          <div>
            <label className={labelClass}>Asset Type *</label>
            <div className="flex gap-1.5">
              {(['stock', 'call', 'put'] as AssetType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('asset_type', t)}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors border ${
                    form.asset_type === t
                      ? t === 'stock'
                        ? 'bg-gray-700 text-gray-200 border-gray-600'
                        : t === 'call'
                        ? 'bg-cyan-900/60 text-cyan-300 border-cyan-700'
                        : 'bg-amber-900/60 text-amber-300 border-amber-700'
                      : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-600 hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Options fields (conditional) */}
          {isOption && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Strike Price *</label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className={inputClass}
                  placeholder="150.00"
                  value={form.strike}
                  onChange={(e) => set('strike', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Expiry Date *</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.expiry}
                  onChange={(e) => set('expiry', e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* Entry Price + Quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Entry Price *</label>
              <input
                type="number"
                step="any"
                min="0"
                className={inputClass}
                placeholder="0.00"
                value={form.entry_price}
                onChange={(e) => set('entry_price', e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass}>{isOption ? 'Contracts *' : 'Quantity *'}</label>
              <input
                type="number"
                step="any"
                min="0"
                className={inputClass}
                placeholder={isOption ? '1' : '10'}
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Currency + Platform */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Currency *</label>
              <select
                className={inputClass}
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                <option value="USD">USD — US Dollar</option>
                <option value="GBP">GBP — British Pound</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBX">GBX — Pence (UK stocks)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Platform</label>
              <select
                className={inputClass}
                value={form.platform}
                onChange={(e) => set('platform', e.target.value)}
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Source */}
          <div>
            <label className={labelClass}>Source (who recommended this?)</label>
            <input
              className={inputClass}
              placeholder="e.g. Charlie"
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={2}
              placeholder="Thesis, context…"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-md text-sm text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
