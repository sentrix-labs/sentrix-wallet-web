'use client';

import { useState } from 'react';
import { useWalletStore } from '@/lib/store';
import { getAddressInfo, getNonce, sendTransaction } from '@/lib/api';
import { signTransaction, buildTxid, privateKeyToPublicKey } from '@/lib/crypto';
import { ArrowLeft, Loader2, Check, Copy, Send, Clipboard } from 'lucide-react';
import toast from 'react-hot-toast';

const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID || 7119);
const MIN_FEE = 10000;
const SENTRI = 100_000_000;

export default function SendSRX({ onBack }: { onBack: () => void }) {
  const { address, privateKey } = useWalletStore();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [txid, setTxid] = useState('');
  const [txCopied, setTxCopied] = useState(false);

  const loadMax = async () => {
    if (!address) return;
    try {
      const info = await getAddressInfo(address);
      const bal = info?.balance_srx ?? 0;
      const max = bal - MIN_FEE / SENTRI;
      if (max > 0) setAmount(max.toFixed(4));
    } catch { /* ignore */ }
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setToAddress(text.trim());
  };

  const copyTxid = () => {
    navigator.clipboard.writeText(txid);
    setTxCopied(true);
    setTimeout(() => setTxCopied(false), 2000);
  };

  const feeDisplay = (MIN_FEE / SENTRI).toFixed(4);
  const totalDisplay = amount ? (parseFloat(amount) + MIN_FEE / SENTRI).toFixed(4) : '0.0000';

  const handleSend = async () => {
    if (!address || !privateKey) return;
    if (!toAddress.startsWith('0x') || toAddress.length !== 42) {
      toast.error('Invalid address');
      return;
    }
    const amountSrx = parseFloat(amount);
    if (isNaN(amountSrx) || amountSrx <= 0) {
      toast.error('Enter a valid amount');
      return;
    }

    setSending(true);
    try {
      const nonce = await getNonce(address);
      const amountSentri = Math.floor(amountSrx * SENTRI);
      const timestamp = Math.floor(Date.now() / 1000);

      const payload = {
        from: address, to: toAddress, amount: amountSentri, fee: MIN_FEE,
        nonce, data: '', timestamp, chain_id: CHAIN_ID,
      };

      const signature = await signTransaction(payload, privateKey);
      const publicKey = privateKeyToPublicKey(privateKey);
      const computedTxid = buildTxid(payload);

      const result = await sendTransaction({
        txid: computedTxid, from_address: address, to_address: toAddress,
        amount: amountSentri, fee: MIN_FEE, nonce, data: '', timestamp,
        chain_id: CHAIN_ID, signature, public_key: publicKey,
      });

      if (result.success) {
        setTxid(computedTxid);
        toast.success('Transaction sent!');
      } else {
        toast.error(result.error || 'Failed');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-sm">
        <button onClick={onBack} className="flex items-center gap-2 mb-5 text-sm font-medium transition-colors active:scale-95" style={{ color: '#64748B' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #E2E8F0' }}>
          {/* Gradient Header */}
          <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Send SRX</h2>
                <p className="text-white/70 text-xs">Native token transfer</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            {/* To */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>Recipient</label>
              <div className="relative">
                <input
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl p-3.5 pr-12 text-sm font-mono focus:outline-none transition-all"
                  style={{ background: '#F1F5F9', border: '2px solid transparent', color: '#0F172A' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                />
                <button onClick={handlePaste} className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90" style={{ background: '#E2E8F0' }}>
                  <Clipboard className="w-3.5 h-3.5" style={{ color: '#64748B' }} />
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#64748B' }}>Amount</label>
              <div className="relative">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.0001"
                  className="w-full rounded-xl p-3.5 pr-16 text-sm focus:outline-none transition-all"
                  style={{ background: '#F1F5F9', border: '2px solid transparent', color: '#0F172A' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
                />
                <button onClick={loadMax} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold px-2.5 py-1 rounded-lg transition-all active:scale-90" style={{ background: '#ECFDF5', color: '#059669' }}>
                  MAX
                </button>
              </div>
            </div>

            {/* Fee/Total */}
            <div className="rounded-xl p-4 space-y-2" style={{ background: '#F8FAFC' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: '#94A3B8' }}>Network fee</span>
                <span style={{ color: '#64748B' }}>{feeDisplay} SRX</span>
              </div>
              <div className="flex justify-between text-sm pt-1" style={{ borderTop: '1px solid #E2E8F0' }}>
                <span className="font-medium" style={{ color: '#64748B' }}>Total</span>
                <span className="font-bold" style={{ color: '#0F172A' }}>{totalDisplay} SRX</span>
              </div>
            </div>

            {/* Result */}
            {txid ? (
              <div className="rounded-xl p-4" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#10b981' }}>
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#059669' }}>Sent!</span>
                </div>
                <button onClick={copyTxid} className="flex items-center gap-1 text-xs font-mono break-all transition-colors" style={{ color: '#047857' }}>
                  {txid.slice(0, 20)}...{txid.slice(-8)}
                  {txCopied ? <Check className="w-3 h-3 shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                </button>
              </div>
            ) : (
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending...' : 'Send SRX'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
