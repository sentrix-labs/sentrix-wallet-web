'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWalletStore } from '@/lib/store';
import { getAddressInfo, getTokenBalance } from '@/lib/api';
import SendSRX from './SendSRX';
import SendSNTX from './SendSNTX';
import TxHistory from './TxHistory';
import { Copy, Check, RefreshCw, LogOut, Send, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';

const SNTX_CONTRACT = process.env.NEXT_PUBLIC_SNTX_CONTRACT || '';

export default function Dashboard() {
  const { address, clearWallet } = useWalletStore();
  const [srxBalance, setSrxBalance] = useState<number>(0);
  const [sntxBalance, setSntxBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<'main' | 'send-srx' | 'send-sntx' | 'history'>('main');

  const fetchBalances = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [addrInfo, tokenInfo] = await Promise.all([
        getAddressInfo(address).catch(() => null),
        SNTX_CONTRACT ? getTokenBalance(SNTX_CONTRACT, address).catch(() => null) : null,
      ]);
      setSrxBalance(addrInfo?.balance_srx ?? 0);
      setSntxBalance(tokenInfo?.balance ?? 0);
    } catch {
      toast.error('Failed to fetch balances');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { fetchBalances(); }, [fetchBalances]);

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Address copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const truncate = (s: string) => s.slice(0, 10) + '...' + s.slice(-6);

  if (view === 'send-srx') return <SendSRX onBack={() => { setView('main'); fetchBalances(); }} />;
  if (view === 'send-sntx') return <SendSNTX onBack={() => { setView('main'); fetchBalances(); }} />;
  if (view === 'history') return <TxHistory onBack={() => setView('main')} />;

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold" style={{ color: '#0F172A' }}>
            Sentrix<span style={{ color: '#10b981' }}>.</span>
          </h1>
          <div className="flex items-center gap-1">
            <button
              onClick={fetchBalances}
              disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: '#F1F5F9' }}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} style={{ color: '#94A3B8' }} />
            </button>
            <button
              onClick={clearWallet}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{ background: '#F1F5F9' }}
            >
              <LogOut className="w-4 h-4" style={{ color: '#94A3B8' }} />
            </button>
          </div>
        </div>

        {/* Address Card */}
        <button
          onClick={copyAddress}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}
        >
          <span className="text-sm font-mono" style={{ color: '#64748B' }}>
            {address ? truncate(address) : ''}
          </span>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: copied ? '#ECFDF5' : '#F1F5F9' }}>
            {copied ? <Check className="w-4 h-4" style={{ color: '#10b981' }} /> : <Copy className="w-4 h-4" style={{ color: '#94A3B8' }} />}
          </div>
        </button>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* SRX Card */}
          <div
            className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-default relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 8px 24px rgba(16,185,129,0.3)' }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10">SRX</p>
            <p className="text-white text-2xl font-extrabold mt-2 relative z-10 leading-tight">
              {loading ? '—' : srxBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </p>
            <p className="text-white/60 text-xs mt-1 relative z-10">Sentrix Native</p>
          </div>

          {/* SNTX Card */}
          <div
            className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-default relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 8px 24px rgba(124,58,237,0.3)' }}
          >
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <p className="text-white/80 text-xs font-semibold uppercase tracking-wider relative z-10">SNTX</p>
            <p className="text-white text-2xl font-extrabold mt-2 relative z-10 leading-tight">
              {loading ? '—' : sntxBalance.toLocaleString()}
            </p>
            <p className="text-white/60 text-xs mt-1 relative z-10">Sentrix Token</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setView('send-srx')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
          >
            <Send className="w-4 h-4" />
            Send SRX
          </button>
          <button
            onClick={() => setView('send-sntx')}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-[1.03] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)', boxShadow: '0 4px 16px rgba(124,58,237,0.3)' }}
          >
            <Send className="w-4 h-4" />
            Send SNTX
          </button>
        </div>

        {/* History */}
        <button
          onClick={() => setView('history')}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] group"
          style={{ background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}
        >
          <span className="text-sm font-semibold" style={{ color: '#64748B' }}>Transaction History</span>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: '#CBD5E1' }} />
        </button>
      </div>
    </div>
  );
}
