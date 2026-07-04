// screen-home.jsx — Optimal Physique dashboard
function HomeScreen({ user, onNav, onMeasure, readings = [] }) {
  const metrics = PhysiqueMetrics.summarize(readings);
  const plan = metrics.plan;
  const latest = metrics.latest;
  const body = latest.bodyMeasures || latest;
  const shoulders = Number(body.shoulders || 114);
  const chest = Number(body.chest || 101);
  const waistGap = Math.max(0, latest.waist - plan.targetWaist);
  const goMeasure = () => (onMeasure ? onMeasure('manual') : onNav('measure'));
  const heroTier = latest.onPlan ? 'steady' : 'attention';

  return (
    <AppScreen>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 0.2 }}>{metrics.todayLabel}</div>
          <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>
            Hola, {user.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <IconButton icon={<Icon name="bell" size={21} stroke="var(--ink-2)" />} label="Recordatorios" />
          <button onClick={() => onNav('profile')} {...pressHandlers(0.92)} aria-label="Perfil" style={{ borderRadius: '50%', transition: 'transform .12s ease' }}>
            <Avatar initials={user.name[0]} size={44} />
          </button>
        </div>
      </div>

      <div className="fade-up" style={{ animationDelay: '60ms', marginBottom: 14 }}>
        <div style={{
          position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--blush-50) 100%)',
          padding: '20px 20px 22px',
          border: '1px solid oklch(89% 0.025 170 / 0.75)',
        }}>
          <div style={{
            position: 'absolute', right: -40, top: -54, width: 180, height: 180,
            borderRadius: '50%', background: 'radial-gradient(circle, oklch(78% 0.10 170 / 0.22), transparent 72%)',
          }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18 }}>
            <RingProgress value={metrics.waistProgress / 100} size={104} stroke={9} color="var(--blush-500)" track="var(--blush-100)">
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 25, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>{metrics.waistProgress}%</div>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase' }}>cintura</div>
              </div>
            </RingProgress>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 10 }}><TierPill tier={heroTier} size="lg" /></div>
              <h2 style={{ margin: 0, fontSize: 24, lineHeight: 1.08, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>
                {waistGap.toFixed(1)} cm para acercarte a la silueta ideal
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 14.5, lineHeight: 1.45, color: 'var(--ink-2)', fontWeight: 600 }}>
                Comparación basada en cintura, hombros, pecho, cadera, brazos y piernas.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fade-up" style={{ animationDelay: '110ms', marginBottom: 14 }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 16px', display: 'flex', gap: 15, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(160deg, var(--blush-100), var(--sage-fill))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="weight" size={27} stroke="var(--rose-ink)" sw={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, color: 'var(--rose-ink)', textTransform: 'uppercase' }}>Hoy</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>Registrar medidas</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 2 }}>Peso, cintura, hombros, pecho, brazos y piernas.</div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <PrimaryButton onClick={goMeasure} icon={<Icon name="plus" size={20} stroke="#fff" />}>
              Hacer check-in
            </PrimaryButton>
          </div>
        </Card>
      </div>

      <div className="fade-up" style={{ animationDelay: '150ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <MetricCard label="Peso actual" value={latest.weight.toFixed(1)} unit="kg" sub={`-${metrics.weightLost.toFixed(1)} kg desde 79`} tone="sage" />
        <MetricCard label="Cintura" value={latest.waist.toFixed(1)} unit="cm" sub={`faltan ${Math.max(0, latest.waist - plan.targetWaist).toFixed(1)} cm`} tone="blush" />
        <MetricCard label="Hombros" value={shoulders.toFixed(0)} unit="cm" sub="ideal 122 cm" tone="honey" />
        <MetricCard label="Pecho" value={chest.toFixed(0)} unit="cm" sub="ideal 104 cm" tone="lav" />
      </div>

      <div className="fade-up" style={{ animationDelay: '190ms', marginBottom: 14 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Últimas medidas</div>
            <Pill tone="sage"><Icon name="check" size={14} stroke="var(--sage-ink)" />Guardado</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MiniMeasure label="Cintura" value={latest.waist.toFixed(1)} unit="cm" />
            <MiniMeasure label="Hombros" value={shoulders.toFixed(0)} unit="cm" />
            <MiniMeasure label="Pecho" value={chest.toFixed(0)} unit="cm" />
            <MiniMeasure label="Peso" value={latest.weight.toFixed(1)} unit="kg" />
          </div>
        </Card>
      </div>

      <div className="fade-up" style={{ animationDelay: '230ms' }}>
        <TintCard tint="var(--sage-fill)" pad={18}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0, background: 'oklch(100% 0 0 / 0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="weight" size={23} stroke="var(--sage-ink)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--sage-ink)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Prioridad</div>
              <p style={{ margin: '4px 0 0', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 500, textWrap: 'pretty' }}>
                Mide siempre en el mismo momento del día. La silueta roja se acerca a la verde cuando baja la cintura y mejora la proporción hombros-cintura.
              </p>
            </div>
          </div>
        </TintCard>
      </div>
    </AppScreen>
  );
}

function MiniMeasure({ label, value, unit }) {
  return (
    <div style={{ padding: '12px 13px', borderRadius: 18, background: 'var(--bg-soft)' }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink-3)' }}>{label}</div>
      <div style={{ marginTop: 3, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 21, fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--ink-3)' }}>{unit}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, sub, tone = 'sage' }) {
  const toneMap = {
    blush: ['var(--blush-100)', 'var(--rose-ink)'],
    sage: ['var(--sage-fill)', 'var(--sage-ink)'],
    honey: ['var(--honey-fill)', 'var(--honey-ink)'],
    lav: ['var(--lav-fill)', 'var(--lav-ink)'],
  };
  const [bg, fg] = toneMap[tone] || toneMap.sage;
  return (
    <Card pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>{label}</div>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: fg }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
        <span style={{ fontSize: 27, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)' }}>{unit}</span>
      </div>
      <div style={{ marginTop: 8, display: 'inline-flex', padding: '5px 9px', borderRadius: 999, background: bg, color: fg, fontSize: 11.5, fontWeight: 800 }}>
        {sub}
      </div>
    </Card>
  );
}

Object.assign(window, { HomeScreen });
