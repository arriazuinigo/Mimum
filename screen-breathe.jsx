// screen-breathe.jsx — Breathe-then-measure ritual
// phases: intro → breathing → measuring → result
const { useState, useEffect, useRef } = React;

const BREATH_PHASES = [
  { name: 'in', dur: 4000, scale: 1, label: 'Breathe in', ease: 'cubic-bezier(.4,.0,.4,1)' },
  { name: 'hold', dur: 1600, scale: 1, label: 'Hold softly', ease: 'linear' },
  { name: 'out', dur: 6000, scale: 0.62, label: 'Breathe out', ease: 'cubic-bezier(.4,.0,.4,1)' },
];
const TOTAL_BREATHS = 4;
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const makeNormalReading = () => {
  const sys = randomInt(105, 119);
  const dia = randomInt(65, 79);
  return {
    sys,
    dia,
    pulse: randomInt(62, 84),
    tier: 'steady',
    manual: false,
    generated: true,
  };
};

function BreatheScreen({ onExit, onNav, onSaved, onSaveReading, simulate = 'inrange', start = 'intro' }) {
  // intro → connect → guide → breathing → measuring → result   (+ 'manual' branch)
  const [phase, setPhase] = useState(start);
  const [manualReading, setManualReading] = useState(null);
  const [syncedReading] = useState(() => makeNormalReading());

  const reading = manualReading || syncedReading;
  const lavBg = phase === 'breathing';

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: lavBg
        ? 'radial-gradient(130% 90% at 50% 18%, var(--lav-fill) 0%, var(--bg-app) 60%)'
        : 'radial-gradient(130% 90% at 50% 12%, var(--blush-100) 0%, var(--bg-app) 58%)',
      transition: 'background .8s ease',
    }}>
      {phase === 'intro' && <BreatheIntro onExit={onExit} onStart={() => setPhase('connect')} onManual={() => setPhase('manual')} />}
      {phase === 'connect' && <ConnectCuff onExit={onExit} onContinue={() => setPhase('guide')} onSkip={() => setPhase('breathing')} onManual={() => setPhase('manual')} />}
      {phase === 'guide' && <PlacementGuide onExit={onExit} onReady={() => setPhase('breathing')} onSkip={() => setPhase('breathing')} />}
      {phase === 'breathing' && <BreathePacer onSkip={() => setPhase('measuring')} onDone={() => setPhase('measuring')} onExit={onExit} />}
      {phase === 'measuring' && <Measuring onDone={() => setPhase('result')} onExit={onExit} />}
      {phase === 'manual' && <ManualEntry onBack={() => setPhase('intro')} onSave={(r) => { setManualReading(r); setPhase('result'); }} />}
      {phase === 'result' && <ResultView reading={reading} manual={!!manualReading} onExit={onExit} onNav={onNav} onSaved={onSaved} onSaveReading={onSaveReading} />}
    </div>
  );
}

// ── Intro ──────────────────────────────────────────────────────
function BreatheIntro({ onExit, onStart, onManual }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 24px 34px' }}>
      <TopClose onExit={onExit} />
      <div className="fade-up" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <Mascot state="calm" h={176} float />
        <h1 style={{ margin: '14px 0 0', fontSize: 28, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink)' }}>Let’s take a calm reading</h1>
        <p style={{ margin: '12px auto 0', maxWidth: 300, fontSize: 16, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
          We’ll set up your cuff, then breathe together for a moment. A calm body gives a truer resting number — and it’s good for your heart, too.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <Pill tone="lav"><Icon name="clock" size={14} stroke="var(--lav-ink)" />About 3 min</Pill>
          <Pill tone="blush"><Icon name="heart" size={13} stroke="var(--rose-ink)" />Connect → Breathe → Measure</Pill>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <PrimaryButton onClick={onStart}>Begin</PrimaryButton>
        <GhostButton onClick={onManual} icon={<Icon name="plus" size={17} stroke="var(--ink-3)" sw={2.2} />}>Enter a reading manually</GhostButton>
      </div>
    </div>
  );
}

// ── Connect cuff (Bluetooth pairing) ───────────────────────────
function ConnectCuff({ onExit, onContinue, onSkip, onManual }) {
  const [state, setState] = useState('searching'); // searching → connected
  useEffect(() => {
    const t = setTimeout(() => setState('connected'), 2600);
    return () => clearTimeout(t);
  }, []);
  const connected = state === 'connected';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 24px 34px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TopClose onExit={onExit} inline />
        <button onClick={onSkip} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-3)', background: 'none', padding: 8 }}>I know the drill</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', width: 230, height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!connected && [0, 1, 2].map((k) => (
            <div key={k} style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', border: '2px solid var(--blush-300)', opacity: 0, animation: `haloPulse 2.4s ${k * 0.7}s ease-out infinite` }} />
          ))}
          <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: connected ? 'var(--sage-fill)' : 'var(--blush-50)', transition: 'background .5s ease' }} />
          <div style={{ animation: connected ? 'none' : 'softPulse 2s ease-in-out infinite', position: 'relative' }}>
            <Mascot state="calm" h={120} />
          </div>
          {connected && (
            <div className="pop-in" style={{ position: 'absolute', bottom: 14, right: 40, width: 40, height: 40, borderRadius: '50%', background: 'var(--sage-dot)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-soft)', border: '3px solid var(--surface)' }}>
              <Icon name="check" size={20} stroke="#fff" sw={2.8} />
            </div>
          )}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, color: connected ? 'var(--sage-ink)' : 'var(--blush-600)' }}>
          <span style={{ animation: connected ? 'none' : 'softPulse 1.4s ease-in-out infinite' }}><Icon name="bluetooth" size={18} stroke={connected ? 'var(--sage-ink)' : 'var(--blush-600)'} sw={2.2} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: 0.2 }}>{connected ? 'Connected · Omron M7' : 'Searching for your cuff…'}</span>
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 25, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>{connected ? 'Your cuff is ready' : 'Connect your cuff'}</h1>
        <p style={{ margin: '8px auto 0', maxWidth: 280, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
          {connected ? 'Lovely. Mimo will take it from here whenever you’re ready.' : 'Switch your monitor on and keep it close. Mimo is looking for it now.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <PrimaryButton onClick={connected ? onContinue : undefined} style={{ opacity: connected ? 1 : 0.45 }}>Continue</PrimaryButton>
        <GhostButton onClick={onManual} icon={<Icon name="plus" size={17} stroke="var(--ink-3)" sw={2.2} />}>Enter manually instead</GhostButton>
      </div>
    </div>
  );
}

// ── Placement guide ────────────────────────────────────────────
function PlacementGuide({ onExit, onReady, onSkip }) {
  const steps = [
    ['heart', 'blush', 'Arm at heart level', 'Rest your arm on a table so the cuff sits level with your heart.'],
    ['walk', 'sage', 'Feet flat, back supported', 'Sit comfortably, both feet on the floor, back against the chair.'],
    ['leaf', 'lav', 'Soften and settle', 'Uncross your legs, rest your hand open, and relax your shoulders.'],
    ['clock', 'honey', 'Rest for 5 minutes', 'Give yourself a calm pause before measuring. No rush at all.'],
  ];
  const TONE_FILL = { blush: 'var(--blush-50)', sage: 'var(--sage-fill)', lav: 'var(--lav-fill)', honey: 'var(--honey-fill)' };
  const TONE_INK = { blush: 'var(--rose-ink)', sage: 'var(--sage-ink)', lav: 'var(--lav-ink)', honey: 'var(--honey-ink)' };
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '58px 24px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TopClose onExit={onExit} inline />
        <button onClick={onSkip} style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-3)', background: 'none', padding: 8 }}>I know the drill</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 12px' }}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <Mascot state="calm" h={104} />
          <h1 style={{ margin: '6px 0 0', fontSize: 23, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>Getting comfortable</h1>
          <p style={{ margin: '8px auto 0', maxWidth: 290, fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
            A good position gives a kinder, truer reading. Four easy steps.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {steps.map(([icon, tone, title, sub], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 20, background: 'var(--surface)', boxShadow: 'var(--sh-soft)', border: '1px solid oklch(92% 0.008 24 / 0.6)' }}>
              <div style={{ position: 'relative', width: 46, height: 46, borderRadius: 14, background: TONE_FILL[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={23} stroke={TONE_INK[tone]} />
                <span style={{ position: 'absolute', top: -6, left: -6, width: 22, height: 22, borderRadius: '50%', background: 'var(--surface)', boxShadow: 'var(--sh-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'var(--ink-2)' }}>{i + 1}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500, marginTop: 2, lineHeight: 1.4 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '10px 24px 30px', background: 'linear-gradient(180deg, transparent, var(--bg-app) 30%)' }}>
        <PrimaryButton onClick={onReady} icon={<Icon name="heart" size={19} stroke="#fff" fill="oklch(100% 0 0 / 0.25)" />}>I’m ready to breathe</PrimaryButton>
      </div>
    </div>
  );
}

// ── Manual BP entry ────────────────────────────────────────────
function ManualEntry({ onBack, onSave }) {
  const [sys, setSys] = useState(118);
  const [dia, setDia] = useState(76);
  const [pulse, setPulse] = useState(72);
  const [when, setWhen] = useState('now');

  const tier = (sys >= 130 || dia >= 80) ? 'attention' : 'steady';
  const whenOpts = [['now', 'Now'], ['earlier', 'Earlier today'], ['yesterday', 'Yesterday']];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <div style={{ padding: '58px 22px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={onBack} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={42} />
        <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Enter a reading</div>
        <div style={{ width: 42 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 16px' }}>
        <p style={{ margin: '0 2px 16px', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
          For readings taken at the pharmacy, your doctor’s, or with another device. It’ll sit right alongside your synced ones.
        </p>

        <Card pad={18} style={{ marginBottom: 14 }}>
          <BigStepper label="Systolic" sub="top number" value={sys} onChange={setSys} min={70} max={220} tone="blush" />
          <Divider style={{ margin: '14px 0' }} />
          <BigStepper label="Diastolic" sub="bottom number" value={dia} onChange={setDia} min={40} max={140} tone="lav" />
          <Divider style={{ margin: '14px 0' }} />
          <BigStepper label="Pulse" sub="beats per minute" value={pulse} onChange={setPulse} min={40} max={180} tone="sage" />
        </Card>

        {/* when */}
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', margin: '4px 2px 8px' }}>When was it taken?</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {whenOpts.map(([id, label]) => {
            const on = when === id;
            return (
              <button key={id} onClick={() => setWhen(id)} {...pressHandlers(0.97)} style={{
                flex: 1, padding: '12px 8px', borderRadius: 14, fontSize: 13.5, fontWeight: 700,
                background: on ? 'var(--blush-50)' : 'var(--surface)',
                color: on ? 'var(--rose-ink)' : 'var(--ink-2)',
                border: on ? '2px solid var(--blush-400)' : '2px solid oklch(92% 0.01 24 / 0.7)',
                boxShadow: on ? 'none' : 'var(--sh-soft)',
              }}>{label}</button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', borderRadius: 16, background: 'var(--bg-soft)', fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
          <Icon name="info" size={15} stroke="var(--ink-3)" />Manual readings show a small dot in your trends, so you always know which is which.
        </div>
      </div>

      <div style={{ padding: '10px 22px 30px', background: 'linear-gradient(180deg, transparent, var(--bg-app) 30%)' }}>
        <PrimaryButton onClick={() => onSave({ sys, dia, pulse, tier, manual: true, takenAtLabel: when })} icon={<Icon name="check" size={19} stroke="#fff" sw={2.4} />}>Save this reading</PrimaryButton>
      </div>
    </div>
  );
}

function BigStepper({ label, sub, value, onChange, min, max, tone = 'blush' }) {
  const TONE_INK = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', sage: 'var(--sage-ink)' };
  const clamp = (v) => Math.max(min, Math.min(max, v));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>{sub}</div>
      </div>
      <button onClick={() => onChange(clamp(value - 1))} {...pressHandlers(0.9)} style={stepBtnB}><Icon name="minus" size={18} stroke={TONE_INK[tone]} sw={2.4} /></button>
      <div style={{ minWidth: 48, textAlign: 'center' }}>
        <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>{value}</span>
      </div>
      <button onClick={() => onChange(clamp(value + 1))} {...pressHandlers(0.9)} style={stepBtnB}><Icon name="plus" size={18} stroke={TONE_INK[tone]} sw={2.4} /></button>
    </div>
  );
}
const stepBtnB = {
  width: 40, height: 40, borderRadius: '50%', background: 'var(--blush-100)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s ease', flexShrink: 0,
};

// ── Paced breathing ────────────────────────────────────────────
function BreathePacer({ onDone, onSkip, onExit }) {
  const [idx, setIdx] = useState(0);        // index into BREATH_PHASES
  const [breath, setBreath] = useState(1);  // current breath count
  const [scale, setScale] = useState(0.62);
  const timer = useRef(null);

  useEffect(() => {
    const ph = BREATH_PHASES[idx];
    // apply target scale for this phase
    requestAnimationFrame(() => setScale(ph.scale));
    timer.current = setTimeout(() => {
      if (idx === BREATH_PHASES.length - 1) {
        // finished an exhale → next breath or done
        if (breath >= TOTAL_BREATHS) { onDone(); return; }
        setBreath((b) => b + 1);
        setIdx(0);
      } else {
        setIdx((i) => i + 1);
      }
    }, ph.dur);
    return () => clearTimeout(timer.current);
  }, [idx, breath]);

  const ph = BREATH_PHASES[idx];
  const ringSize = 270;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 24px 34px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <TopClose onExit={onExit} inline />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--lav-ink)' }}>Breath {breath} of {TOTAL_BREATHS}</div>
        <button onClick={onSkip} style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink-3)', background: 'none', padding: 8 }}>Skip</button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* pacer */}
        <div style={{ position: 'relative', width: ringSize, height: ringSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* expanding halo rings */}
          {ph.name === 'in' && [0, 1].map((k) => (
            <div key={k} style={{
              position: 'absolute', width: ringSize, height: ringSize, borderRadius: '50%',
              border: '2px solid var(--lav-dot)', opacity: 0,
              animation: `haloPulse 4s ${k * 1.4}s ease-out infinite`,
            }} />
          ))}
          {/* soft pacer disc */}
          <div style={{
            position: 'absolute', width: ringSize, height: ringSize, borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(92% 0.04 295 / 0.85), oklch(95% 0.03 295 / 0.25) 70%)',
            transform: `scale(${scale})`,
            transition: `transform ${ph.dur}ms ${ph.ease}`,
          }} />
          <div style={{
            position: 'absolute', width: ringSize - 36, height: ringSize - 36, borderRadius: '50%',
            border: '2px solid oklch(80% 0.05 295 / 0.5)',
            transform: `scale(${scale})`,
            transition: `transform ${ph.dur}ms ${ph.ease}`,
          }} />
          {/* mascot scales with the breath */}
          <div style={{ transform: `scale(${0.78 + scale * 0.34})`, transition: `transform ${ph.dur}ms ${ph.ease}`, position: 'relative' }}>
            <Mascot state="breathing" h={150} />
          </div>
        </div>

        {/* label */}
        <div key={ph.name + breath} className="fade-up" style={{ marginTop: 26, textAlign: 'center' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--lav-ink)', letterSpacing: -0.3 }}>{ph.label}</div>
          <div style={{ fontSize: 14.5, color: 'var(--ink-3)', marginTop: 6, fontWeight: 600 }}>Let your shoulders soften</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GhostButton onClick={onSkip} icon={<Icon name="arrowRight" size={17} stroke="var(--ink-3)" />}>I’m calm — skip to measure</GhostButton>
      </div>
    </div>
  );
}

// ── Measuring (Bluetooth cuff) ─────────────────────────────────
function Measuring({ onDone, onExit }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const start = Date.now(); const total = 4600;
    const iv = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / total);
      setPct(p);
      if (p >= 1) { clearInterval(iv); setTimeout(onDone, 350); }
    }, 60);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 24px 34px' }}>
      <TopClose onExit={onExit} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <RingProgress value={pct} size={210} stroke={10} color="var(--blush-400)" track="var(--blush-100)">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ animation: 'softPulse 2.4s ease-in-out infinite' }}>
              <Mascot state="breathing" h={104} />
            </div>
          </div>
        </RingProgress>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 26, color: 'var(--blush-600)' }}>
          <span style={{ animation: 'softPulse 1.6s ease-in-out infinite' }}><Icon name="bluetooth" size={18} stroke="var(--blush-600)" sw={2.2} /></span>
          <span style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: 0.2 }}>Cuff connected</span>
        </div>
        <h1 style={{ margin: '12px 0 0', fontSize: 25, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>Measuring…</h1>
        <p style={{ margin: '8px auto 0', maxWidth: 270, fontSize: 15, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          Rest your arm and keep breathing softly. This takes just a moment.
        </p>
      </div>
    </div>
  );
}

// ── Result ─────────────────────────────────────────────────────
function ResultView({ reading, manual, onExit, onNav, onSaved, onSaveReading }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const inRange = reading.tier === 'steady';
  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      if (onSaveReading) await onSaveReading({ ...reading, manual });
      setSaved(true);
    } catch (err) {
      setSaveError(err?.message || 'We could not save this reading. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
        <Confetti count={30} />
        <div className="pop-in"><Mascot state="celebrating" h={186} /></div>
        <h1 className="fade-up" style={{ margin: '10px 0 0', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>Logged with love</h1>
        <p className="fade-up" style={{ animationDelay: '80ms', margin: '10px auto 0', maxWidth: 280, fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          That’s 5 days in a row. Your future heart is thanking you.
        </p>
        <div className="fade-up" style={{ animationDelay: '160ms', marginTop: 26, width: '100%', maxWidth: 320 }}>
          <PrimaryButton onClick={onSaved}>Back home</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', padding: '58px 22px 30px' }}>
      <TopClose onExit={onExit} />
      <div style={{ textAlign: 'center' }}>
        <div className="pop-in" style={{ position: 'relative' }}>
          {inRange && <Confetti count={18} />}
          <Mascot state={inRange ? 'proud' : 'calm'} h={150} float />
        </div>
        <div style={{ marginTop: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <TierPill tier={reading.tier} size="lg" />
          {manual && <Pill tone="plain" style={{ fontSize: 11.5 }}><Icon name="plus" size={12} stroke="var(--ink-2)" sw={2.4} />Entered manually</Pill>}
        </div>
      </div>

      {/* reading card */}
      <Card style={{ marginTop: 18, textAlign: 'center' }} pad={24}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 0.3, textTransform: 'uppercase' }}>Your reading</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, margin: '6px 0 2px' }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{reading.sys}</span>
          <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--ink-3)' }}>/{reading.dia}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink-3)', marginLeft: 4 }}>mmHg</span>
        </div>
        {/* healthy band marker */}
        <div style={{ position: 'relative', height: 12, borderRadius: 99, margin: '16px 6px 8px', background: 'linear-gradient(90deg, var(--sage-fill), var(--sage-fill) 62%, var(--honey-fill) 78%, var(--honey-fill))' }}>
          <div style={{
            position: 'absolute', top: '50%', left: `${Math.min(96, Math.max(4, ((reading.sys - 90) / 80) * 100))}%`,
            transform: 'translate(-50%, -50%)', width: 18, height: 18, borderRadius: '50%',
            background: 'var(--surface)', border: `3px solid ${inRange ? 'var(--sage-dot)' : 'var(--honey-dot)'}`, boxShadow: 'var(--sh-soft)',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)', padding: '0 4px' }}>
          <span>Calm range</span><span>Worth watching</span>
        </div>
        <Divider style={{ margin: '16px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <MiniStat label="Pulse" value={reading.pulse} unit="bpm" />
          <div style={{ width: 1, background: 'var(--hairline)' }} />
          <MiniStat label="vs. last" value={inRange ? '−2' : '+14'} unit="mmHg" tone={inRange ? 'sage' : 'honey'} />
        </div>
      </Card>

      {/* reassuring message */}
      {inRange ? (
        <TintCard tint="var(--sage-fill)" pad={18} style={{ marginTop: 14 }}>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--sage-ink)', fontWeight: 600, textWrap: 'pretty' }}>
            Beautifully in range. Whatever you’re doing, it’s working — keep going gently.
          </p>
        </TintCard>
      ) : (
        <TintCard tint="var(--honey-fill)" pad={18} style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: 'oklch(100% 0 0 / 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="heart" size={21} stroke="var(--honey-ink)" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: 'var(--honey-ink)', fontWeight: 600, textWrap: 'pretty' }}>
                This one’s a touch higher than usual. It’s okay — bodies vary day to day. It may be worth a gentle word with your GP. We can prepare a tidy summary for you.
              </p>
              <button onClick={() => onNav('handoff')} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'oklch(100% 0 0 / 0.7)', color: 'var(--honey-ink)', fontWeight: 700, fontSize: 14, padding: '11px 16px', borderRadius: 99 }}>
                <Icon name="doc" size={17} stroke="var(--honey-ink)" />Prepare summary for my GP
              </button>
            </div>
          </div>
        </TintCard>
      )}

      <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {saveError && (
          <div style={{ borderRadius: 16, padding: '12px 14px', background: 'var(--honey-fill)', color: 'var(--honey-ink)', fontSize: 13, lineHeight: 1.35, fontWeight: 700 }}>
            {saveError}
          </div>
        )}
        <PrimaryButton onClick={save} style={{ opacity: saving ? 0.6 : 1 }} icon={<Icon name="check" size={20} stroke="#fff" sw={2.4} />}>
          {saving ? 'Saving...' : 'Save to my journey'}
        </PrimaryButton>
        <GhostButton onClick={onExit} style={{ alignSelf: 'center' }}>Not now</GhostButton>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, tone }) {
  const col = tone === 'sage' ? 'var(--sage-ink)' : tone === 'honey' ? 'var(--honey-ink)' : 'var(--ink)';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'center', marginTop: 3 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: col, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-3)' }}>{unit}</span>
      </div>
    </div>
  );
}

// shared close button
function TopClose({ onExit, inline }) {
  return (
    <div style={{ position: inline ? 'static' : 'absolute', top: 58, left: 22, zIndex: 5 }}>
      <IconButton onClick={onExit} icon={<Icon name="close" size={20} stroke="var(--ink-2)" />} label="Close" size={42} />
    </div>
  );
}

Object.assign(window, { BreatheScreen });
