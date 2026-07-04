// screen-log.jsx — Daily nutrition and training log
function LogScreen({ onNav }) {
  const plan = PhysiqueMetrics.PLAN;
  const [protein, setProtein] = useState(162);
  const [calories, setCalories] = useState(2080);
  const [steps, setSteps] = useState(9400);
  const [sessions, setSessions] = useState([
    { id: 'push', label: 'Push', done: true },
    { id: 'pull', label: 'Pull', done: false },
    { id: 'legs', label: 'Legs', done: false },
    { id: 'walk', label: 'Walk', done: true },
  ]);

  const deficit = Math.max(0, 2550 - calories);
  const proteinOk = protein >= plan.proteinLow && protein <= 175;
  const caloriesOk = deficit >= 350 && deficit <= 550;
  const stepsOk = steps >= plan.stepsLow;
  const completed = [proteinOk, caloriesOk, stepsOk].filter(Boolean).length;
  const toggleSession = (id) => setSessions((items) => items.map((item) => item.id === id ? { ...item, done: !item.done } : item));

  return (
    <AppScreen>
      <ScreenHeader eyebrow="Diario" title="Lo que mueve el corte" sub="Tres palancas: déficit razonable, proteína suficiente y actividad diaria." />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Hoy</div>
          <Pill tone={completed === 3 ? 'sage' : 'honey'}>{completed}/3 pilares</Pill>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <LogRow
            icon="drop"
            tone="honey"
            title="Calorías"
            sub={`${deficit} kcal de déficit estimado`}
            ok={caloriesOk}
          >
            <CompactStepper value={calories} step={50} unit="kcal" onChange={setCalories} />
          </LogRow>
          <LogRow
            icon="weight"
            tone="sage"
            title="Proteína"
            sub={`meta ${plan.proteinLow}-${plan.proteinHigh} g`}
            ok={proteinOk}
          >
            <CompactStepper value={protein} step={5} unit="g" onChange={setProtein} />
          </LogRow>
          <LogRow
            icon="walk"
            tone="lav"
            title="Pasos"
            sub="mínimo 8k; ideal 8k-12k"
            ok={stepsOk}
          >
            <CompactStepper value={steps} step={500} unit="" onChange={setSteps} />
          </LogRow>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>Entrenamiento</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {sessions.map((session) => (
            <button key={session.id} onClick={() => toggleSession(session.id)} {...pressHandlers(0.97)} style={{
              minHeight: 54, borderRadius: 18, padding: '0 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
              background: session.done ? 'var(--sage-fill)' : 'var(--bg-soft)',
              border: session.done ? '1px solid transparent' : '1px solid var(--hairline)',
              color: session.done ? 'var(--sage-ink)' : 'var(--ink-2)',
              transition: 'transform .12s ease',
            }}>
              <span style={{ fontSize: 14.5, fontWeight: 800 }}>{session.label}</span>
              {session.done ? <Icon name="check" size={17} stroke="var(--sage-ink)" sw={2.6} /> : <Icon name="plus" size={17} stroke="var(--ink-3)" sw={2.4} />}
            </button>
          ))}
        </div>
      </Card>

      <Card onClick={() => onNav('trends')} style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--honey-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="info" size={24} stroke="var(--honey-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Regla de ajuste</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>Si 3 semanas no baja cintura, reduce 100-150 kcal.</div>
          </div>
          <Icon name="chevronRight" size={20} stroke="var(--ink-3)" />
        </div>
      </Card>

      <PrimaryButton onClick={() => onNav('home')} icon={<Icon name="check" size={20} stroke="#fff" sw={2.4} />}>Guardar diario</PrimaryButton>
    </AppScreen>
  );
}

function LogRow({ icon, tone, title, sub, ok, children }) {
  const toneFill = { blush: 'var(--blush-50)', lav: 'var(--lav-fill)', sage: 'var(--sage-fill)', honey: 'var(--honey-fill)' };
  const toneInk = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', sage: 'var(--sage-ink)', honey: 'var(--honey-ink)' };
  return (
    <div style={{ borderRadius: 20, background: 'var(--bg-soft)', padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: toneFill[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={icon} size={22} stroke={toneInk[tone]} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: ok ? 'var(--sage-dot)' : 'var(--honey-dot)' }} />
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>{sub}</div>
        </div>
        {children}
      </div>
    </div>
  );
}

function CompactStepper({ value, step = 1, unit, onChange }) {
  const round = (v) => Math.round(v * 10) / 10;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button onClick={() => onChange(round(value - step))} {...pressHandlers(0.9)} style={stepBtn}>
        <Icon name="minus" size={17} stroke="var(--rose-ink)" sw={2.4} />
      </button>
      <div style={{ minWidth: unit ? 56 : 48, textAlign: 'center' }}>
        <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
          {unit ? value : Math.round(value / 100) / 10}
        </span>
        {unit && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)', marginLeft: 2 }}>{unit}</span>}
        {!unit && <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--ink-3)', marginLeft: 2 }}>k</span>}
      </div>
      <button onClick={() => onChange(round(value + step))} {...pressHandlers(0.9)} style={stepBtn}>
        <Icon name="plus" size={17} stroke="var(--rose-ink)" sw={2.4} />
      </button>
    </div>
  );
}

const stepBtn = {
  width: 34, height: 34, borderRadius: '50%', background: 'var(--blush-100)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s ease', flexShrink: 0,
};

Object.assign(window, { LogScreen });
