// screen-onboarding.jsx — friendly multi-step intake with journey-stage branching
// Stages: planning | pregnant | postpartum

const STAGE_FLOW = {
  postpartum: [
    { key: 'history', mascot: 'calm', eyebrow: 'Your pregnancy', title: 'Did any of these come up?',
      help: 'This helps me know how closely to watch with you. Choose any that apply.', kind: 'multi',
      options: [
        ['preeclampsia', 'Preeclampsia', 'High blood pressure in pregnancy'],
        ['gestational-htn', 'Gestational hypertension', 'Raised BP, no protein'],
        ['gestational-db', 'Gestational diabetes', 'Raised blood sugar'],
        ['preterm', 'Preterm birth', 'Baby arrived before 37 weeks'],
        ['none', 'None of these', ''],
      ] },
    { key: 'redflag', mascot: 'calm', eyebrow: 'A quick check', title: 'Feeling any of these today?',
      help: 'No alarm if you are — it just helps me look after you well.', kind: 'multi', redflag: true,
      options: [
        ['headache', 'A bad headache that won’t ease', ''],
        ['vision', 'Blurred vision or spots', ''],
        ['swelling', 'Sudden swelling in face or hands', ''],
        ['chest', 'Chest pain or breathlessness at rest', ''],
        ['none', 'None right now — I feel okay', ''],
      ] },
    { key: 'meds', mascot: 'breathing', eyebrow: 'Medications', title: 'Anything you’re taking?',
      help: 'Just so I can help you keep track. I’ll never advise on doses.', kind: 'multi',
      options: [
        ['labetalol', 'Labetalol', 'Blood pressure'],
        ['aspirin', 'Low-dose aspirin', ''],
        ['metformin', 'Metformin', 'Blood sugar'],
        ['none', 'Nothing right now', ''],
      ] },
    { key: 'mood', mascot: 'calm', eyebrow: 'How you’re feeling', title: 'This past week, I’ve been able to laugh and see the funny side of things',
      help: 'A gentle wellbeing check (EPDS). There are no wrong answers.', kind: 'single',
      options: [
        ['as-always', 'As much as I always could', ''],
        ['not-quite', 'Not quite so much now', ''],
        ['less', 'Definitely less than before', ''],
        ['not-at-all', 'Not at all', ''],
      ] },
    { key: 'rest', mascot: 'sleepy', eyebrow: 'A little about your days', title: 'How is your rest lately?',
      help: 'This helps me time check-ins for when they suit you.', kind: 'single',
      options: [
        ['ok', 'Getting some, all considered', ''],
        ['broken', 'Broken, but managing', ''],
        ['hard', 'Really hard right now', ''],
      ] },
  ],
  pregnant: [
    { key: 'week', mascot: 'calm', eyebrow: 'Where you are', title: 'How many weeks along are you?',
      help: 'I’ll tailor your check-ins to your stage of pregnancy.', kind: 'week' },
    { key: 'complications', mascot: 'calm', eyebrow: 'Your pregnancy', title: 'Have you been told about any of these?',
      help: 'Choose any you’ve been diagnosed with so far — or none.', kind: 'multi',
      options: [
        ['preeclampsia', 'Preeclampsia', 'Raised BP with protein'],
        ['gestational-htn', 'Gestational hypertension', 'Raised BP in pregnancy'],
        ['gestational-db', 'Gestational diabetes', 'Raised blood sugar'],
        ['none', 'None so far', ''],
      ] },
    { key: 'redflag', mascot: 'calm', eyebrow: 'A quick check', title: 'Feeling any of these today?',
      help: 'These can matter in pregnancy. No alarm — I’ll simply point you to the right care.', kind: 'multi', redflag: true,
      options: [
        ['headache', 'A severe headache that won’t ease', ''],
        ['vision', 'Vision changes — blurring or spots', ''],
        ['swelling', 'Sudden swelling in face or hands', ''],
        ['chest', 'Chest pain', ''],
        ['none', 'None right now — I feel okay', ''],
      ] },
    { key: 'meds', mascot: 'breathing', eyebrow: 'Medications', title: 'Anything you’re taking?',
      help: 'Just so I can help you keep track. I’ll never advise on doses.', kind: 'multi',
      options: [
        ['labetalol', 'Labetalol', 'Blood pressure'],
        ['aspirin', 'Low-dose aspirin', ''],
        ['insulin', 'Insulin', 'Blood sugar'],
        ['none', 'Nothing right now', ''],
      ] },
    { key: 'mood', mascot: 'calm', eyebrow: 'How you’re feeling', title: 'This past week, I’ve been able to laugh and see the funny side of things',
      help: 'A gentle wellbeing check. There are no wrong answers.', kind: 'single',
      options: [
        ['as-always', 'As much as I always could', ''],
        ['not-quite', 'Not quite so much now', ''],
        ['less', 'Definitely less than before', ''],
        ['not-at-all', 'Not at all', ''],
      ] },
  ],
  planning: [
    { key: 'prev', mascot: 'calm', eyebrow: 'A little history', title: 'Have you been pregnant before?',
      help: 'This helps me set a baseline that’s right for you.', kind: 'single',
      options: [
        ['yes-comp', 'Yes — with some complications', 'e.g. raised BP, diabetes, preterm'],
        ['yes-smooth', 'Yes — and it went smoothly', ''],
        ['no', 'No, this would be my first', ''],
      ] },
    { key: 'baseline', mascot: 'breathing', eyebrow: 'Your baseline', title: 'Do you know your usual blood pressure?',
      help: 'If you have a recent reading, pop it in. If not, we’ll establish it together.', kind: 'baseline' },
    { key: 'goal', mascot: 'proud', eyebrow: 'What brings you here', title: 'What would feel most helpful?',
      help: 'I’ll gently shape your experience around it.', kind: 'single',
      options: [
        ['baseline', 'Understanding my baseline health', ''],
        ['habits', 'Building calm, heart-friendly habits', ''],
        ['informed', 'Feeling informed before pregnancy', ''],
      ] },
  ],
};

const STAGE_META = {
  postpartum: { tier: 'attention', doneTitle: 'You’re all set',
    doneBody: 'Thank you for sharing. Based on your history, we’ll check in a little more closely — gently, and always with you.' },
  pregnant: { tier: 'steady', doneTitle: 'You’re all set',
    doneBody: 'Thank you for trusting me. I’ll keep gentle watch alongside your midwife through every week.' },
  planning: { tier: null, doneTitle: 'Your baseline begins',
    doneBody: 'Lovely. We’ll build a calm picture of your heart health, so you feel ready and informed.' },
};

function OnboardingScreen({ onExit, onFinish, onStageSet }) {
  const [phase, setPhase] = useState('welcome'); // welcome | stage | q | safety | upload | done
  const [qi, setQi] = useState(0);
  const [stage, setStage] = useState('postpartum');
  const [answers, setAnswers] = useState({});

  const flow = STAGE_FLOW[stage];
  const total = flow.length;
  const setAns = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  const goStage = (s) => { setStage(s); onStageSet && onStageSet(s); setQi(0); setPhase('q'); };

  const advanceFromQ = () => {
    const q = flow[qi];
    // red-flag interstitial
    if (q.redflag) {
      const sel = answers[q.key] || [];
      const flagged = sel.some((x) => x !== 'none');
      if (flagged) { setPhase('safety'); return; }
    }
    if (qi < total - 1) setQi(qi + 1);
    else setPhase('upload');
  };

  const continueAfterSafety = () => {
    if (qi < total - 1) { setQi(qi + 1); setPhase('q'); }
    else setPhase('upload');
  };

  const back = () => {
    if (phase === 'q' && qi === 0) setPhase('stage');
    else if (phase === 'q') setQi(qi - 1);
    else if (phase === 'stage') setPhase('welcome');
    else if (phase === 'safety') setPhase('q');
    else onExit();
  };

  // ── welcome ──
  if (phase === 'welcome') {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 26px 34px', background: 'radial-gradient(130% 90% at 50% 12%, var(--blush-100), var(--bg-app) 56%)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Mascot state="calm" h={184} float />
          <h1 style={{ margin: '16px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink)' }}>Hi, I’m Mimo</h1>
          <p style={{ margin: '14px auto 0', maxWidth: 300, fontSize: 16.5, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
            I’m here to keep a gentle eye on your heart — whether you’re planning, expecting, or recently became a parent. Let’s get to know each other.
          </p>
        </div>
        <PrimaryButton onClick={() => setPhase('stage')}>Let’s begin</PrimaryButton>
        <GhostButton onClick={onExit} style={{ alignSelf: 'center', marginTop: 4 }}>I’ve done this already</GhostButton>
      </div>
    );
  }

  // ── stage chooser (the new first question) ──
  if (phase === 'stage') {
    const stages = [
      ['planning', 'Planning a pregnancy', 'Getting my heart ready', 'leaf', 'sage'],
      ['pregnant', 'Currently pregnant', 'Expecting right now', 'heart', 'blush'],
      ['postpartum', 'Recently had a baby', 'In my first year after birth', 'mood', 'lav'],
    ];
    const TF = { sage: 'var(--sage-fill)', blush: 'var(--blush-50)', lav: 'var(--lav-fill)' };
    const TI = { sage: 'var(--sage-ink)', blush: 'var(--rose-ink)', lav: 'var(--lav-ink)' };
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
        <div style={{ padding: '58px 22px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <IconButton onClick={back} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={40} />
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ flexShrink: 0, width: 72 }}><Mascot state="calm" h={72} /></div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--rose-ink)', textTransform: 'uppercase', letterSpacing: 0.3 }}>To begin</div>
              <h1 style={{ margin: '4px 0 0', fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)', lineHeight: 1.2 }}>Where are you in your journey?</h1>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stages.map(([id, title, sub, icon, tone]) => (
            <button key={id} onClick={() => goStage(id)} {...pressHandlers(0.98)} style={{
              display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', width: '100%',
              padding: '18px 18px', borderRadius: 22, background: 'var(--surface)',
              border: '2px solid oklch(92% 0.01 24 / 0.7)', boxShadow: 'var(--sh-soft)', transition: 'transform .12s ease',
            }}>
              <div style={{ width: 56, height: 56, borderRadius: 17, background: TF[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={icon} size={28} stroke={TI[tone]} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{sub}</div>
              </div>
              <Icon name="chevronRight" size={20} stroke="var(--ink-3)" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── safety signpost (never silent, never alarming) ──
  if (phase === 'safety') {
    const careWord = stage === 'pregnant' ? 'midwife or maternity unit' : 'doctor';
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: '58px 24px 30px', background: 'radial-gradient(130% 85% at 50% 10%, var(--honey-fill), var(--bg-app) 56%)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <Mascot state="calm" h={150} float />
          <div style={{ marginTop: 6 }}><Pill tone="honey"><Icon name="heart" size={13} stroke="var(--honey-ink)" />Worth a call today</Pill></div>
          <h1 style={{ margin: '12px 0 0', fontSize: 25, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>Let’s get you looked after</h1>
          <p style={{ margin: '12px auto 0', maxWidth: 300, fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
            Some of what you mentioned is worth checking the same day. It’s very likely nothing serious — but please contact your {careWord} or urgent care today so someone can reassure you in person.
          </p>
          <div style={{ marginTop: 16, width: '100%', maxWidth: 320 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px', borderRadius: 18, background: 'oklch(100% 0 0 / 0.6)', textAlign: 'left' }}>
              <Icon name="info" size={18} stroke="var(--honey-ink)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--honey-ink)', lineHeight: 1.4 }}>If you feel very unwell or it worsens, call emergency services right away.</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <PrimaryButton icon={<Icon name="phone" size={19} stroke="#fff" />}>Call my {stage === 'pregnant' ? 'midwife' : 'doctor'}</PrimaryButton>
          <GhostButton onClick={continueAfterSafety} style={{ alignSelf: 'center' }}>I understand — continue setup</GhostButton>
        </div>
      </div>
    );
  }

  // ── upload (optional, skippable) ──
  if (phase === 'upload') {
    return <OnboardingUploadStep stage={stage} onBack={() => { setPhase('q'); setQi(total - 1); }} onSkip={() => setPhase('done')} onAdded={() => setPhase('done')} />;
  }

  // ── done ──
  if (phase === 'done') {
    const meta = STAGE_META[stage];
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', background: 'radial-gradient(130% 90% at 50% 14%, var(--blush-100), var(--bg-app) 56%)' }}>
        <Confetti count={26} />
        <div className="pop-in"><Mascot state="celebrating" h={188} /></div>
        <h1 className="fade-up" style={{ margin: '12px 0 0', fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>{meta.doneTitle}</h1>
        <p className="fade-up" style={{ animationDelay: '80ms', margin: '12px auto 0', maxWidth: 290, fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>{meta.doneBody}</p>
        {meta.tier && <div className="fade-up" style={{ animationDelay: '140ms', marginTop: 16 }}><TierPill tier={meta.tier} size="lg" /></div>}
        {!meta.tier && <div className="fade-up" style={{ animationDelay: '140ms', marginTop: 16 }}><Pill tone="sage"><Icon name="leaf" size={14} stroke="var(--sage-ink)" />Baseline started</Pill></div>}
        <div className="fade-up" style={{ animationDelay: '200ms', marginTop: 26, width: '100%', maxWidth: 320 }}>
          <PrimaryButton onClick={() => onFinish(stage)}>Go to my home</PrimaryButton>
        </div>
      </div>
    );
  }

  // ── question step ──
  const q = flow[qi];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      <div style={{ padding: '58px 22px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <IconButton onClick={back} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={40} />
          <div style={{ flex: 1 }}><ProgressDots total={total} current={qi} /></div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{ flexShrink: 0, width: 72 }}><Mascot state={q.mascot} h={72} /></div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--rose-ink)', textTransform: 'uppercase', letterSpacing: 0.3 }}>{q.eyebrow}</div>
            <h1 style={{ margin: '4px 0 0', fontSize: 21, fontWeight: 800, letterSpacing: -0.4, color: 'var(--ink)', lineHeight: 1.2, textWrap: 'pretty' }}>{q.title}</h1>
          </div>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>{q.help}</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px 16px' }}>
        {q.kind === 'week' && <WeekPicker value={answers.week || 24} onChange={(v) => setAns('week', v)} />}
        {q.kind === 'baseline' && <BaselinePicker value={answers.baseline} onChange={(v) => setAns('baseline', v)} />}
        {(q.kind === 'multi' || q.kind === 'single') && (
          <ChoiceList multi={q.kind === 'multi'} options={q.options}
            selected={q.kind === 'multi' ? (answers[q.key] || []) : (answers[q.key] ? [answers[q.key]] : [])}
            onToggle={(v) => {
              if (q.kind === 'single') { setAns(q.key, v); return; }
              const cur = answers[q.key] || [];
              // selecting "none" clears others; selecting another clears "none"
              let nxt;
              if (v === 'none') nxt = cur.includes('none') ? [] : ['none'];
              else nxt = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur.filter((x) => x !== 'none'), v];
              setAns(q.key, nxt);
            }} />
        )}
      </div>

      <div style={{ padding: '12px 22px 30px', background: 'linear-gradient(180deg, transparent, var(--bg-app) 30%)' }}>
        <PrimaryButton onClick={advanceFromQ} icon={<Icon name="arrowRight" size={19} stroke="#fff" />}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

// ── Week picker ───────────────────────────────────────────────
function WeekPicker({ value, onChange }) {
  const tri = value <= 13 ? 'First trimester' : value <= 27 ? 'Second trimester' : 'Third trimester';
  return (
    <div style={{ textAlign: 'center', padding: '10px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <button onClick={() => onChange(Math.max(4, value - 1))} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="minus" size={20} stroke="var(--rose-ink)" sw={2.4} /></button>
        <div>
          <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--ink)', letterSpacing: -1.5, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', marginTop: 2 }}>weeks</div>
        </div>
        <button onClick={() => onChange(Math.min(42, value + 1))} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="plus" size={20} stroke="var(--rose-ink)" sw={2.4} /></button>
      </div>
      <div style={{ marginTop: 18 }}><Pill tone="lav"><Icon name="heart" size={13} stroke="var(--lav-ink)" />{tri}</Pill></div>
    </div>
  );
}

// ── Baseline BP picker ────────────────────────────────────────
function BaselinePicker({ value, onChange }) {
  const known = value && value.known;
  const sys = value?.sys ?? 115;
  const dia = value?.dia ?? 75;
  const set = (patch) => onChange({ known: true, sys, dia, ...value, ...patch });
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <button onClick={() => onChange({ known: true, sys, dia })} {...pressHandlers(0.97)} style={{
          flex: 1, padding: '14px', borderRadius: 16, fontSize: 14.5, fontWeight: 700,
          background: known ? 'var(--blush-50)' : 'var(--surface)', color: known ? 'var(--rose-ink)' : 'var(--ink-2)',
          border: known ? '2px solid var(--blush-400)' : '2px solid oklch(92% 0.01 24 / 0.7)', boxShadow: known ? 'none' : 'var(--sh-soft)',
        }}>I know it</button>
        <button onClick={() => onChange({ known: false })} {...pressHandlers(0.97)} style={{
          flex: 1, padding: '14px', borderRadius: 16, fontSize: 14.5, fontWeight: 700,
          background: value && !value.known ? 'var(--blush-50)' : 'var(--surface)', color: value && !value.known ? 'var(--rose-ink)' : 'var(--ink-2)',
          border: value && !value.known ? '2px solid var(--blush-400)' : '2px solid oklch(92% 0.01 24 / 0.7)', boxShadow: value && !value.known ? 'none' : 'var(--sh-soft)',
        }}>Not sure</button>
      </div>
      {known && (
        <Card pad={18} className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Systolic <span style={{ fontWeight: 600, color: 'var(--ink-3)', fontSize: 12.5 }}>top</span></div>
            <button onClick={() => set({ sys: Math.max(80, sys - 1) })} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="minus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
            <span style={{ minWidth: 44, textAlign: 'center', fontSize: 24, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{sys}</span>
            <button onClick={() => set({ sys: Math.min(200, sys + 1) })} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="plus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
          </div>
          <Divider />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 14 }}>
            <div style={{ flex: 1, fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Diastolic <span style={{ fontWeight: 600, color: 'var(--ink-3)', fontSize: 12.5 }}>bottom</span></div>
            <button onClick={() => set({ dia: Math.max(50, dia - 1) })} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="minus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
            <span style={{ minWidth: 44, textAlign: 'center', fontSize: 24, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{dia}</span>
            <button onClick={() => set({ dia: Math.min(130, dia + 1) })} {...pressHandlers(0.9)} style={stepBtnO}><Icon name="plus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
          </div>
        </Card>
      )}
      {value && !value.known && (
        <TintCard tint="var(--sage-fill)" pad={18} className="fade-up">
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: 'var(--sage-ink)', fontWeight: 600, textWrap: 'pretty' }}>
            No problem at all. We’ll take a few calm readings together over your first weeks to find your natural baseline.
          </p>
        </TintCard>
      )}
    </div>
  );
}
const stepBtnO = {
  width: 44, height: 44, borderRadius: '50%', background: 'var(--blush-100)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s ease', flexShrink: 0,
};

function ChoiceList({ options, selected, onToggle, multi }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map(([id, label, detail]) => {
        const on = selected.includes(id);
        return (
          <button key={id} onClick={() => onToggle(id)} {...pressHandlers(0.98)} style={{
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
            padding: '16px 18px', borderRadius: 20,
            background: on ? 'var(--blush-50)' : 'var(--surface)',
            border: on ? '2px solid var(--blush-400)' : '2px solid oklch(92% 0.01 24 / 0.7)',
            boxShadow: on ? 'none' : 'var(--sh-soft)', transition: 'all .15s ease',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: multi ? 9 : '50%', flexShrink: 0,
              border: on ? 'none' : '2px solid var(--hairline)',
              background: on ? 'var(--blush-500)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {on && <Icon name="check" size={16} stroke="#fff" sw={2.8} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.25 }}>{label}</div>
              {detail && <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{detail}</div>}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Optional document-upload step at the end of onboarding ────
function OnboardingUploadStep({ onBack, onSkip, onAdded, stage }) {
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'preview'
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState({ type: 'discharge', source: 'camera' });
  const copy = stage === 'planning'
    ? 'Have past pregnancy notes or recent lab results? Adding them helps Mimo set a truer baseline.'
    : stage === 'pregnant'
      ? 'Have your antenatal notes, scan results, or BP records? Adding them helps Mimo tailor your care.'
      : 'The more Mimo knows about your pregnancy, the better your follow-up plan. Add a discharge summary, lab results, or BP records — or do it any time later.';

  if (phase === 'preview') {
    return <PreviewView draft={draft} setDraft={setDraft} onBack={() => setPhase('prompt')} onConfirm={onAdded} />;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'radial-gradient(130% 80% at 50% 8%, var(--blush-100), var(--bg-app) 52%)' }}>
      <div style={{ padding: '58px 22px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <IconButton onClick={onBack} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={40} />
          <Pill tone="plain" style={{ marginLeft: 'auto' }}>Optional</Pill>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 24px 16px', textAlign: 'center' }}>
        <Mascot state="calm" h={150} float />
        <h1 style={{ margin: '10px 0 0', fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>Bring your records, too?</h1>
        <p style={{ margin: '12px auto 0', maxWidth: 304, fontSize: 15.5, lineHeight: 1.55, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>{copy}</p>
        <div style={{ margin: '20px 0' }}><PrivacyNote /></div>
      </div>

      <div style={{ padding: '8px 22px 30px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <PrimaryButton onClick={() => setSheet(true)} icon={<Icon name="plus" size={20} stroke="#fff" sw={2.4} />}>Add my documents</PrimaryButton>
        <GhostButton onClick={onSkip} style={{ alignSelf: 'center' }}>I’ll do this later</GhostButton>
      </div>

      {sheet && <SourceSheet onPick={(source) => { setSheet(false); setDraft((d) => ({ ...d, source })); setPhase('preview'); }} onClose={() => setSheet(false)} />}
    </div>
  );
}

Object.assign(window, { OnboardingScreen });
