// ui-core.jsx — shared design-system components for Optimal Physique
// Exports to window: Mascot, AppScreen, ScreenHeader, Card, TintCard, Stat,
//   PrimaryButton, SoftButton, GhostButton, IconButton, Pill, TierPill,
//   StreakStrip, TabBar, Icon, Badge, ProgressDots, Divider, Avatar

const __R = (typeof window !== 'undefined' && window.__resources) || {};
const MASCOT_SRC = {
  calm: __R.mascotCalm || 'assets/mascot-calm.png',
  breathing: __R.mascotBreathing || 'assets/mascot-breathing.png',
  celebrating: __R.mascotCelebrating || 'assets/mascot-celebrating.png',
  proud: __R.mascotProud || 'assets/mascot-proud.png',
  sleepy: __R.mascotSleepy || 'assets/mascot-sleepy.png',
};

// ── Mascot ─────────────────────────────────────────────────────
function Mascot({ state = 'calm', h = 180, float = false, scale = 1, style = {}, alt }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: float ? 'mascotFloat 6s ease-in-out infinite' : 'none',
        ...style,
      }}
    >
      <img
        src={MASCOT_SRC[state] || MASCOT_SRC.calm}
        alt={alt || 'Optimal Physique companion'}
        style={{
          height: h, width: 'auto', display: 'block',
          transform: `scale(${scale})`,
          transition: 'transform 120ms linear',
          filter: 'drop-shadow(0 18px 24px oklch(70% 0.10 18 / 0.20))',
        }}
      />
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────
function AppScreen({ children, pad = true, bg = 'var(--bg-app)', scrollRef, style = {} }) {
  return (
    <div
      ref={scrollRef}
      style={{
        position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
        background: bg,
        padding: pad ? '58px 20px 116px' : '0',
        WebkitOverflowScrolling: 'touch',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ScreenHeader({ eyebrow, title, trailing, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && (
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: 'var(--rose-ink)', textTransform: 'uppercase', marginBottom: 4 }}>{eyebrow}</div>
        )}
        <h1 style={{ margin: 0, fontSize: 27, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)', lineHeight: 1.1 }}>{title}</h1>
        {sub && <p style={{ margin: '6px 0 0', fontSize: 15, color: 'var(--ink-2)', lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {trailing}
    </div>
  );
}

function Divider({ style = {} }) {
  return <div style={{ height: 1, background: 'var(--hairline)', margin: '4px 0', ...style }} />;
}

// ── Cards ──────────────────────────────────────────────────────
function Card({ children, pad = 20, onClick, style = {}, soft = true, ...rest }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--surface)', borderRadius: 'var(--r-card)',
        padding: pad, boxShadow: soft ? 'var(--sh-soft)' : 'none',
        border: '1px solid oklch(92% 0.008 24 / 0.6)',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

function TintCard({ children, tint = 'var(--blush-50)', pad = 20, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: tint, borderRadius: 'var(--r-card)', padding: pad,
        cursor: onClick ? 'pointer' : 'default', ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────
function pressHandlers(scale = 0.96) {
  return {
    onPointerDown: (e) => { e.currentTarget.style.transform = `scale(${scale})`; },
    onPointerUp: (e) => { e.currentTarget.style.transform = 'scale(1)'; },
    onPointerLeave: (e) => { e.currentTarget.style.transform = 'scale(1)'; },
  };
}

function PrimaryButton({ children, onClick, full = true, icon, style = {}, tone = 'blush' }) {
  const bg = tone === 'blush'
    ? 'linear-gradient(180deg, var(--blush-400), var(--blush-500))'
    : 'linear-gradient(180deg, var(--sage-dot), oklch(66% 0.085 152))';
  return (
    <button
      onClick={onClick} {...pressHandlers()}
      style={{
        width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        height: 56, padding: '0 26px', borderRadius: 'var(--r-pill)',
        background: bg, color: '#fff',
        fontSize: 17, fontWeight: 700, letterSpacing: 0.1,
        boxShadow: 'var(--sh-btn)', transition: 'transform 110ms ease',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

function SoftButton({ children, onClick, full = false, icon, style = {} }) {
  return (
    <button
      onClick={onClick} {...pressHandlers(0.97)}
      style={{
        width: full ? '100%' : 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 52, padding: '0 22px', borderRadius: 'var(--r-pill)',
        background: 'var(--blush-100)', color: 'var(--rose-ink)',
        fontSize: 16, fontWeight: 700, transition: 'transform 110ms ease',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

function GhostButton({ children, onClick, icon, style = {} }) {
  return (
    <button
      onClick={onClick} {...pressHandlers(0.97)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        height: 48, padding: '0 16px', borderRadius: 'var(--r-pill)',
        background: 'transparent', color: 'var(--ink-2)',
        fontSize: 15.5, fontWeight: 600, transition: 'transform 110ms ease',
        ...style,
      }}
    >
      {icon}{children}
    </button>
  );
}

function IconButton({ icon, onClick, size = 44, style = {}, label }) {
  return (
    <button
      onClick={onClick} aria-label={label} {...pressHandlers(0.92)}
      style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)', color: 'var(--ink-2)',
        boxShadow: 'var(--sh-soft)', transition: 'transform 110ms ease',
        border: '1px solid oklch(92% 0.008 24 / 0.6)', flexShrink: 0,
        ...style,
      }}
    >
      {icon}
    </button>
  );
}

// ── Pills & tiers ──────────────────────────────────────────────
function Pill({ children, tone = 'blush', style = {} }) {
  const map = {
    blush: ['var(--blush-100)', 'var(--rose-ink)'],
    sage: ['var(--sage-fill)', 'var(--sage-ink)'],
    honey: ['var(--honey-fill)', 'var(--honey-ink)'],
    lav: ['var(--lav-fill)', 'var(--lav-ink)'],
    plain: ['var(--bg-soft)', 'var(--ink-2)'],
  };
  const [bg, fg] = map[tone] || map.blush;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, color: fg, fontSize: 13, fontWeight: 700,
      padding: '6px 12px', borderRadius: 'var(--r-pill)', ...style,
    }}>{children}</span>
  );
}

// tier: 'steady' | 'attention'
function TierPill({ tier = 'steady', size = 'md' }) {
  const cfg = tier === 'attention'
    ? { fill: 'var(--honey-fill)', dot: 'var(--honey-dot)', ink: 'var(--honey-ink)', label: 'Ajustar' }
    : { fill: 'var(--sage-fill)', dot: 'var(--sage-dot)', ink: 'var(--sage-ink)', label: 'En plan' };
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: big ? 9 : 7,
      background: cfg.fill, color: cfg.ink,
      fontSize: big ? 15 : 13, fontWeight: 700,
      padding: big ? '9px 16px 9px 13px' : '6px 12px 6px 10px', borderRadius: 'var(--r-pill)',
    }}>
      <span style={{ width: big ? 11 : 9, height: big ? 11 : 9, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 0 4px ${cfg.fill}` }} />
      {cfg.label}
    </span>
  );
}

// ── Streak strip (7 day) ───────────────────────────────────────
function StreakStrip({ days, compact = false }) {
  // days: array of 7 { label, state: 'done'|'today'|'future' }
  return (
    <div style={{ display: 'flex', gap: compact ? 8 : 10, justifyContent: 'space-between' }}>
      {days.map((d, i) => {
        const done = d.state === 'done';
        const today = d.state === 'today';
        const sz = compact ? 30 : 38;
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
            <div style={{
              width: sz, height: sz, borderRadius: '38% 38% 42% 42% / 44% 44% 38% 38%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? 'linear-gradient(160deg, var(--blush-300), var(--blush-500))'
                : today ? 'var(--blush-50)' : 'var(--bg-soft)',
              border: today ? '2px solid var(--blush-400)' : '2px solid transparent',
              boxShadow: done ? '0 4px 10px oklch(72% 0.10 18 / 0.30)' : 'none',
              color: '#fff', transition: 'all .3s ease',
            }}>
              {done && <Icon name="check" size={16} stroke="#fff" sw={2.6} />}
              {today && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blush-400)' }} />}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: today ? 'var(--rose-ink)' : 'var(--ink-3)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Milestone badge ────────────────────────────────────────────
function Badge({ icon = 'sparkle', label, earned = true, tone = 'blush' }) {
  const tones = {
    blush: ['var(--blush-150)', 'var(--rose-ink)'],
    sage: ['var(--sage-fill)', 'var(--sage-ink)'],
    honey: ['var(--honey-fill)', 'var(--honey-ink)'],
    lav: ['var(--lav-fill)', 'var(--lav-ink)'],
  };
  const [bg, fg] = tones[tone] || tones.blush;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: earned ? 1 : 0.4, width: 78 }}>
      <div style={{
        width: 62, height: 62, borderRadius: '50%', background: earned ? bg : 'var(--bg-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: earned ? fg : 'var(--ink-3)',
        boxShadow: earned ? 'inset 0 0 0 2px oklch(100% 0 0 / 0.5)' : 'none',
      }}>
        <Icon name={earned ? icon : 'lock'} size={26} stroke={earned ? fg : 'var(--ink-3)'} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

// ── Progress dots (onboarding) ─────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 6, borderRadius: 99, transition: 'all .35s ease',
          width: i === current ? 22 : 6,
          background: i <= current ? 'var(--blush-400)' : 'var(--blush-150)',
        }} />
      ))}
    </div>
  );
}

// ── Tab bar ────────────────────────────────────────────────────
function TabBar({ active, onNav }) {
  const tabs = [
    { id: 'home', label: 'Plan', icon: 'home' },
    { id: 'journey', label: 'Progreso', icon: 'calendar' },
    { id: 'measure', label: '', icon: 'pulse', center: true },
    { id: 'trends', label: 'Tendencias', icon: 'chart' },
    { id: 'log', label: 'Diario', icon: 'log' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40,
      paddingBottom: 22,
      background: 'linear-gradient(180deg, oklch(98.4% 0.008 28 / 0), var(--bg-app) 38%)',
    }}>
      <div style={{
        margin: '0 14px', height: 64, borderRadius: 26,
        background: 'oklch(99.6% 0.004 40 / 0.86)',
        backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        boxShadow: 'var(--sh-lift)', border: '1px solid oklch(92% 0.01 24 / 0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px',
      }}>
        {tabs.map((t) => {
          if (t.center) {
            return (
              <button key={t.id} onClick={() => onNav('measure')} {...pressHandlers(0.9)}
                style={{
                  width: 60, height: 60, borderRadius: '50%', marginTop: -22,
                  background: 'linear-gradient(165deg, var(--blush-400), var(--blush-500))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 20px oklch(70% 0.11 18 / 0.45)', transition: 'transform 110ms ease',
                  border: '3px solid var(--surface)',
                }}>
                <Icon name="pulse" size={26} stroke="#fff" sw={2.2} />
              </button>
            );
          }
          const on = active === t.id;
          return (
            <button key={t.id} onClick={() => onNav(t.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                background: 'none', padding: '8px 0',
              }}>
              <Icon name={t.icon} size={23} stroke={on ? 'var(--blush-500)' : 'var(--ink-3)'} sw={on ? 2.2 : 1.9} fill={on ? 'var(--blush-100)' : 'none'} />
              <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? 'var(--blush-500)' : 'var(--ink-3)' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────
function Avatar({ initials = 'M', size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(160deg, var(--blush-200), var(--blush-400))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: 800, fontSize: size * 0.4, flexShrink: 0,
      boxShadow: 'inset 0 0 0 2px oklch(100% 0 0 / 0.4)',
    }}>{initials}</div>
  );
}

// ── Icon set (simple strokes) ──────────────────────────────────
function Icon({ name, size = 24, stroke = 'currentColor', fill = 'none', sw = 1.9 }) {
  const p = { fill: 'none', stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path {...p} fill={fill} d="M4 11.5 12 4l8 7.5" /><path {...p} fill={fill} d="M6 10.5V20h12v-9.5" /></>,
    calendar: <><rect {...p} fill={fill} x="3.5" y="5" width="17" height="15.5" rx="4" /><path {...p} d="M3.5 9.5h17M8 3.5v3M16 3.5v3" /></>,
    pulse: <path {...p} d="M3 12h3.5l2-5 3 10 2.5-7 1.6 2h4.4" />,
    chart: <><path {...p} d="M4 4v16h16" /><path {...p} fill={fill} d="M8 14l3-3 2.5 2.5L19 8" /></>,
    log: <><rect {...p} fill={fill} x="5" y="3.5" width="14" height="17" rx="4" /><path {...p} d="M9 9h6M9 13h6M9 17h3.5" /></>,
    check: <path {...p} d="M5 12.5l4 4 10-10.5" />,
    plus: <path {...p} d="M12 5v14M5 12h14" />,
    minus: <path {...p} d="M5 12h14" />,
    close: <path {...p} d="M6 6l12 12M18 6L6 18" />,
    chevronLeft: <path {...p} d="M14.5 5l-7 7 7 7" />,
    chevronRight: <path {...p} d="M9.5 5l7 7-7 7" />,
    chevronDown: <path {...p} d="M5 9.5l7 7 7-7" />,
    bluetooth: <path {...p} d="M7 7.5l10 9-5 4V4l5 4-10 9" />,
    heart: <path {...p} fill={fill} d="M12 20s-7-4.6-7-9.3A3.7 3.7 0 0 1 12 8a3.7 3.7 0 0 1 7 2.7C19 15.4 12 20 12 20Z" />,
    sparkle: <><path {...p} fill={fill} d="M12 4l1.8 4.4L18 10l-4.2 1.6L12 16l-1.8-4.4L6 10l4.2-1.6z" /><path {...p} d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" /></>,
    pill: <><rect {...p} x="3.5" y="9" width="17" height="7" rx="3.5" transform="rotate(-40 12 12)" /><path {...p} d="M9 7l5 5" /></>,
    drop: <path {...p} fill={fill} d="M12 4s5.5 6 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 10 12 4 12 4Z" />,
    weight: <><path {...p} fill={fill} d="M7 8h10l1.5 11.5h-13z" /><path {...p} d="M9.5 8a2.5 2.5 0 0 1 5 0" /></>,
    mood: <><circle {...p} cx="12" cy="12" r="8.2" /><path {...p} d="M8.5 14.5a4 4 0 0 0 7 0" /><path {...p} d="M9 9.5h.01M15 9.5h.01" /></>,
    info: <><circle {...p} cx="12" cy="12" r="8.2" /><path {...p} d="M12 11v5M12 8h.01" /></>,
    share: <><path {...p} d="M12 15V4M8.5 7.5 12 4l3.5 3.5" /><path {...p} d="M6 12v6.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V12" /></>,
    bell: <><path {...p} d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path {...p} d="M10 19a2 2 0 0 0 4 0" /></>,
    sun: <><circle {...p} cx="12" cy="12" r="4" /><path {...p} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" /></>,
    moon: <path {...p} fill={fill} d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
    lock: <><rect {...p} x="5" y="10.5" width="14" height="9.5" rx="3" /><path {...p} d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
    arrowRight: <path {...p} d="M5 12h14M13 6l6 6-6 6" />,
    flag: <><path {...p} d="M6 21V4M6 4h11l-2.5 4L17 12H6" /></>,
    doc: <><path {...p} fill={fill} d="M7 3.5h6l5 5V20a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20V5a1.5 1.5 0 0 1 1-1.5z" /><path {...p} d="M13 3.5V9h5" /></>,
    leaf: <><path {...p} fill={fill} d="M5 19c0-8 6-13 14-13 0 8-6 13-14 13z" /><path {...p} d="M9 15c2.5-3 5-4.5 8-5.5" /></>,
    water: <path {...p} fill={fill} d="M12 3s6 6.5 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3 12 3Z" />,
    walk: <><circle {...p} cx="13" cy="4.5" r="1.6" /><path {...p} d="M11 21l1.5-6-2.5-2 1-5 3 2 3 1M10 13l-2 4" /></>,
    phone: <path {...p} fill={fill} d="M7 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 5 6a2 2 0 0 1 2-2z" />,
    clock: <><circle {...p} cx="12" cy="12" r="8.2" /><path {...p} d="M12 7.5V12l3 2" /></>,
    star: <path {...p} fill={fill} d="M12 4l2.3 4.8 5.2.6-3.9 3.5 1.1 5.1L12 15.9 7.3 18.5l1.1-5.1L4.5 9.9l5.2-.6z" />,
    trophy: <><path {...p} fill={fill} d="M7 4h10v4a5 5 0 0 1-10 0z" /><path {...p} d="M7 5H4.5v1.5A3 3 0 0 0 7 9.4M17 5h2.5v1.5A3 3 0 0 1 17 9.4M9.5 13.5h5L14 17h-4z M9 20h6" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {paths[name] || null}
    </svg>
  );
}

Object.assign(window, {
  Mascot, AppScreen, ScreenHeader, Card, TintCard, Divider,
  PrimaryButton, SoftButton, GhostButton, IconButton, Pill, TierPill,
  StreakStrip, Badge, ProgressDots, TabBar, Avatar, Icon, pressHandlers,
  MASCOT_SRC,
});
