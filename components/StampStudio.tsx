"use client";
import { useState, useMemo } from 'react';

const SHAPES = [
  { id: 'scallop', label: 'Scallop', desc: 'Gold serrated' },
  { id: 'classic', label: 'Classic', desc: 'Smooth double' },
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
  const [topText, setTopText] = useState('MY EVENT 2026');
  const [bottomText, setBottomText] = useState('ONCHAIN • POAP • BASE');
  const [participantText, setParticipantText] = useState('PARTICIPANT');
  const [center, setCenter] = useState('🏆');
  const [useEmoji, setUseEmoji] = useState(true);
  const pal = PALETTES.find(p=>p.id===palette)!;

  const svg = useMemo(()=>{
    const bg = pal.bg;
    const esc = (s:string)=> s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const top = esc(topText.slice(0,22) || 'MY EVENT 2026');
    const banner = esc(bottomText.slice(0,26) || 'ONCHAIN • POAP • BASE');
    const participant = esc(participantText.slice(0,20) || 'PARTICIPANT');
    const mid = useEmoji ? center : esc(topText.slice(0,2) || 'PO');

    // Adapt TOP colors to our system: dark enamel -> deep ink-teal #0F2B26 (close to ink #2E1A0F but green), gold -> brass #C9A66B
    const dark = '#0F2B26';
    const gold = '#C8AD73';
    const goldLight = '#EADDC0';
    const goldDeep = '#A88A4A';
    const paper = bg;

    // topArc: all shapes — MY EVENT 2026 goes up to the gold circle but not outside
    const topArcD = 'M 42 78 A 64 64 0 0 1 158 78';
    const defs = `
  <defs>
    <path id="topArc" d="${topArcD}"/>
    <path id="bannerPath" d="M 58 121.5 H 142"/>
    <filter id="goldShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.2" stdDeviation="1.3" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>`;

    // Outer serrated bezel (gold) — 32 teeth — bigger
    const serratedOuter = (()=> {
      const teeth=32; let d='';
      for(let i=0;i<teeth;i++){
        const a0=(i/teeth)*360-90, a1=((i+0.5)/teeth)*360-90, a2=((i+1)/teeth)*360-90;
        const rBase=90, rTip=95.5;
        const x0=(100+rBase*Math.cos(a0*Math.PI/180)).toFixed(1);
        const y0=(100+rBase*Math.sin(a0*Math.PI/180)).toFixed(1);
        const xm=(100+rTip*Math.cos(a1*Math.PI/180)).toFixed(1);
        const ym=(100+rTip*Math.sin(a1*Math.PI/180)).toFixed(1);
        const x1=(100+rBase*Math.cos(a2*Math.PI/180)).toFixed(1);
        const y1=(100+rBase*Math.sin(a2*Math.PI/180)).toFixed(1);
        if(i===0) d+=`M ${x0} ${y0} `;
        d+=`Q ${xm} ${ym} ${x1} ${y1} `;
      }
      d+='Z';
      return `<path d="${d}" fill="${gold}" stroke="${goldDeep}" stroke-width="0.75"/>`;
    })();

    const smoothOuter = `<circle cx="100" cy="100" r="91.5" fill="${gold}" stroke="${goldDeep}" stroke-width="0.85"/>`;
    const gearOuter = (()=> {
      const teeth=16; let d='';
      for(let i=0;i<teeth;i++){
        const a0=(i/teeth)*360-90, a1=((i+0.5)/teeth)*360-90, a2=((i+1)/teeth)*360-90;
        const rBase=86.5, rTip=93.2;
        const x0=(100+rBase*Math.cos(a0*Math.PI/180)).toFixed(1);
        const y0=(100+rBase*Math.sin(a0*Math.PI/180)).toFixed(1);
        const xm=(100+rTip*Math.cos(a1*Math.PI/180)).toFixed(1);
        const ym=(100+rTip*Math.sin(a1*Math.PI/180)).toFixed(1);
        const x1=(100+rBase*Math.cos(a2*Math.PI/180)).toFixed(1);
        const y1=(100+rBase*Math.sin(a2*Math.PI/180)).toFixed(1);
        if(i===0) d+=`M ${x0} ${y0} `;
        // gear notch: sharp tip
        d+=`L ${xm} ${ym} L ${x1} ${y1} `;
      }
      d+='Z';
      return `<path d="${d}" fill="${gold}" stroke="${goldDeep}" stroke-width="0.75" stroke-linejoin="round"/>`;
    })();

    const outer = shape==='scallop' ? serratedOuter : shape==='gear' ? gearOuter : smoothOuter;

    // laurels — 5 leaves per side, gold — made bigger and clearer (1.15 scale, thicker stroke)
    const laurelLeft = [88,95,103,111,118].map((y,i)=>{
      const x = 68 - i*0.5; const s = 1.15 - i*0.06; const rot = -16 + i*3;
      return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="${goldLight}" stroke="${goldDeep}" stroke-width="0.55" stroke-linejoin="round"/><path d="M0 0 L 6.5 1.1" stroke="${goldDeep}" stroke-width="0.45" opacity="0.95"/></g>`;
    }).join('');
    const laurelRight = [88,95,103,111,118].map((y,i)=>{
      const x = 132 + i*0.5; const s = 1.15 - i*0.06; const rot = 16 - i*3;
      return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -7.5 C 3.6 -3.2 3.6 3.2 0 7.5 C -3.6 3.2 -3.6 -3.2 0 -7.5 Z M0 -7.5 C 1.4 -3 1.4 3 0 7.5" fill="${goldLight}" stroke="${goldDeep}" stroke-width="0.55"/><path d="M0 0 L -6.5 1.1" stroke="${goldDeep}" stroke-width="0.45" opacity="0.95"/></g>`;
    }).join('');

    // star field — 8 tiny gold stars — bigger (3px) and higher opacity so tiny designs show well
    const stars = [
      [76,68],[124,68],[86,73],[114,73],[72,96],[128,96],[83,108],[117,108]
    ].map(([x,y])=> `<g transform="translate(${x} ${y})"><path d="M0 -3 L0.95 -0.95 L3 0 L0.95 0.95 L0 3 L-0.95 0.95 L-3 0 L-0.95 -0.95 Z" fill="${goldLight}" opacity="1"/><circle cx="0" cy="0" r="0.45" fill="${goldDeep}" opacity="0.95"/></g>`).join('');

    // central dark enamel — big (75.5, not very big) + outer also bigger
    const innerDark = `<circle cx="100" cy="100" r="75.5" fill="${dark}" stroke="${gold}" stroke-width="1.55"/>
  <circle cx="100" cy="100" r="73.2" fill="none" stroke="${goldLight}" stroke-width="0.55" opacity="0.40"/>
  <circle cx="100" cy="100" r="57.2" fill="none" stroke="${gold}" stroke-width="0.55" stroke-dasharray="1.9 4" opacity="0.52"/>
  <circle cx="100" cy="100" r="52.5" fill="none" stroke="${goldLight}" stroke-width="0.45" stroke-dasharray="0.9 5.5" opacity="0.24"/>`;

    // banner — ONCHAIN • POAP • BASE
    const bannerBox = `<g filter="url(#goldShadow)">
    <rect x="44" y="118.5" width="112" height="15.2" rx="1.6" fill="none" stroke="${gold}" stroke-width="1.15"/>
    <rect x="44" y="118.5" width="112" height="15.2" rx="1.6" fill="${dark}" />
    <rect x="45.2" y="119.7" width="109.6" height="12.8" rx="1" fill="none" stroke="${goldLight}" stroke-width="0.4" opacity="0.55"/>
  </g>
  <text x="100" y="128.8" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="7.2" font-weight="700" letter-spacing="1.45" fill="${goldLight}">${banner}</text>`;

    // participant bottom + star
    const participantRow = `<text x="100" y="142.8" text-anchor="middle" font-family="Inter, ui-sans-serif, system-ui" font-size="6.4" font-weight="600" letter-spacing="2.2" fill="${goldLight}" opacity="0.92">${participant}</text>
  <g transform="translate(100 149)"><path d="M0 -2.4 L0.8 -0.8 L2.4 0 L0.8 0.8 L0 2.4 L-0.8 0.8 L-2.4 0 L-0.8 -0.8 Z" fill="${goldLight}"/><circle cx="0" cy="0" r="0.4" fill="${dark}"/></g>`;

    // top curved MY EVENT 2026 — gold serif
    const topArcText = `<text fill="${goldLight}" font-family="Cormorant Garamond, Georgia, serif" font-size="13.2" font-weight="700" letter-spacing="2.1" text-anchor="middle">
    <textPath href="#topArc" startOffset="50%" dominant-baseline="middle">${top}</textPath>
  </text>
  <g transform="translate(100 56)"><path d="M0 -2.6 L0.9 -0.9 L2.6 0 L0.9 0.9 L0 2.6 L-0.9 0.9 L-2.6 0 L-0.9 -0.9 Z" fill="${goldLight}"/></g>`;

    // center — user selected (ignore temple) : big emoji/icon on dark
    const centerContent = `<text x="100" y="98.5" text-anchor="middle" dominant-baseline="middle" font-size="36" style="filter: drop-shadow(0 1.2px 0 rgba(0,0,0,0.5))">${mid}</text>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img">
  <rect width="200" height="200" rx="22" fill="${paper}"/>
  ${defs}
  ${outer}
  ${innerDark}
  ${topArcText}
  ${stars}
  ${laurelLeft}
  ${laurelRight}
  ${centerContent}
  ${bannerBox}
  ${participantRow}
</svg>`;
  }, [shape, palette, topText, bottomText, participantText, center, useEmoji, pal]);

  const estBytes = new Blob([svg]).size;
  return (
    <div className="space-y-4">
      <div className="archive-card overflow-hidden" style={{borderRadius:'2px'}}>
        <div className="h-[270px] sm:h-[290px] flex items-center justify-center p-3 relative overflow-hidden" style={{background:'#FFFBF0'}}>
          <div className="absolute inset-0 opacity-[0.035]" style={{backgroundImage:'radial-gradient(circle at 1px 1px, #9B2C2C 1px, transparent 0)', backgroundSize:'16px 16px'}} />
          <div className="w-full max-w-[240px] sm:max-w-[250px] aspect-square flex items-center justify-center p-0 relative">
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
                    {s.id==='scallop' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke={isActive ? '#9B2C2C' : '#C8AD73'} strokeWidth="1.4" strokeDasharray="1.8 1.6"/><path d="M12 3.2 L12.6 5.1 L14.5 4.4 L15 6.3 L16.9 6 L16.7 8 L18.6 8.4 L17.8 10.1 L19.5 11 L18.1 12.5 L19.2 14.1 L17.4 14.9 L17.8 16.9 L16 16.7 L15.2 18.5 L13.6 17.4 L12 18.8 L10.4 17.4 L8.8 18.5 L8 16.7 L6.2 16.9 L6.6 14.9 L4.8 14.1 L5.9 12.5 L4.5 11 L6.2 10.1 L5.4 8.4 L7.3 8 L7.1 6 L9 6.3 L9.5 4.4 L11.4 5.1 Z" fill={isActive ? '#9B2C2C' : '#C8AD73'} opacity="0.25"/><circle cx="12" cy="12" r="3.2" fill={isActive ? '#fff' : '#FFFBF0'} stroke={isActive ? '#fff' : '#C8AD73'} strokeWidth="1"/></svg>}
                    {s.id==='classic' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={isActive ? '#9B2C2C' : '#C8AD73'} strokeWidth="1.5"/><circle cx="12" cy="12" r="6" stroke={isActive ? '#9B2C2C' : '#C8AD73'} strokeWidth="0.9" strokeDasharray="2.2 2" opacity="0.6"/><circle cx="12" cy="12" r="1.8" fill={isActive ? '#fff' : '#C8AD73'}/></svg>}
                    {s.id==='gear' && <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z" stroke={isActive ? '#9B2C2C' : '#C8AD73'} strokeWidth="1.4"/><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6.1 6.1l1.6 1.6M16.3 16.3l1.6 1.6M6.1 17.9l1.6-1.6M16.3 7.7l1.6-1.6" stroke={isActive ? '#9B2C2C' : '#C8AD73'} strokeWidth="1" strokeLinecap="round"/></svg>}
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
          <div className="text-xs font-medium uppercase tracking-widest text-muted">Center icon</div>
          <div className="mt-2 flex gap-1.5 flex-wrap">
            {EMOJIS.map(e=> (
              <button key={e} onClick={()=>{setCenter(e); setUseEmoji(true);}} className={`w-9 h-9 rounded-[2px] border flex items-center justify-center text-lg ${center===e && useEmoji ? 'bg-brand-red text-white border-brand-red' : 'bg-white border-line hover:border-brass'}`}>{e}</button>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" checked={useEmoji} onChange={e=>setUseEmoji(e.target.checked)} /> Use icon in middle (uncheck to show initials)</label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium">Top arc ({topText.length}/22)</label>
            <input value={topText} onChange={e=>setTopText(e.target.value.slice(0,22))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="MY EVENT 2026" />
          </div>
          <div>
            <label className="text-xs font-medium">Banner ({bottomText.length}/26)</label>
            <input value={bottomText} onChange={e=>setBottomText(e.target.value.slice(0,26))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="ONCHAIN • POAP • BASE" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium">Event writing — bottom ({participantText.length}/20)</label>
          <input value={participantText} onChange={e=>setParticipantText(e.target.value.slice(0,20))} className="mt-1 w-full rounded-[2px] border border-line px-3 py-2 text-sm" placeholder="PARTICIPANT" />
          <div className="text-xs text-muted mt-1">Appears under the banner — e.g., PARTICIPANT, SPEAKER, STAFF, VIP. Editable like top/banner.</div>
        </div>
      </div>
    </div>
  );
}
