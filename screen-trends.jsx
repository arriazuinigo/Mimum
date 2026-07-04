// screen-trends.jsx — Physique trends
function TrendsScreen({ onNav, readings = [] }) {
  const [tab, setTab] = useState('weight');
  const metrics = PhysiqueMetrics.summarize(readings);
  const plan = metrics.plan;
  const labels = metrics.chart.labels;

  return (
    <AppScreen>
      <ScreenHeader eyebrow="Tendencias" title="La foto completa" sub="Peso, cintura y adherencia juntos. El objetivo es perder grasa sin regalar músculo." />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>Plan de corte inicial</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 13, left: 14, right: 14, height: 3, background: 'var(--blush-100)', borderRadius: 9 }} />
          <div style={{ position: 'absolute', top: 13, left: 14, width: `${metrics.kgProgress}%`, maxWidth: '100%', height: 3, background: 'var(--blush-400)', borderRadius: 9 }} />
          {[
            ['79 kg', 'inicio', metrics.weightLost > 0],
          ['73 kg', 'mínimo', metrics.weightLost >= 6],
            ['71-72', 'central', metrics.latest.weight <= 72],
            ['77 cm', 'cintura', metrics.latest.waist <= 77],
          ].map(([label, sub, done], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? 'var(--blush-400)' : i === 1 ? 'var(--surface)' : 'var(--bg-soft)',
                border: !done && i === 1 ? '3px solid var(--blush-400)' : '3px solid transparent',
                boxShadow: done || i === 1 ? 'var(--sh-soft)' : 'none',
              }}>
                {done ? <Icon name="check" size={15} stroke="#fff" sw={2.6} /> : i === 1 ? <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--blush-400)' }} /> : null}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: done || i === 1 ? 'var(--ink)' : 'var(--ink-3)' }}>{label}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {[
          ['weight', 'Peso'],
          ['waist', 'Cintura'],
          ['calories', 'Calorías'],
          ['steps', 'Pasos'],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flexShrink: 0, padding: '9px 16px', borderRadius: 99, fontSize: 13.5, fontWeight: 700,
            background: tab === id ? 'var(--blush-500)' : 'var(--surface)',
            color: tab === id ? '#fff' : 'var(--ink-2)',
            boxShadow: tab === id ? 'var(--sh-btn)' : 'var(--sh-soft)',
            border: '1px solid oklch(92% 0.01 160 / 0.6)',
          }}>{label}</button>
        ))}
      </div>

      <Card style={{ marginBottom: 16 }}>
        {tab === 'weight' && (
          <>
            <ChartHead title="Peso" value={metrics.latest.weight.toFixed(1)} unit="kg actual" tone="sage" trend={metrics.trend} />
            <LineChart data={metrics.chart.weight} labels={labels} yMin={70} yMax={80} yTicks={[72, 76, 80]} color="var(--sage-dot)" fillColor="oklch(78% 0.08 152 / 0.13)" />
            <LegendRow items={[['var(--sage-dot)', 'peso'], ['var(--blush-500)', 'objetivo 73 kg']]} />
          </>
        )}
        {tab === 'waist' && (
          <>
            <ChartHead title="Cintura" value={metrics.latest.waist.toFixed(1)} unit="cm actual" tone="blush" trend={`${metrics.waistDrop.toFixed(1)} cm menos desde 89`} />
            <LineChart data={metrics.chart.waist} labels={labels} yMin={76} yMax={90} yTicks={[77, 83, 89]} color="var(--blush-500)" fillColor="oklch(72% 0.10 170 / 0.13)" />
            <LegendRow items={[['var(--blush-500)', 'cintura'], ['var(--honey-dot)', 'meta 77 cm']]} />
          </>
        )}
        {tab === 'calories' && (
          <>
            <ChartHead title="Calorías" value={metrics.currentCalories} unit="kcal último día" tone="honey" trend={`meta aproximada ${plan.targetCalories} kcal`} />
            <LineChart data={metrics.chart.calories} labels={labels} yMin={1800} yMax={2600} yTicks={[2000, 2200, 2500]} color="var(--honey-dot)" fillColor="oklch(78% 0.09 78 / 0.13)" />
            <LegendRow items={[['var(--honey-dot)', 'ingesta'], ['var(--blush-500)', 'deficit 450 kcal']]} />
          </>
        )}
        {tab === 'steps' && (
          <>
            <ChartHead title="Pasos" value={`${Math.round(metrics.latest.steps / 100) / 10}k`} unit="último día" tone="sage" trend={`rango ${metrics.stepsRange} pasos`} />
            <LineChart data={metrics.chart.steps} labels={labels} yMin={4} yMax={12} yTicks={[6, 8, 10, 12]} color="var(--lav-dot)" fillColor="oklch(78% 0.06 295 / 0.13)" />
            <LegendRow items={[['var(--lav-dot)', 'pasos x1000'], ['var(--sage-dot)', 'minimo 8k']]} />
          </>
        )}
      </Card>

      <Card style={{ marginBottom: 16 }} onClick={() => onNav('premium')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 15, background: 'linear-gradient(135deg, var(--lav-fill), var(--blush-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="doc" size={24} stroke="var(--lav-ink)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Informe de corte</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>Resumen semanal con cintura, peso, déficit y fuerza</div>
          </div>
          <PremiumTag />
        </div>
      </Card>

      <TintCard tint="var(--lav-fill)" pad={18}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'oklch(100% 0 0 / 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="info" size={21} stroke="var(--lav-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: 'var(--lav-ink)', fontWeight: 600, textWrap: 'pretty' }}>
              Si pierdes más de 0,7 kg por semana y baja la fuerza, sube ligeramente calorías. El plan busca ritmo sostenible.
            </p>
          </div>
        </div>
      </TintCard>
    </AppScreen>
  );
}

function ChartHead({ title, value, unit, tone, trend }) {
  const col = tone === 'sage' ? 'var(--sage-ink)' : tone === 'honey' ? 'var(--honey-ink)' : 'var(--rose-ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 12 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{title}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, fontWeight: 700, color: col }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />{trend}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)' }}>{unit}</div>
      </div>
    </div>
  );
}

function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingLeft: 4, flexWrap: 'wrap' }}>
      {items.map(([color, label], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 16, height: 3, borderRadius: 9, background: color }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { TrendsScreen });
