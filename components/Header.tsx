"use client";
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const linkClass = (p: string) => `text-sm font-medium transition-colors ${pathname===p ? 'text-ink font-semibold underline decoration-brand-red decoration-2 underline-offset-8' : 'text-muted hover:text-ink'}`;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-paper/90 border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            {/* Fixed logo — perforated stamp + wax seal */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-brand-red/20 shadow-sm flex items-center justify-center bg-white">
              <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full opacity-10">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#9B2C2C" strokeWidth="1.2" strokeDasharray="2 3"/>
              </svg>
              <div className="w-7 h-7 rounded-full wax-seal flex items-center justify-center">
                <span className="text-white font-bold text-[10px] tracking-widest">PO</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brass rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[6px]">✦</span>
              </div>
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-sm tracking-tight flex items-center gap-1.5">Onchain POAPs <span className="text-brand-red text-xs">●</span></div>
              <div className="text-xs text-muted -mt-0.5 mono-num">Archive • Base Sepolia</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass('/')}>Archive</Link>
            <Link href="/create" className={linkClass('/create')}>Create</Link>
            <Link href="/explore" className={linkClass('/explore')}>Explore</Link>
            <Link href="/gallery" className={linkClass('/gallery')}>Gallery</Link>
            <Link href="/verify" className={linkClass('/verify')}>Verify</Link>
            <Link href="/docs" className={linkClass('/docs')}>Docs</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/create" className="hidden sm:inline-flex brass-button text-sm">New POAP</Link>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus={{ smallScreen:'avatar', largeScreen:'full' }} />
        </div>
      </div>
      {/* Desktop secondary nav hidden on mobile — we use bottom tab bar */}
      <div className="hidden lg:block border-t border-line/60 bg-paper-elevated/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-9 flex items-center gap-6 text-xs">
          <span className="text-muted uppercase tracking-widest font-semibold">Quick →</span>
          <Link href="/explore" className="hover:text-brand-red">Explore all 51</Link>
          <Link href="/verify" className="hover:text-brand-red">Verify attendance</Link>
          <Link href="/docs" className="hover:text-brand-red">How it works</Link>
          <span className="ml-auto mono-num text-muted">100% onchain • no IPFS • 0xC3243…9de6</span>
        </div>
      </div>
    </header>
  );
}
