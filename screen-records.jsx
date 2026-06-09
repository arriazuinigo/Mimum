// screen-records.jsx — Upload medical records
// Flow: list/empty → source sheet → preview → celebrating confirmation
// Exports: RecordsScreen, FauxDoc, DOC_TYPES, PrivacyNote, SourceSheet

const DOC_TYPES = {
  discharge: { label: 'Discharge summary', icon: 'doc', tone: 'blush', heading: 'MATERNITY DISCHARGE SUMMARY' },
  labs: { label: 'Lab results', icon: 'drop', tone: 'lav', heading: 'LABORATORY REPORT' },
  bp: { label: 'BP records', icon: 'pulse', tone: 'sage', heading: 'BLOOD PRESSURE RECORD' },
  other: { label: 'Other document', icon: 'doc', tone: 'plain', heading: 'MEDICAL DOCUMENT' },
};

const TONE_FILL = { blush: 'var(--blush-50)', lav: 'var(--lav-fill)', sage: 'var(--sage-fill)', honey: 'var(--honey-fill)', plain: 'var(--bg-soft)' };
const TONE_INK = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', sage: 'var(--sage-ink)', honey: 'var(--honey-ink)', plain: 'var(--ink-2)' };

// ── A tasteful faux "scanned document" preview ────────────────
function FauxDoc({ type = 'discharge', w = '100%', tilt = 0 }) {
  const cfg = DOC_TYPES[type];
  const line = (width, strong) => (
    <div style={{ height: strong ? 9 : 7, width, borderRadius: 4, background: strong ? 'oklch(82% 0.01 24)' : 'oklch(90% 0.008 24)' }} />
  );
  return (
    <div style={{
      width: w, aspectRatio: '3 / 3.6', background: '#fff', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 10px 30px oklch(50% 0.04 24 / 0.16), inset 0 0 0 1px oklch(92% 0.01 24)',
      transform: `rotate(${tilt}deg)`, position: 'relative',
    }}>
      {/* paper tint + scan glare */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, oklch(100% 0 0) 60%, oklch(98% 0.01 24 / 0.6))' }} />
      <div style={{ position: 'relative', padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* clinic header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ width: 22, height: 22, borderRadius: 7, background: TONE_FILL[cfg.tone], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={13} stroke={TONE_INK[cfg.tone]} />
          </div>
          <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 0.6, color: 'oklch(55% 0.02 24)' }}>{cfg.heading}</div>
        </div>
        <div style={{ height: 1, background: 'oklch(91% 0.01 24)' }} />
        {/* fake field rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 2 }}>
          {line('52%', true)}
          {line('88%')}
          {line('80%')}
          {line('90%')}
        </div>
        {/* a little data table block */}
        <div style={{ marginTop: 4, padding: 8, borderRadius: 8, background: TONE_FILL[cfg.tone] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {line('70%', true)}
            {line('46%')}
            {line('58%')}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
          {line('84%')}
          {line('64%')}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'linear-gradient(180deg, transparent, #fff)' }} />
    </div>
  );
}

function PrivacyNote({ style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 11, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 18, background: 'var(--lav-fill)', ...style }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: 'oklch(100% 0 0 / 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name="lock" size={17} stroke="var(--lav-ink)" />
      </div>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.45, color: 'var(--lav-ink)', fontWeight: 600, textWrap: 'pretty' }}>
        Your documents stay private to you. They’re only ever shared if <em>you</em> choose to send them to your doctor.
      </p>
    </div>
  );
}

// ── Source sheet (camera / scan / files) ──────────────────────
function SourceSheet({ onPick, onClose }) {
  const sources = [
    ['camera', 'Take a photo', 'Snap the page with your camera', 'pulse'],
    ['files', 'Choose a file', 'A PDF or image already on your phone', 'share'],
  ];
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'oklch(40% 0.02 24 / 0.34)', animation: 'fadeIn .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '30px 30px 0 0', padding: '12px 18px 30px',
        boxShadow: '0 -10px 40px oklch(40% 0.04 24 / 0.18)', animation: 'sheetUp .32s cubic-bezier(.2,.8,.3,1)',
      }}>
        <div style={{ width: 42, height: 5, borderRadius: 99, background: 'var(--hairline)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 4 }}>Add a document</div>
        <div style={{ fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, marginBottom: 14 }}>However’s easiest for you right now.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sources.map(([id, label, sub, icon]) => (
            <button key={id} onClick={() => onPick(id)} {...pressHandlers(0.98)} style={{
              display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
              padding: '14px 16px', borderRadius: 20, background: 'var(--bg-soft)', transition: 'transform .12s ease',
            }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--blush-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={23} stroke="var(--rose-ink)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
              </div>
              <Icon name="chevronRight" size={19} stroke="var(--ink-3)" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────
function RecordsScreen({ onExit, onNav }) {
  // phase: 'list' | 'preview' | 'done'
  const [phase, setPhase] = useState('list');
  const [sheet, setSheet] = useState(false);
  const [docs, setDocs] = useState([]); // start empty → empty state
  const [draft, setDraft] = useState({ type: 'discharge', source: 'camera' });

  const openSheet = () => setSheet(true);
  const pickSource = (source) => { setSheet(false); setDraft((d) => ({ ...d, source })); setPhase('preview'); };
  const addDoc = () => {
    const stamp = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setDocs((ds) => [{ id: Date.now(), type: draft.type, date: stamp }, ...ds]);
    setPhase('done');
  };

  if (phase === 'preview') {
    return <PreviewView draft={draft} setDraft={setDraft} onBack={() => setPhase('list')} onConfirm={addDoc} />;
  }
  if (phase === 'done') {
    return <AddedView count={docs.length} onDone={() => setPhase('list')} onExit={onExit} />;
  }

  // ── list / empty state ──
  const empty = docs.length === 0;
  return (
    <AppScreen pad={false}>
      <div style={{ padding: '58px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <IconButton onClick={onExit} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={42} />
          <Pill tone="lav"><Icon name="lock" size={13} stroke="var(--lav-ink)" />Private to you</Pill>
        </div>
      </div>

      {empty ? (
        <div style={{ padding: '0 22px 30px' }}>
          {/* warm empty state */}
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <Mascot state="calm" h={158} float />
            <h1 style={{ margin: '12px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>Bring your story along</h1>
            <p style={{ margin: '12px auto 0', maxWidth: 300, fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
              The more Mimo knows about your pregnancy, the better your follow-up plan. Add your discharge summary, lab results, or any blood-pressure records from pregnancy.
            </p>
          </div>

          {/* what helps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '22px 0' }}>
            {[
              ['doc', 'blush', 'Discharge summary', 'From your maternity stay'],
              ['drop', 'lav', 'Lab results', 'Bloods, glucose, kidney panels'],
              ['pulse', 'sage', 'Pregnancy BP records', 'Readings from your antenatal care'],
            ].map(([icon, tone, title, sub]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 20, background: 'var(--surface)', boxShadow: 'var(--sh-soft)', border: '1px solid oklch(92% 0.008 24 / 0.6)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: TONE_FILL[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={icon} size={22} stroke={TONE_INK[tone]} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>

          <PrivacyNote style={{ marginBottom: 18 }} />
          <PrimaryButton onClick={openSheet} icon={<Icon name="plus" size={20} stroke="#fff" sw={2.4} />}>Add a document</PrimaryButton>
        </div>
      ) : (
        <div style={{ padding: '0 22px 30px' }}>
          <ScreenHeader eyebrow="My records" title="Your documents" sub="These quietly enrich your risk profile and your GP summary." />
          {/* added docs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {docs.map((d) => {
              const cfg = DOC_TYPES[d.type];
              return (
                <Card key={d.id} pad={14} className="fade-up">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 52, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--sh-soft)' }}>
                      <FauxDoc type={d.type} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{cfg.label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>Added {d.date}</div>
                      <div style={{ marginTop: 8 }}><Pill tone="sage" style={{ fontSize: 11.5 }}><Icon name="check" size={13} stroke="var(--sage-ink)" sw={2.6} />In your record</Pill></div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          <SoftButton full onClick={openSheet} icon={<Icon name="plus" size={18} stroke="var(--rose-ink)" sw={2.2} />}>Add another</SoftButton>
          <div style={{ marginTop: 14 }}><PrivacyNote /></div>
        </div>
      )}

      {sheet && <SourceSheet onPick={pickSource} onClose={() => setSheet(false)} />}
    </AppScreen>
  );
}

// ── Preview + type confirm ────────────────────────────────────
function PreviewView({ draft, setDraft, onBack, onConfirm }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <div style={{ padding: '58px 22px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton onClick={onBack} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={42} />
        <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Check it looks right</div>
        <div style={{ width: 42 }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 22px 16px' }}>
        {/* the captured page */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 20px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 24, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, var(--blush-100), transparent 70%)' }} />
          <div style={{ width: '64%', position: 'relative', animation: 'popIn .4s ease both' }}>
            <FauxDoc type={draft.type} tilt={-1.5} />
            <div style={{ position: 'absolute', top: 10, right: 6, background: 'var(--surface)', borderRadius: 99, padding: '5px 10px', boxShadow: 'var(--sh-soft)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="check" size={13} stroke="var(--sage-ink)" sw={2.6} />
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--sage-ink)' }}>Clear</span>
            </div>
          </div>
        </div>

        {/* type picker */}
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', margin: '4px 2px 10px' }}>What kind of document is this?</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(DOC_TYPES).map(([id, cfg]) => {
            const on = draft.type === id;
            return (
              <button key={id} onClick={() => setDraft((d) => ({ ...d, type: id }))} {...pressHandlers(0.98)} style={{
                display: 'flex', alignItems: 'center', gap: 13, textAlign: 'left', width: '100%',
                padding: '13px 15px', borderRadius: 18,
                background: on ? 'var(--blush-50)' : 'var(--surface)',
                border: on ? '2px solid var(--blush-400)' : '2px solid oklch(92% 0.01 24 / 0.7)',
                boxShadow: on ? 'none' : 'var(--sh-soft)', transition: 'all .15s ease',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: TONE_FILL[cfg.tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={cfg.icon} size={20} stroke={TONE_INK[cfg.tone]} />
                </div>
                <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{cfg.label}</div>
                <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, border: on ? 'none' : '2px solid var(--hairline)', background: on ? 'var(--blush-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {on && <Icon name="check" size={15} stroke="#fff" sw={2.8} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 22px 30px', background: 'linear-gradient(180deg, transparent, var(--bg-app) 30%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={onConfirm} icon={<Icon name="check" size={20} stroke="#fff" sw={2.4} />}>Add to my record</PrimaryButton>
        <GhostButton onClick={onBack} style={{ alignSelf: 'center' }}>Retake</GhostButton>
      </div>
    </div>
  );
}

// ── Celebrating confirmation ──────────────────────────────────
function AddedView({ count, onDone, onExit }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', background: 'radial-gradient(130% 90% at 50% 14%, var(--blush-100), var(--bg-app) 56%)' }}>
      <Confetti count={28} />
      <div className="pop-in"><Mascot state="celebrating" h={184} /></div>
      <h1 className="fade-up" style={{ margin: '10px 0 0', fontSize: 27, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>Added to your record</h1>
      <p className="fade-up" style={{ animationDelay: '80ms', margin: '12px auto 0', maxWidth: 290, fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
        Thank you for trusting Mimo with this. Your follow-up plan just got a little more personal.
      </p>
      <div className="fade-up" style={{ animationDelay: '150ms', marginTop: 18 }}>
        <Pill tone="lav"><Icon name="lock" size={13} stroke="var(--lav-ink)" />Stored privately · shared only by you</Pill>
      </div>
      <div className="fade-up" style={{ animationDelay: '210ms', marginTop: 26, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={onDone} icon={<Icon name="plus" size={19} stroke="#fff" sw={2.2} />}>Add another</PrimaryButton>
        <GhostButton onClick={onExit} style={{ alignSelf: 'center' }}>Done for now</GhostButton>
      </div>
    </div>
  );
}

Object.assign(window, { RecordsScreen, FauxDoc, DOC_TYPES, PrivacyNote, SourceSheet });
