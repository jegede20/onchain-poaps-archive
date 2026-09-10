"use client";
import { useParams } from 'next/navigation';
import { useAccount, useReadContract, useSignMessage } from 'wagmi';
import { POAP_ABI, POAP_ADDRESS } from '@/lib/poap';
import { getSignableMessage } from '@/lib/signature';
import { useState } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';

export default function KioskPage() {
  const params = useParams(); const id = Number((params as any).id);
  const { address } = useAccount();
  const { data: evt } = useReadContract({ address: POAP_ADDRESS, abi: POAP_ABI, functionName: 'events', args: [BigInt(id)] });
  const { signMessageAsync } = useSignMessage();
  const [recipient, setRecipient] = useState('');
  const [qr, setQr] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const ev = evt as any; const name = ev?.[0] || `POAP #${id}`;

  const doSign = async () => {
    if (!recipient || !/^0x[a-fA-F0-9]{40}$/.test(recipient)) { alert('Enter valid 0x address'); return; }
    if (!address) { alert('Connect creator wallet first'); return; }
    const hash = getSignableMessage(id, 84532, recipient);
    const s = await signMessageAsync({ message: { raw: hash as `0x${string}` } });
    setSig(s);
    const link = `${window.location.origin}/event/${id}?sig=${s}&recipient=${recipient}`;
    const dataUrl = await QRCode.toDataURL(link, { width: 600, margin: 1 });
    setQr(dataUrl);
    setCount(c=>c+1);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <div className="h-14 border-b-2 border-line bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href={`/event/${id}`} className="rounded-[2px] border border-line bg-paper-muted px-3 py-1.5 text-xs font-medium hover:border-ink hover:bg-white transition-colors">← Exit kiosk</Link>
          <div className="font-display font-medium text-sm tracking-tight">{name} • Kiosk</div>
          <span className="rounded-[2px] bg-ink text-white border border-ink px-2 py-1 text-[11px] font-medium">Door screen</span>
        </div>
        <div className="text-xs mono-num text-muted flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" /> {count} signed • {address ? `${address.slice(0,6)}…` : 'not connected'}
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-0">
        <div className="p-6 sm:p-8 flex flex-col">
          <div className="inline-flex items-center gap-2 rounded-[2px] border border-line bg-paper-muted px-3 py-1.5 text-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Live • ~2s per person
          </div>
          <h2 className="mt-4 font-display text-2xl font-medium tracking-tight">At the door</h2>
          <p className="mt-2 text-muted text-sm leading-6">Works offline once loaded. Grab attendee address, sign client-side, show QR — <span className="text-ink font-medium">no gas for you</span>.</p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[2px] border-2 border-line bg-white p-4">
              <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Attendee address</label>
              <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="0x…" className="mt-2 w-full rounded-[2px] border-2 border-line bg-paper-muted px-4 py-3.5 mono-num text-sm focus:border-ink focus:bg-white focus:outline-none transition-colors" />
              <div className="mt-2 text-xs text-muted">Paste ENS or 0x — validated before signing.</div>
            </div>
            <button onClick={doSign} className="w-full rounded-[2px] bg-ink text-white border-2 border-ink py-3.5 font-medium text-sm hover:bg-black transition-colors">Sign & show QR →</button>
            {sig && (
              <div className="rounded-[2px] border border-line bg-paper-muted p-4 mono-num text-xs break-all">
                <div className="font-medium text-ink text-xs uppercase tracking-wide">Signature</div>
                <div className="mt-1.5 text-muted bg-white border border-line rounded-[2px] p-2.5">{sig.slice(0,64)}…</div>
                <div className="mt-2 text-muted">Link: <span className="text-ink">{`${typeof window!=='undefined'?window.location.origin:''}/event/${id}?sig=…&recipient=${recipient.slice(0,6)}…`}</span></div>
              </div>
            )}
            <div className="rounded-[2px] bg-white border border-line p-3 text-xs text-muted leading-5">1 per wallet • Signatures valid 37 days • Recipient pays mint gas • Works on bad venue wifi</div>
          </div>
        </div>

        <div className="bg-ink text-paper flex flex-col items-center justify-center p-6 sm:p-8 lg:border-l-2 border-line">
          {!qr ? (
            <div className="text-center max-w-sm w-full">
              <div className="w-64 h-64 mx-auto rounded-[2px] border-2 border-dashed border-white/20 bg-white/5 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-[2px] bg-white/10 border border-white/20 flex items-center justify-center text-white/60">◈</div>
                <div className="text-white/60 text-sm font-medium">QR appears here</div>
                <div className="text-white/30 text-xs">Enter address → Sign</div>
              </div>
              <div className="mt-6 text-white font-medium">Ready for next attendee</div>
              <div className="mt-1 text-white/60 text-sm">Per-wallet QR — no reuse</div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-[2px] bg-white/10 border border-white/15 px-3 py-1.5 text-xs text-white/70">1.9s median • offline capable</div>
            </div>
          ) : (
            <div className="text-center w-full max-w-sm">
              <div className="rounded-[2px] bg-white p-3 mx-auto w-fit shadow-2xl border-2 border-brass">
                <img src={qr} alt="QR" className="w-64 h-64 sm:w-72 sm:h-72" />
              </div>
              <div className="mt-4 inline-flex items-center gap-2 rounded-[2px] bg-white text-ink border-2 border-white px-3 py-1 mono-num text-xs font-medium">#{String(id).padStart(4,'0')} • {recipient.slice(0,6)}…{recipient.slice(-4)}</div>
              <div className="mt-2 text-white font-display text-lg">{name}</div>
              <div className="text-white/60 text-xs">Scan to mint • 37-day window</div>
              <button onClick={()=>{setQr(null); setRecipient(''); setSig(null);}} className="mt-6 w-full rounded-[2px] bg-white text-ink border-2 border-white py-3 font-medium text-sm hover:bg-paper-muted transition-colors">Next attendee →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
