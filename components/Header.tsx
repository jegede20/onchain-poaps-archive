"use client";
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const linkClass = (p: string) => `text-sm font-medium transition-colors ${pathname===p ? 'text-ink font-semibold' : 'text-muted hover:text-ink'}`;
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-paper/80 border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-ink text-paper flex items-center justify-center font-bold text-sm tracking-widest">POAP</div>
            <div className="leading-tight">
              <div className="font-semibold text-sm tracking-tight">Onchain POAPs</div>
              <div className="text-xs text-muted -mt-0.5 mono-num">Archive • Base Sepolia</div>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={linkClass('/')}>Archive</Link>
            <Link href="/create" className={linkClass('/create')}>Create</Link>
            <Link href="/gallery" className={linkClass('/gallery')}>Gallery</Link>
            <Link href="/docs" className={linkClass('/docs')}>Docs</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/create" className="hidden sm:inline-flex brass-button text-sm">New POAP</Link>
          <ConnectButton chainStatus="icon" showBalance={false} accountStatus={{ smallScreen:'avatar', largeScreen:'full' }} />
        </div>
      </div>
      <div className="md:hidden border-t border-line bg-paper-elevated">
        <nav className="max-w-6xl mx-auto px-4 flex gap-4 h-10 items-center overflow-x-auto">
          <Link href="/" className={linkClass('/')}>Archive</Link>
          <Link href="/create" className={linkClass('/create')}>Create</Link>
          <Link href="/gallery" className={linkClass('/gallery')}>Gallery</Link>
          <Link href="/docs" className={linkClass('/docs')}>Docs</Link>
        </nav>
      </div>
    </header>
  );
}
