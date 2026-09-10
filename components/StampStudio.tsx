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
const EMOJIS = ['🎉','🪙','��','🎤','🎧','🎨','🏆','🚀','🔥','⚡','🌍','🌊','🍕','☕','🥂','🤝','💜','🛠️','📡','🎓','🌱','🦄','👾'];

function buildingIcon() {
  // premium building vector like example — columns + dome, not emoji
  return `<g transform="translate(100 92)">
    <circle r="26" fill="none" stroke="#FFF8DC" stroke-width="0.7" opacity="0.0"/>
    <g transform="translate(0 1)">
      <!-- steps -->
      <rect x="-14" y="9.5" width="28" height="2" rx="0.8" fill="#7A3A1A"/>
      <rect x="-12" y="7.2" width="24" height="2" rx="0.6" fill="#8B4513"/>
      <!-- body -->
      <rect x="-11" y="-7" width="22" height="14.2" rx="1.2" fill="#FFFBF0" stroke="#5C2E0E" stroke-width="1.1"/>
      <!-- columns 4 -->
      <rect x="-8.5" y="-3.5" width="2.6" height="9" rx="0.7" fill="#D9B88A" stroke="#5C2E0E" stroke-width="0.6"/>
      <rect x="-2.9" y="-3.5" width="2.6" height="9" rx="0.7" fill="#D9B88A" stroke="#5C2E0E" stroke-width="0.6"/>
      <rect x="2.7" y="-3.5" width="2.6" height="9" rx="0.7" fill="#D9B88A" stroke="#5C2E0E" stroke-width="0.6"/>
      <rect x="6.0" y="-3.5" width="2.6" height="9" rx="0.7" fill="#D9B88A" stroke="#5C2E0E" stroke-width="0.6" opacity="0"/>
      <!-- entablature -->
      <rect x="-11.5" y="-8.6" width="23" height="2.2" rx="0.6" fill="#8B4513"/>
      <!-- pediment -->
      <path d="M -13 -8.6 L 0 -15.5 L 13 -8.6 Z" fill="#FFD36A" stroke="#5C2E0E" stroke-width="1.0" stroke-linejoin="round"/>
      <circle cx="0" cy="-10.2" r="1.1" fill="#5C2E0E" opacity="0.9"/>
      <!-- door -->
      <rect x="-2.2" y="1.2" width="4.4" height="5.2" rx="0.6" fill="#5C2E0E"/>
      <rect x="-1.1" y="3.0" width="2.2" height="3.4" rx="0.4" fill="#FFFBF0" opacity="0.9"/>
    </g>
  </g>`;
}

export function StampStudio({ onUse, value }: { onUse: (svg: string)=>void, value: string }) {
  const [shape, setShape] = useState('scallop');
  const [palette, setPalette] = useState('cream-red');
  const [topText, setTopText] = useState('MY EVENT 2026');
  const [bottomText, setBottomText] = useState('ONCHAIN POAP • BASE');
  const [center, setCenter] = useState('🏛️');
  const [useEmoji, setUseEmoji] = useState(false);
  const pal = PALETTES.find(p=>p.id===palette)!;

  const svg = useMemo(()=>{
    const bg = pal.bg;
    const acc = pal.accent;
    const ink = pal.ink;
    const esc = (s:string)=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const top = esc(topText.slice(0,22) || 'MY EVENT 2026');
    const bot = esc(bottomText.slice(0,24) || 'ONCHAIN POAP • BASE');
    const isBuilding = center === '🏛️' || center === '🏆' || !useEmoji;
    const midText = useEmoji && !isBuilding ? center : '';

    // premium helpers: gold gradient + filters + curved paths
    const defs = `
  <defs>
    <radialGradient id="gold" cx="35%" cy="28%" r="78%">
      <stop offset="0%" stop-color="#FFFDE7"/>
      <stop offset="22%" stop-color="#FFE9A3"/>
      <stop offset="52%" stop-color="#E8B84A"/>
      <stop offset="78%" stop-color="#B7810A"/>
      <stop offset="100%" stop-color="#7A4A00"/>
    </radialGradient>
    <linearGradient id="goldEdge" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF8CC"/>
      <stop offset="100%" stop-color="#9A6B00"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#2E1A0F" flood-opacity="0.18"/>
    </filter>
    <path id="topArc" d="M 38 78.5 A 66 66 0 0 1 162 78.5"/>
    <path id="botArc" d="M 46 141.5 A 62 62 0 0 0 154 141.5"/>
  </defs>`;

    const paperTexture = `<g opacity="0.06" fill="${acc}">${Array.from({length: 120}).map((_,i)=> {
      const x = 14 + (i*37)%172; const y = 14 + (i*57)%172; return `<circle cx="${x}" cy="${y}" r="${0.7 + (i%3)*0.3}"/>`;
    }).join('')}</g>`;

    // outer scalloped cream like example — 32 teeth, warm
    const scallopOuter = (()=> {
      const teeth = 32;
      let d = '';
      for(let i=0;i<teeth;i++){
        const a0 = (i/teeth)*360 -90;
        const a1 = ((i+0.5)/teeth)*360 -90;
        const a2 = ((i+1)/teeth)*360 -90;
        const rBase = 88; const rTip = 94;
        const x0 = (100 + rBase*Math.cos(a0*Math.PI/180)).toFixed(1);
        const y0 = (100 + rBase*Math.sin(a0*Math.PI/180)).toFixed(1);
        const xm = (100 + rTip*Math.cos(a1*Math.PI/180)).toFixed(1);
        const ym = (100 + rTip*Math.sin(a1*Math.PI/180)).toFixed(1);
        const x1 = (100 + rBase*Math.cos(a2*Math.PI/180)).toFixed(1);
        const y1 = (100 + rBase*Math.sin(a2*Math.PI/180)).toFixed(1);
        if(i===0) d += `M ${x0} ${y0} `;
        d += `Q ${xm} ${ym} ${x1} ${y1} `;
      }
      d += 'Z';
      return `<path d="${d}" fill="#F8E8C8" stroke="#E8D5B5" stroke-width="0.9"/>`;
    })();

    const redPetalWreath = Array.from({length:14}).map((_,i)=>{
      const a = i*25.714 -90;
      const x = 100 + 38*Math.cos(a*Math.PI/180);
      const y = 100 + 38*Math.sin(a*Math.PI/180);
      return `<g transform="rotate(${a+90} ${x.toFixed(1)} ${y.toFixed(1)})"><path d="M ${x.toFixed(1)} ${(y-7).toFixed(1)} Q ${(x+4).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y+7).toFixed(1)} Q ${(x-4).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y-7).toFixed(1)} Z" fill="${acc}" opacity="0.98"/></g>`;
    }).join('');

    const dashedInner = `<circle cx="100" cy="100" r="54.5" fill="none" stroke="${acc}" stroke-width="0.75" stroke-dasharray="3.4 4.2" opacity="0.72"/>
  <circle cx="100" cy="100" r="49.2" fill="none" stroke="${ink}" stroke-width="0.55" stroke-dasharray="1.2 7" opacity="0.18"/>`;

    const dottedLine = `<g stroke="${acc}" stroke-width="1.05" stroke-linecap="round" opacity="0.42" stroke-dasharray="1.6 3.2">
      <line x1="62" y1="123.5" x2="138" y2="123.5"/>
    </g>`;

    // scallop premium — example-like, cream gear + red petals + gold coin + curved text
    if (shape==='scallop') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  ${defs}
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  ${paperTexture}
  ${scallopOuter}
  <circle cx="100" cy="100" r="68.5" fill="white" stroke="#F0DDC8" stroke-width="0.9"/>
  <circle cx="100" cy="100" r="64.2" fill="none" stroke="${acc}" stroke-width="1.15" opacity="0.95"/>
  ${redPetalWreath}
  ${dashedInner}
  <!-- curved top / bottom — arch like example MY EVENT 2026 -->
  <text fill="${acc}" font-family="Cormorant Garamond, Georgia, serif" font-size="11.2" font-weight="700" letter-spacing="1.8" text-anchor="middle">
    <textPath href="#topArc" startOffset="50%" dominant-baseline="middle">${top}</textPath>
  </text>
  <!-- gold medallion -->
  <g filter="url(#softShadow)">
    <circle cx="100" cy="92" r="30.5" fill="url(#gold)" stroke="url(#goldEdge)" stroke-width="1.6"/>
    <circle cx="100" cy="92" r="27.2" fill="none" stroke="white" stroke-width="0.9" opacity="0.55"/>
    <circle cx="100" cy="92" r="25.6" fill="none" stroke="#7A4A00" stroke-width="0.35" opacity="0.32"/>
  </g>
  ${isBuilding ? buildingIcon() : `<text x="100" y="96.5" text-anchor="middle" dominant-baseline="middle" font-size="30">${midText}</text>`}
  ${dottedLine}
  <text fill="${acc}" font-family="Inter, ui-sans-serif, system-ui" font-size="6.8" font-weight="600" letter-spacing="1.55" text-anchor="middle" opacity="0.95">
    <textPath href="#botArc" startOffset="50%" dominant-baseline="middle">${bot}</textPath>
  </text>
</svg>`;
    }

    if (shape==='gear') {
      const gearPath = `M100 24.5 L104.8 38.2 L119.5 32.8 L122.8 46.8 L138.2 47.2 L133.2 61.2 L148.2 68.5 L141 81.2 L154.2 92.2 L141 103.2 L148.2 116 L133.2 123.2 L138.2 137.2 L122.8 137.6 L119.5 151.5 L104.8 146.2 L100 160.5 L95.2 146.2 L80.5 151.5 L77.2 137.6 L61.8 137.2 L66.8 123.2 L51.8 116 L59 103.2 L45.8 92.2 L59 81.2 L51.8 68.5 L66.8 61.2 L61.8 47.2 L77.2 46.8 L80.5 32.8 L95.2 38.2 Z`;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  ${defs}
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  ${paperTexture}
  <path d="${gearPath}" fill="#F1DCC0" stroke="#E0C7A6" stroke-width="0.9"/>
  <circle cx="100" cy="92.2" r="56" fill="white" stroke="#F0DDC8" stroke-width="0.9"/>
  <circle cx="100" cy="92.2" r="52.2" fill="none" stroke="${acc}" stroke-width="1.1"/>
  ${Array.from({length:14}).map((_,i)=>{
    const a=i*25.714-90; const x=100+34*Math.cos(a*Math.PI/180); const y=92.2+34*Math.sin(a*Math.PI/180);
    return `<path d="M ${x.toFixed(1)} ${(y-6).toFixed(1)} Q ${(x+3.2).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y+6).toFixed(1)} Q ${(x-3.2).toFixed(1)} ${y.toFixed(1)} ${x.toFixed(1)} ${(y-6).toFixed(1)} Z" fill="${acc}" opacity="0.95"/>`;
  }).join('')}
  ${dashedInner.replace('100" cy="100"','100" cy="92.2"').replace('100" cy="100"','100" cy="92.2"')}
  <text fill="${acc}" font-family="Cormorant Garamond, Georgia, serif" font-size="11" font-weight="700" letter-spacing="1.7" text-anchor="middle"><textPath href="#topArc" startOffset="50%">${top}</textPath></text>
  <g filter="url(#softShadow)">
    <circle cx="100" cy="90.5" r="28.5" fill="url(#gold)" stroke="url(#goldEdge)" stroke-width="1.5"/>
    <circle cx="100" cy="90.5" r="25.6" fill="none" stroke="white" stroke-width="0.85" opacity="0.55"/>
  </g>
  ${isBuilding ? buildingIcon().replace('translate(100 92)','translate(100 90.5)') : `<text x="100" y="94.5" text-anchor="middle" dominant-baseline="middle" font-size="28">${midText}</text>`}
  <text fill="${acc}" font-family="Inter, ui-sans-serif, system-ui" font-size="6.6" font-weight="600" letter-spacing="1.45" text-anchor="middle" opacity="0.95"><textPath href="#botArc" startOffset="50%">${bot}</textPath></text>
</svg>`;
    }

    // classic — minimalist double ring but still gold medallion + curved text
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  ${defs}
  <rect width="200" height="200" rx="22" fill="${bg}"/>
  ${paperTexture}
  <circle cx="100" cy="100" r="78" fill="none" stroke="${acc}" stroke-width="2.9"/>
  <circle cx="100" cy="100" r="71.5" fill="none" stroke="${acc}" stroke-width="0.9" stroke-dasharray="5.5 5" opacity="0.48"/>
  <circle cx="100" cy="100" r="58" fill="white" stroke="#F0DDC8" stroke-width="0.8"/>
  <circle cx="100" cy="100" r="58" fill="none" stroke="${acc}" stroke-width="0.42" opacity="0.18"/>
  <text fill="${acc}" font-family="Cormorant Garamond, Georgia, serif" font-size="10.8" font-weight="700" letter-spacing="1.6" text-anchor="middle"><textPath href="#topArc" startOffset="50%">${esc(topText.slice(0,18))}</textPath></text>
  <g filter="url(#softShadow)">
    <circle cx="100" cy="92" r="29.2" fill="url(#gold)" stroke="url(#goldEdge)" stroke-width="1.45"/>
    <circle cx="100" cy="92" r="26.2" fill="none" stroke="white" stroke-width="0.8" opacity="0.52"/>
  </g>
  ${isBuilding ? buildingIcon() : `<text x="100" y="95.5" text-anchor="middle" dominant-baseline="middle" font-size="30">${midText}</text>`}
  ${dottedLine}
  <text fill="${acc}" font-family="Inter, ui-sans-serif, system-ui" font-size="6.6" font-weight="600" letter-spacing="1.45" text-anchor="middle" opacity="0.94"><textPath href="#botArc" startOffset="50%">${esc(bottomText.slice(0,20))}</textPath></text>
</svg>`;
  }, [shape, palette, topText, bottomText, center, useEmoji, pal]);

  const estBytes = new Blob([svg]).size;
  return (
    <div className="space-y-4">
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
          <div className="mt-2 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} /> Use emoji as center</label>
            <span className="text-xs text-muted">Default is hand-drawn building (premium, not emoji)</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Top arc text ({topText.length}/22)</label>
            <input value={topText} onChange={e=>setTopText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="MY EVENT 2026" />
          </div>
          <div>
            <label className="text-xs font-medium">Bottom arc text ({bottomText.length}/24)</label>
            <input value={bottomText} onChange={e=>setBottomText(e.target.value.slice(0,24))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="ONCHAIN POAP • BASE" />
          </div>
        </div>
      </div>
    </div>
  );
}
