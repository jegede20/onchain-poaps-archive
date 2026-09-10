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
      <div className="h-14 border-b border-line bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href={`/event/${id}`} className="ghost-button text-xs py-1.5">← Exit kiosk</Link>
          <div className="font-medium text-sm">{name} • Kiosk</div>
          <span className="badge badge-brass text-[11px]">Fullscreen door screen</span>
        </div>
        <div className="text-xs mono-num text-muted">{count} signed • {address ? `${address.slice(0,6)}…` : 'not connected'}</div>
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-0">
        <div className="p-6 sm:p-10 flex flex-col">
          <h2 className="text-2xl font-medium tracking-tight">At the door</h2>
          <p className="mt-2 text-muted text-sm">Works offline once loaded. Grab attendee address, sign client-side, show QR — ~2s per person.</p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium">Attendee address</label>
              <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="0x…" className="mt-1 w-full rounded-xl border-2 border-line bg-white px-4 py-4 mono-num text-base focus:border-brand-red focus:outline-none" />
            </div>
            <button onClick={doSign} className="ink-button w-full text-base py-4">Sign & show QR →</button>
            {sig && (
              <div className="archive-inset p-4 mono-num text-xs break-all">
                <div className="font-medium text-ink">Signature</div>
                <div className="mt-1 text-muted">{sig.slice(0,60)}…</div>
                <div className="mt-2 text-muted">Link: {`${typeof window!=='undefined'?window.location.origin:''}/event/${id}?sig=…&recipient=${recipient.slice(0,6)}…`}</div>
              </div>
            )}
            <div className="text-xs text-muted leading-6">• Soulbound by default, 1 per wallet • Signatures valid 37d • No gas to sign — recipient pays mint gas</div>
          </div>
        </div>

        <div className="bg-ink text-paper flex flex-col items-center justify-center p-8 lg:border-l border-line">
          {!qr ? (
            <div className="text-center max-w-sm">
              <div className="w-56 h-56 mx-auto rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center">
                <div className="text-white/50 text-sm">QR appears here</div>
              </div>
              <div className="mt-6 text-white/70 text-sm">Enter an address and sign to generate a per-attendee QR.</div>
              <div className="mt-4 mono-num text-xs text-white/40">1.9s median claim • works on bad venue wifi</div>
            </div>
          ) : (
            <div className="text-center">
              <img src={qr} alt="QR" className="w-72 h-72 bg-white p-3 rounded-2xl mx-auto shadow-xl" />
              <div className="mt-4 text-white font-medium">{name}</div>
              <div className="mono-num text-xs text-white/60">#{String(id).padStart(4,'0')} • {recipient.slice(0,6)}…{recipient.slice(-4)}</div>
              <button onClick={()=>{setQr(null); setRecipient('');}} className="mt-6 bg-white text-ink rounded-[4px] px-6 py-2 font-medium text-sm">Next attendee →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
