"use client";
import { useState } from 'react';
import { useReadContract } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS } from '@/lib/poap';
import Link from 'next/link';

export default function VerifyPage() {
  const [poapId, setPoapId] = useState('0');
  const [wallet, setWallet] = useState('');
  const [checked, setChecked] = useState(false);
  const idNum = Number(poapId) || 0;

  const { data: total } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'totalEvents' });
  const totalNum = total ? Number(total) : 0;
  const { data: hasClaimed, isFetching, refetch } = useReadContract({
    address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'hasClaimed',
    args: wallet && /^0x[a-fA-F0-9]{40}$/.test(wallet) ? [BigInt(idNum), wallet as `0x${string}`] : undefined,
    query: { enabled: false } as any
  });
  const { data: evt } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events', args: [BigInt(idNum)], query: { enabled: checked } as any });

  const doCheck = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) { alert('Enter a valid 0x address'); return; }
    setChecked(true);
    refetch();
  };

  return (
    <div className="min-w-0 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-red transition-colors">← Archive</Link>
      <div className="mt-4">
        <div className="hero-pill">
          <span className="hero-pill-dot" />
          Verify • onchain receipt
        </div>
        <h1 className="mt-4 font-display text-3xl sm:text-4xl leading-none tracking-tight">Verify attendance</h1>
        <p className="mt-2 text-sm sm:text-[15px] text-muted leading-6">Did a wallet really earn a POAP? Check directly against the chain — links to the raw receipt.</p>
      </div>

      <div className="mt-8 archive-card p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className="text-sm font-medium">POAP</label>
            <select value={poapId} onChange={e=>setPoapId(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red">
              {Array.from({length: Math.min(totalNum+1, 60)}).map((_,i)=> <option key={i} value={String(i)}>#{i} — {i===0 ? 'Onchain POAPs (genesis)' : `Event ${i}`}</option>)}
              {totalNum===0 && <option value="0">#0 — Onchain POAPs</option>}
            </select>
            <div className="text-xs text-muted mt-1.5">Total {totalNum} onchain • newest first in Explore</div>
          </div>
          <div className="min-w-0">
            <label className="text-sm font-medium">Wallet address</label>
            <input value={wallet} onChange={e=>setWallet(e.target.value)} placeholder="0x..." className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-3 mono-num text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red" />
          </div>
        </div>
        <button onClick={doCheck} disabled={isFetching} className="ink-button w-full text-[15px] py-3">{isFetching ? 'Checking…' : 'Check ✓'}</button>

        {checked && (
          <div className="archive-inset p-5">
            { !/^0x[a-fA-F0-9]{40}$/.test(wallet) ? <div className="text-sm text-warn">Enter a valid address to verify.</div> :
              hasClaimed ? (
                <div>
                  <div className="flex items-center gap-2 text-success font-medium"><span className="w-6 h-6 rounded-full bg-success text-white flex items-center justify-center text-xs">✓</span> Holds this POAP — 1 per wallet verified onchain</div>
                  <div className="mt-3 mono-num text-xs leading-6 break-all">
                    <div>Token ID: {idNum} • Contract {POAP_ADDRESS.slice(0,10)}…</div>
                    <div>Holder: {wallet.slice(0,8)}…{wallet.slice(-6)}</div>
                    {evt && <div>Event: {(evt as any)[0]} • creator {(evt as any)[6].slice(0,6)}…</div>}
                  </div>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <a href={`https://sepolia.basescan.org/address/${POAP_ADDRESS}#code`} target="_blank" className="ghost-button text-xs">BaseScan contract →</a>
                    <Link href={`/event/${idNum}`} className="ghost-button text-xs">View POAP →</Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 text-muted font-medium"><span className="w-6 h-6 rounded-full bg-paper-muted border border-line flex items-center justify-center text-xs">✕</span> Does not hold this POAP</div>
                  <div className="mt-2 text-xs text-muted">Checked hasClaimed({idNum}, {wallet.slice(0,6)}…) → false on Base Sepolia. Try another wallet or POAP.</div>
                </div>
              )
            }
          </div>
        )}
      </div>

      <div className="mt-6 archive-inset p-5">
        <h3 className="font-display text-lg">How verification works</h3>
        <p className="mt-1 text-sm text-muted leading-6">Every mint sets <span className="mono-num">hasClaimed[eventId][wallet]=true</span> and emits <span className="mono-num">NewMint</span>. This page reads that mapping plus <span className="mono-num">events(id)</span> — no offchain cache. Result is the raw onchain receipt, linkable on BaseScan.</p>
      </div>
    </div>
  );
}
