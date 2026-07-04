// screen-log.jsx — Medication & metrics logging (with custom meds + reminders)
const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '08:00' },
  { id: 'midday', label: 'Midday', time: '13:00' },
  { id: 'evening', label: 'Evening', time: '20:00' },
  { id: 'night', label: 'Night', time: '22:00' },
];

function LogScreen({ onNav, hasGlucose = true }) {
  const [meds, setMeds] = useState([
    { id: 1, name: 'Labetalol', dose: '200 mg', remind: true, doses: [
      { slot: 'morning', time: '08:00', taken: true },
      { slot: 'evening', time: '20:00', taken: false },
    ] },
    { id: 2, name: 'Aspirin', dose: '75 mg', remind: true, doses: [
      { slot: 'morning', time: '08:00', taken: true },
    ] },
  ]);
  const [weight, setWeight] = useState(68.4);
  const [glucose, setGlucose] = useState(5.2);
  const [sheet, setSheet] = useState(false);

  const allDoses = meds.flatMap((m) => m.doses);
  const takenCount = allDoses.filter((d) => d.taken).length;

  const toggleDose = (mi, di) => setMeds((ms) => ms.map((m, i) => i !== mi ? m : { ...m, doses: m.doses.map((d, j) => j === di ? { ...d, taken: !d.taken } : d) }));
  const addMed = (med) => { setMeds((ms) => [...ms, { ...med, id: Date.now() }]); setSheet(false); };

  return (
    <AppScreen>
      <ScreenHeader eyebrow="Today’s log" title="A gentle check-in" sub="Just a tap. No judgement, no advice on doses — only your own record." />

      {/* meds */}
      <Card style={{ marginBottom: 16 }} pad={18}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Medications</div>
          <Pill tone={takenCount === allDoses.length ? 'sage' : 'blush'}>{takenCount}/{allDoses.length} doses</Pill>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {meds.map((m, mi) => (
            <div key={m.id} style={{ borderRadius: 20, background: 'var(--bg-soft)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--blush-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="pill" size={21} stroke="var(--rose-ink)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{m.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{m.dose}{m.remind && ' · reminders on'}</div>
                </div>
                {m.remind && <Icon name="bell" size={17} stroke="var(--blush-400)" />}
              </div>
              {/* each scheduled dose */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {m.doses.map((d, di) => (
                  <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', borderRadius: 14, padding: '9px 12px' }}>
                    <Icon name="clock" size={16} stroke="var(--ink-3)" />
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{d.time}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{d.slot}</span>
                    <button onClick={() => toggleDose(mi, di)} {...pressHandlers(0.94)} style={{
                      marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 13px', borderRadius: 99,
                      background: d.taken ? 'var(--sage-fill)' : 'var(--bg-soft)',
                      color: d.taken ? 'var(--sage-ink)' : 'var(--ink-3)', fontWeight: 700, fontSize: 13,
                      transition: 'all .15s ease', border: d.taken ? '1px solid transparent' : '1px solid var(--hairline)',
                    }}>
                      {d.taken ? <><Icon name="check" size={14} stroke="var(--sage-ink)" sw={2.6} />Taken</> : 'Not yet'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setSheet(true)} {...pressHandlers(0.97)} style={{
          marginTop: 12, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          height: 48, borderRadius: 99, background: 'var(--blush-100)', color: 'var(--rose-ink)', fontWeight: 700, fontSize: 15,
          transition: 'transform .12s ease',
        }}>
          <Icon name="plus" size={18} stroke="var(--rose-ink)" sw={2.4} />Add a medication
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 12, fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
          <Icon name="info" size={15} stroke="var(--ink-3)" />Logging &amp; reminders only — Mimum never changes or advises on your doses.
        </div>
      </Card>

      {/* weight */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--sage-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="weight" size={24} stroke="var(--sage-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Weight</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>Optional · once a week is plenty</div>
          </div>
          <Stepper value={weight} step={0.1} unit="kg" onChange={setWeight} />
        </div>
      </Card>

      {/* glucose (conditional) */}
      {hasGlucose && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--lav-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="drop" size={24} stroke="var(--lav-ink)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Fasting glucose</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>Optional · for your GD history</div>
            </div>
            <Stepper value={glucose} step={0.1} unit="" onChange={setGlucose} />
          </div>
        </Card>
      )}

      {/* mood check-in */}
      <Card onClick={() => onNav('onboarding')} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--honey-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="mood" size={24} stroke="var(--honey-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Weekly mood check-in</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>2 minutes · due in 3 days</div>
          </div>
          <Icon name="chevronRight" size={20} stroke="var(--ink-3)" />
        </div>
      </Card>

      <PrimaryButton onClick={() => onNav('home')} icon={<Icon name="check" size={20} stroke="#fff" sw={2.4} />}>Save today’s log</PrimaryButton>

      {sheet && <AddMedSheet onClose={() => setSheet(false)} onAdd={addMed} />}
    </AppScreen>
  );
}

// ── Add-medication sheet ──────────────────────────────────────
function AddMedSheet({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [slots, setSlots] = useState(['morning']);
  const [remind, setRemind] = useState(true);

  const toggleSlot = (id) => setSlots((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const canSave = name.trim() && slots.length > 0;

  const save = () => {
    const doses = TIME_SLOTS.filter((s) => slots.includes(s.id)).map((s) => ({ slot: s.id, time: s.time, taken: false }));
    onAdd({ name: name.trim(), dose: dose.trim() || '—', remind, doses });
  };

  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'oklch(40% 0.02 24 / 0.34)', animation: 'fadeIn .2s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: 'var(--surface)', borderRadius: '30px 30px 0 0', padding: '12px 20px 28px',
        boxShadow: '0 -10px 40px oklch(40% 0.04 24 / 0.18)', animation: 'sheetUp .32s cubic-bezier(.2,.8,.3,1)', maxHeight: '88%', overflowY: 'auto',
      }}>
        <div style={{ width: 42, height: 5, borderRadius: 99, background: 'var(--hairline)', margin: '0 auto 16px' }} />
        <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>Add a medication</div>

        <Field label="Name">
          <TextInput value={name} onChange={setName} placeholder="e.g. Labetalol" autoFocus />
        </Field>
        <Field label="Dose (optional)">
          <TextInput value={dose} onChange={setDose} placeholder="e.g. 200 mg" />
        </Field>

        <Field label="When do you take it?">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TIME_SLOTS.map((s) => {
              const on = slots.includes(s.id);
              return (
                <button key={s.id} onClick={() => toggleSlot(s.id)} {...pressHandlers(0.97)} style={{
                  display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderRadius: 16, textAlign: 'left',
                  background: on ? 'var(--blush-50)' : 'var(--bg-soft)',
                  border: on ? '2px solid var(--blush-400)' : '2px solid transparent', transition: 'all .15s ease',
                }}>
                  <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: on ? 'var(--blush-500)' : 'transparent', border: on ? 'none' : '2px solid var(--hairline)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Icon name="check" size={13} stroke="#fff" sw={2.8} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{s.time}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </Field>

        {/* reminders */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 18, background: 'var(--lav-fill)', marginBottom: 18 }}>
          <Icon name="bell" size={20} stroke="var(--lav-ink)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--lav-ink)' }}>Gentle reminders</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--lav-ink)', opacity: 0.85 }}>A soft nudge at each time</div>
          </div>
          <Switch on={remind} onClick={() => setRemind((r) => !r)} />
        </div>

        <PrimaryButton onClick={canSave ? save : undefined} icon={<Icon name="check" size={19} stroke="#fff" sw={2.4} />} style={{ opacity: canSave ? 1 : 0.45 }}>Add medication</PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink-2)', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, autoFocus }) {
  return (
    <input
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
      style={{
        width: '100%', height: 50, borderRadius: 15, border: '2px solid var(--hairline)',
        background: 'var(--bg-soft)', padding: '0 16px', fontSize: 16, fontWeight: 600, color: 'var(--ink)',
        fontFamily: 'inherit', outline: 'none',
      }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--blush-400)'; e.target.style.background = 'var(--blush-50)'; }}
      onBlur={(e) => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.background = 'var(--bg-soft)'; }}
    />
  );
}

function Switch({ on, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 50, height: 30, borderRadius: 99, padding: 3, flexShrink: 0,
      background: on ? 'var(--blush-400)' : 'var(--hairline)', transition: 'background .2s ease',
      display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start', alignItems: 'center',
    }}>
      <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px oklch(40% 0.04 24 / 0.25)', transition: 'all .2s ease' }} />
    </button>
  );
}

function Stepper({ value, step = 1, unit, onChange }) {
  const round = (v) => Math.round(v * 10) / 10;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button onClick={() => onChange(round(value - step))} {...pressHandlers(0.9)} style={stepBtn}><Icon name="minus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
      <div style={{ minWidth: 52, textAlign: 'center' }}>
        <span style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value.toFixed(1)}</span>
        {unit && <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginLeft: 2 }}>{unit}</span>}
      </div>
      <button onClick={() => onChange(round(value + step))} {...pressHandlers(0.9)} style={stepBtn}><Icon name="plus" size={18} stroke="var(--rose-ink)" sw={2.4} /></button>
    </div>
  );
}
const stepBtn = {
  width: 38, height: 38, borderRadius: '50%', background: 'var(--blush-100)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s ease', flexShrink: 0,
};

Object.assign(window, { LogScreen, AddMedSheet, TextInput, Switch, Field });
