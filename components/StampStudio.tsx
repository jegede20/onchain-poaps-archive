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
    const esc = (s:string)=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const top = esc(topText.slice(0,22));
    const bot = esc(bottomText.slice(0,22));
    const mid = useEmoji ? center : esc(topText.slice(0,2) || 'PO');

    // SCALL0P — perforated stamp, cream field, bold wax-red rings, big centered trophy
    if (shape==='scallop') {
      const dots = Array.from({length: 28}).map((_,i)=>{
        const a=i*12.857*Math.PI/180;
        return `<circle cx="${(100+88*Math.cos(a)).toFixed(1)}" cy="${(100+88*Math.sin(a)).toFixed(1)}" r="4.4"/>`;
      }).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  <g fill="${acc}" opacity="0.10">${dots}</g>
  <circle cx="100" cy="100" r="73.5" fill="none" stroke="${acc}" stroke-width="3.2"/>
  <circle cx="100" cy="100" r="66.5" fill="none" stroke="${acc}" stroke-width="1.1" stroke-dasharray="5 4.5" opacity="0.58"/>
  <circle cx="100" cy="100" r="51.5" fill="white" stroke="${acc}" stroke-width="1.15"/>
  <text x="100" y="66.5" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="10.5" font-weight="800" letter-spacing="1.7" fill="${ink}">${top}</text>
  <text x="100" y="111" text-anchor="middle" dominant-baseline="middle" font-size="46" style="filter: drop-shadow(0 1px 0 rgba(0,0,0,0.06))">${mid}</text>
  <text x="100" y="143.5" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="8.6" font-weight="700" letter-spacing="1.25" fill="${ink}">${bot}</text>
</svg>`;
    }
    // GEAR — notched badge, sharp teeth, centered art
    if (shape==='gear') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  <path d="M100 30.5 L104.2 43.2 L117.5 38.3 L120.4 51.0 L134.0 51.6 L130.0 64.6 L143.2 70.8 L136.6 82.6 L148.2 93.2 L136.6 103.8 L143.2 115.6 L130.0 121.8 L134.0 134.8 L120.4 135.4 L117.5 148.1 L104.2 143.2 L100 155.9 L95.8 143.2 L82.5 148.1 L79.6 135.4 L66 134.8 L70 121.8 L56.8 115.6 L63.4 103.8 L51.8 93.2 L63.4 82.6 L56.8 70.8 L70 64.6 L66 51.6 L79.6 51.0 L82.5 38.3 L95.8 43.2 Z" fill="${acc}"/>
  <circle cx="100" cy="93.2" r="47.2" fill="white" stroke="${acc}" stroke-width="1.9"/>
  <circle cx="100" cy="93.2" r="47.2" fill="none" stroke="${acc}" stroke-width="0.7" opacity="0.13"/>
  <text x="100" y="76.5" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="10.2" font-weight="800" letter-spacing="1.5" fill="${ink}">${esc(topText.slice(0,15))}</text>
  <text x="100" y="101.5" text-anchor="middle" dominant-baseline="middle" font-size="40">${mid}</text>
  <text x="100" y="122.2" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="8.4" font-weight="700" letter-spacing="1.1" fill="${ink}">${esc(bottomText.slice(0,16))}</text>
</svg>`;
    }
    // CLASSIC — clean double ring, generous white field
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  <circle cx="100" cy="100" r="77.5" fill="none" stroke="${acc}" stroke-width="2.9"/>
  <circle cx="100" cy="100" r="69.8" fill="none" stroke="${acc}" stroke-width="1.05" stroke-dasharray="6 4.2" opacity="0.52"/>
  <circle cx="100" cy="100" r="52.8" fill="white"/>
  <circle cx="100" cy="100" r="52.8" fill="none" stroke="${acc}" stroke-width="0.9" opacity="0.14"/>
  <text x="100" y="70.5" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="10.2" font-weight="800" letter-spacing="1.6" fill="${ink}">${esc(topText.slice(0,18))}</text>
  <text x="100" y="109.5" text-anchor="middle" dominant-baseline="middle" font-size="44">${mid}</text>
  <text x="100" y="142.2" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="8.6" font-weight="700" letter-spacing="1.2" fill="${ink}">${esc(bottomText.slice(0,18))}</text>
</svg>`;
  }, [shape, palette, topText, bottomText, center, useEmoji, pal]);

  const estBytes = new Blob([svg]).size;
  return (
    <div className="space-y-4">
      {/* REVERTED to warm paper — not tall, a little bit tall (240-260px) */}
      <div className="archive-card overflow-hidden" style={{borderRadius:'2px'}}>
        <div className="h-[240px] sm:h-[260px] flex items-center justify-center p-5 relative overflow-hidden" style={{background:'#FFFBF0'}}>
          <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, #9B2C2C 1px, transparent 0)', backgroundSize:'16px 16px'}} />
          <div className="w-full max-w-[200px] aspect-square rounded-[6px] overflow-hidden border border-line/60 shadow-sm bg-white flex items-center justify-center p-3 relative">
            <div dangerouslySetInnerHTML={{__html: svg}} className="w-full h-full" />
          </div>
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
            <input value={topText} onChange={e=>setTopText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="ONCHAIN POAP" />
          </div>
          <div>
            <label className="text-xs font-medium">Bottom text ({bottomText.length}/22)</label>
            <input value={bottomText} onChange={e=>setBottomText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="BASE SEP" />
          </div>
        </div>
      </div>
    </div>
  );
}
