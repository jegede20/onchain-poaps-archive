"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Archive', icon: '⌂' },
  { href: '/create', label: 'Create', icon: '+' },
  { href: '/explore', label: 'Explore', icon: '◈' },
  { href: '/gallery', label: 'Gallery', icon: '⬔' },
  { href: '/docs', label: 'Docs', icon: '≡' },
];

const SVG_ICONS: Record<string, React.ReactNode> = {
  '/': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>,
  '/create': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/><circle cx="12" cy="12" r="9" strokeOpacity="0.3"/></svg>,
  '/explore': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20L15.5 15.5"/><path d="M8 11h6M11 8v6"/></svg>,
  '/gallery': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>,
  '/docs': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v6h6"/><path d="M9 13h6M9 17h6"/></svg>,
  '/verify': <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>,
};

export function BottomNav() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  return (
    <nav className="bottom-nav md:hidden">
      <div className="bottom-nav-inner">
        {ITEMS.map(it => (
          <Link key={it.href} href={it.href} className={`bottom-nav-item ${isActive(it.href) ? 'active' : ''}`}>
            {SVG_ICONS[it.href] || <span className="text-lg">{it.icon}</span>}
            <span>{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
