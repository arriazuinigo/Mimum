// ui-charts.jsx — calm, pastel data viz for Lumen
// Exports: LineChart, BPTrendChart, AdherenceOverlay, RingProgress, Sparkline,
//   MiniBars, Confetti, BloomDot

// smooth path (Catmull-Rom → cubic bezier)
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// Generic soft line chart with optional shaded healthy band
function LineChart({
  data, width = 320, height = 160, pad = { t: 16, r: 14, b: 26, l: 30 },
  yMin, yMax, band, color = 'var(--blush-500)', fillColor = 'oklch(80% 0.09 18 / 0.14)',
  labels, yTicks, unit = '', animate = true, dots = true, secondary, manualIdx = [],
}) {
  const W = width, H = height;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const lo = yMin != null ? yMin : Math.min(...data) - 6;
  const hi = yMax != null ? yMax : Math.max(...data) + 6;
  const x = (i) => pad.l + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - ((v - lo) / (hi - lo)) * innerH;
  const pts = data.map((v, i) => [x(i), y(v)]);
  const line = smoothPath(pts);
  const area = `${line} L ${pts[pts.length - 1][0]} ${pad.t + innerH} L ${pts[0][0]} ${pad.t + innerH} Z`;
  const dash = 900;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* y gridlines */}
      {(yTicks || []).map((t, i) => (
        <g key={i}>
          <line x1={pad.l} y1={y(t)} x2={W - pad.r} y2={y(t)} stroke="var(--hairline)" strokeWidth="1" strokeDasharray="1 5" strokeLinecap="round" />
          <text x={pad.l - 7} y={y(t) + 4} fontSize="11" fontWeight="600" fill="var(--ink-3)" textAnchor="end">{t}</text>
        </g>
      ))}
      {/* healthy band */}
      {band && (
        <g>
          <rect x={pad.l} y={y(band.to)} width={innerW} height={Math.max(0, y(band.from) - y(band.to))}
            fill="var(--sage-fill)" opacity="0.7" rx="8" />
          <line x1={pad.l} y1={y(band.from)} x2={W - pad.r} y2={y(band.from)} stroke="var(--sage-dot)" strokeWidth="1.4" strokeDasharray="4 5" opacity="0.6" strokeLinecap="round" />
          <text x={W - pad.r} y={y(band.to) - 5} fontSize="10.5" fontWeight="700" fill="var(--sage-ink)" textAnchor="end">healthy range</text>
        </g>
      )}
      {/* secondary series (e.g. diastolic) */}
      {secondary && (() => {
        const sp = secondary.data.map((v, i) => [x(i), y(v)]);
        return <path d={smoothPath(sp)} fill="none" stroke={secondary.color || 'var(--lav-dot)'} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 6" opacity="0.85" />;
      })()}
      {/* area + line */}
      <path d={area} fill={fillColor} />
      <path d={line} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
        style={animate ? { strokeDasharray: dash, '--dash': dash, animation: 'drawLine 1.1s ease forwards' } : {}} />
      {/* dots */}
      {dots && pts.map((p, i) => (
        manualIdx.includes(i) ? (
          <rect key={i} x={p[0] - 5} y={p[1] - 5} width={10} height={10} rx={2.5}
            fill="var(--surface)" stroke={color} strokeWidth="2.6" transform={`rotate(45 ${p[0]} ${p[1]})`} />
        ) : (
          <circle key={i} cx={p[0]} cy={p[1]} r="5.5" fill="var(--surface)" stroke={color} strokeWidth="2.6" />
        )
      ))}
      {/* x labels */}
      {(labels || []).map((l, i) => (
        <text key={i} x={x(i)} y={H - 7} fontSize="11" fontWeight="600" fill="var(--ink-3)" textAnchor="middle">{l}</text>
      ))}
    </svg>
  );
}

// BP-specific wrapper (systolic line + diastolic + healthy band)
function BPTrendChart({ sys, dia, labels, height = 180, manualIdx = [] }) {
  return (
    <LineChart
      data={sys} secondary={{ data: dia, color: 'var(--lav-dot)' }}
      labels={labels} yMin={60} yMax={150} band={{ from: 0, to: 130 }}
      yTicks={[80, 110, 140]} height={height} manualIdx={manualIdx}
      color="var(--blush-500)" fillColor="oklch(80% 0.09 18 / 0.12)"
    />
  );
}

// BP vs medication adherence overlay
function AdherenceOverlay({ sys, adherence, labels, height = 190 }) {
  const W = 320, H = height, pad = { t: 16, r: 14, b: 28, l: 30 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const lo = 60, hi = 150;
  const x = (i) => pad.l + (i / (sys.length - 1)) * innerW;
  const y = (v) => pad.t + innerH - ((v - lo) / (hi - lo)) * innerH;
  const pts = sys.map((v, i) => [x(i), y(v)]);
  const barW = innerW / sys.length * 0.42;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      <rect x={pad.l} y={y(130)} width={innerW} height={Math.max(0, y(0) - y(130) + 0)} fill="var(--sage-fill)" opacity="0.55" rx="8" />
      {/* adherence bars (bottom-anchored) */}
      {adherence.map((a, i) => {
        const full = a >= 1;
        const bh = 30 * (full ? 1 : a > 0 ? 0.55 : 0.18);
        return (
          <rect key={i} x={x(i) - barW / 2} y={pad.t + innerH - bh} width={barW} height={bh} rx={barW / 2}
            fill={full ? 'var(--blush-200)' : a > 0 ? 'var(--honey-fill)' : 'var(--bg-soft)'} />
        );
      })}
      <path d={smoothPath(pts)} fill="none" stroke="var(--blush-500)" strokeWidth="3" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill="var(--surface)" stroke="var(--blush-500)" strokeWidth="2.4" />)}
      {labels.map((l, i) => <text key={i} x={x(i)} y={H - 8} fontSize="10.5" fontWeight="600" fill="var(--ink-3)" textAnchor="middle">{l}</text>)}
    </svg>
  );
}

// Circular ring progress
function RingProgress({ value = 0, size = 64, stroke = 7, color = 'var(--blush-500)', track = 'var(--blush-100)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)}
          style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      {children && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>}
    </div>
  );
}

// Tiny sparkline
function Sparkline({ data, width = 70, height = 26, color = 'var(--blush-500)' }) {
  const lo = Math.min(...data), hi = Math.max(...data);
  const x = (i) => (i / (data.length - 1)) * width;
  const y = (v) => height - 3 - ((v - lo) / (hi - lo || 1)) * (height - 6);
  const pts = data.map((v, i) => [x(i), y(v)]);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.6" fill={color} />
    </svg>
  );
}

function MiniBars({ data, height = 40, color = 'var(--blush-300)', activeColor = 'var(--blush-500)' }) {
  const hi = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, height: `${Math.max(8, (v / hi) * 100)}%`, borderRadius: 5,
          background: i === data.length - 1 ? activeColor : color,
        }} />
      ))}
    </div>
  );
}

// Confetti burst (pastel squares like the mascot's celebration)
function Confetti({ count = 26, run = true }) {
  const colors = ['oklch(85% 0.09 150)', 'oklch(86% 0.08 250)', 'oklch(90% 0.09 95)', 'var(--blush-300)', 'var(--lav-dot)'];
  const pieces = React.useMemo(() => Array.from({ length: count }).map((_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.9,
    dur: 2.2 + Math.random() * 1.4,
    size: 7 + Math.random() * 7,
    color: colors[i % colors.length],
    rot: Math.random() * 360,
    round: Math.random() > 0.6,
  })), [count]);
  if (!run) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 5 }}>
      {pieces.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', top: -16, left: `${p.left}%`,
          width: p.size, height: p.size, background: p.color,
          borderRadius: p.round ? '50%' : 3, transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }} />
      ))}
    </div>
  );
}

// A single calendar "bloom" dot
function BloomDot({ size = 12, color = 'var(--blush-400)', bloom = true }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '40% 40% 45% 45% / 48% 48% 40% 40%',
      background: color, display: 'inline-block',
      animation: bloom ? 'bloom .5s ease both' : 'none',
    }} />
  );
}

Object.assign(window, {
  LineChart, BPTrendChart, AdherenceOverlay, RingProgress, Sparkline, MiniBars, Confetti, BloomDot, smoothPath,
});
