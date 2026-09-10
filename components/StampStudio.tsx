"use client";
import { useState, useMemo } from 'react';

const SHAPES = [
  { id: 'scallop', label: 'Scallop', desc: 'Perforated stamp' },
  { id: 'classic', label: 'Classic', desc: 'Ring + inner' },
  { id: 'gear', label: 'Gear', desc: 'Notched badge' },
];
const PALETTES = [
  { id: 'cream-red', bg: '#FFFBF0', accent: '#9B2C2C', ink: '#2E1A0F', label: 'Cream • Wax Red' },
  { id: 'brown-cream', bg: '#FFF4E0', accent: '#8B3A2B', ink: '#2E1A0F', label: 'Warm • Brown' },
  { id: 'ink-brass', bg: '#2E1A0F', accent: '#C9A66B', ink: '#FFFBF0', label: 'Ink • Brass' },
];
const EMOJIS = ['🎉','🪙','🎪','🎤','🎧','🎨','🏆','🚀','🔥','⚡','🌍','🌊','🍕','☕','🥂','🤝','💜','🛠️','📡','🎓','🌱','🦄','👾'];

export function StampStudio({ onUse, value }: { onUse: (svg: string)=>void, value: string }) {
  const [shape, setShape] = useState('scallop');
  const [palette, setPalette] = useState('cream-red');
  const [topText, setTopText] = useState('ONCHAIN POAP');
  const [bottomText, setBottomText] = useState('BASE SEP');
  const [center, setCenter] = useState('🏆');
  const [useEmoji, setUseEmoji] = useState(true);
  const pal = PALETTES.find(p=>p.id===palette)!;

  const svg = useMemo(()=>{
    const bg = pal.bg;
    const acc = pal.accent;
    const ink = pal.ink;
    // Build scalloped stamp via patterned circle
    if (shape==='scallop') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="20" fill="${bg}"/><g fill="${acc}" opacity="0.08">${Array.from({length: 24}).map((_,i)=>{const a=i*15*Math.PI/180; return `<circle cx="${100+92*Math.cos(a)}" cy="${100+92*Math.sin(a)}" r="5"/>`}).join('')}</g><circle cx="100" cy="100" r="78" fill="none" stroke="${acc}" stroke-width="3" stroke-dasharray="0"/><circle cx="100" cy="100" r="71" fill="none" stroke="${acc}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.6"/><circle cx="100" cy="100" r="56" fill="white" stroke="${acc}" stroke-width="1"/><text x="100" y="72" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="1.2" fill="${ink}">${topText.slice(0,22)}</text><text x="100" y="122" text-anchor="middle" font-size="34">${useEmoji ? center : topText.slice(0,2)}</text><text x="100" y="145" text-anchor="middle" font-size="8" font-weight="600" letter-spacing="1" fill="${ink}">${bottomText.slice(0,22)}</text><circle cx="100" cy="100" r="78" fill="none" stroke="${acc}" stroke-width="1" opacity="0.15"/></svg>`;
    }
    if (shape==='gear') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="${bg}"/><path d="M100 36 L104 48 L116 44 L118 56 L130 58 L126 70 L138 76 L132 88 L144 96 L132 104 L138 116 L126 122 L130 134 L118 136 L116 148 L104 144 L100 156 L96 144 L84 148 L82 136 L70 134 L74 122 L62 116 L68 104 L56 96 L68 88 L62 76 L74 70 L70 58 L82 56 L84 44 L96 48 Z" fill="${acc}"/><circle cx="100" cy="96" r="44" fill="white" stroke="${acc}" stroke-width="2"/><text x="100" y="86" text-anchor="middle" font-size="10" font-weight="700" fill="${ink}">${topText.slice(0,14)}</text><text x="100" y="106" text-anchor="middle" font-size="22">${useEmoji ? center : '★'}</text><text x="100" y="124" text-anchor="middle" font-size="8" fill="${ink}">${bottomText.slice(0,16)}</text></svg>`;
    }
    // classic
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="${bg}"/><circle cx="100" cy="100" r="80" fill="none" stroke="${acc}" stroke-width="2.5"/><circle cx="100" cy="100" r="72" fill="none" stroke="${acc}" stroke-width="1" stroke-dasharray="6 4" opacity="0.5"/><circle cx="100" cy="100" r="54" fill="white"/><text x="100" y="75" text-anchor="middle" font-size="9" font-weight="700" letter-spacing="1.4" fill="${ink}">${topText.slice(0,18)}</text><text x="100" y="110" text-anchor="middle" font-size="30">${useEmoji ? center : 'POAP'}</text><text x="100" y="132" text-anchor="middle" font-size="8" fill="${ink}">${bottomText.slice(0,18)}</text></svg>`;
  }, [shape, palette, topText, bottomText, center, useEmoji, pal]);

  const estBytes = new Blob([svg]).size;
  return (
    <div className="space-y-4">
      <div className="archive-card overflow-hidden" style={{borderRadius:'2px'}}>
        <div className="h-[220px] sm:h-[260px] bg-black flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.15]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize:'18px 18px'}} />
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent" />
          <div className="w-full max-w-[180px] aspect-square rounded-[2px] overflow-hidden border border-white/20 shadow-2xl bg-white flex items-center justify-center p-2 relative">
            <div dangerouslySetInnerHTML={{__html: svg}} className="w-full h-full" />
          </div>
          <div className="absolute top-3 left-3 px-2 py-1 rounded-[2px] bg-white/10 backdrop-blur border border-white/20 text-[10px] text-white mono-num">LIVE PREVIEW</div>
        </div>
        <div className="p-3 flex items-center justify-between bg-white border-t border-line">
          <div className="text-xs mono-num text-muted">{estBytes.toLocaleString()} bytes • ~{estBytes < 3000 ? 'tiny' : estBytes < 6000 ? 'gas-friendly' : 'large'}</div>
          <button onClick={()=>onUse(svg)} className="ink-button text-xs py-2 px-4 rounded-[2px]">Use this design →</button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted">Shape</div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SHAPES.map(s=> {
              const isActive = shape===s.id;
              return (
                <button key={s.id} onClick={()=>setShape(s.id)} className={`relative p-3 pt-4 rounded-[2px] border-2 text-center overflow-hidden transition-all ${isActive ? 'bg-ink text-white border-ink shadow-lg' : 'bg-white border-line hover:border-brand-red/30 hover:shadow-md'}`}>
                  <div className="w-10 h-10 mx-auto rounded-[2px] border flex items-center justify-center mb-2" style={{background: isActive ? 'white' : '#FFFBF0', borderColor: isActive ? 'white' : '#F0DDC8'}}>
                    {s.id==='scallop' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke={isActive ? '#9B2C2C' : '#9B2C2C'} strokeWidth="1.5" strokeDasharray="2 2"/><circle cx="12" cy="12" r="4" fill={isActive ? '#9B2C2C' : '#FFFBF0'} stroke="#9B2C2C" strokeWidth="1"/></svg>}
                    {s.id==='classic' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={isActive ? '#9B2C2C' : '#9B2C2C'} strokeWidth="1.5"/><circle cx="12" cy="12" r="5.5" stroke={isActive ? '#9B2C2C' : '#9B2C2C'} strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/><circle cx="12" cy="12" r="2" fill={isActive ? '#9B2C2C' : '#2E1A0F'}/></svg>}
                    {s.id==='gear' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke={isActive ? '#9B2C2C' : '#9B2C2C'} strokeWidth="1.5"/><path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.5 6.5l1.5 1.5M16 16l1.5 1.5M6.5 17.5l1.5-1.5M16 8l1.5-1.5" stroke={isActive ? '#9B2C2C' : '#C46A3D'} strokeWidth="1" strokeLinecap="round"/></svg>}
                  </div>
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-ink'}`}>{s.label}</div><div className={`text-[11px] ${isActive ? 'text-white/70' : 'text-muted'}`}>{s.desc}</div>
                  {isActive && <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-red rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted">Palette</div>
          <div className="mt-2 flex gap-2">
            {PALETTES.map(p=> (
              <button key={p.id} onClick={()=>setPalette(p.id)} className={`flex-1 h-10 rounded-[2px] border-2 ${palette===p.id?'border-brand-red':'border-line'}`} style={{background: p.bg}} title={p.label}>
                <span className="w-6 h-6 rounded-full mx-auto block mt-1.5" style={{background:p.accent}} />
              </button>
            ))}
          </div>
          <div className="text-xs text-muted mt-1">{pal.label}</div>
        </div>
        <div>
          <div className="text-xs font-medium uppercase tracking-widest text-muted">Center</div>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {EMOJIS.map(e=> (
              <button key={e} onClick={()=>{setCenter(e); setUseEmoji(true);}} className={`w-9 h-9 rounded-[2px] border flex items-center justify-center text-lg ${center===e && useEmoji ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-line hover:border-brass'}`}>{e}</button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} /> Use emoji/initials as center</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Top text ({topText.length}/22)</label>
            <input value={topText} onChange={e=>setTopText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" placeholder="ONCHAIN POAP" />
          </div>
          <div>
            <label className="text-xs font-medium">Bottom text ({bottomText.length}/22)</label>
            <input value={bottomText} onChange={e=>setBottomText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-xl border border-line px-3 py-2 text-sm" placeholder="BASE SEP" />
          </div>
        </div>
      </div>
    </div>
  );
}
