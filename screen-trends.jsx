// screen-trends.jsx — Trajectory / My risk
function TrendsScreen({ onNav, hasGlucose = true, stage = 'postpartum', readings = [] }) {
  const checkpoints = [
    { label: '6 wk', state: 'done', date: 'Apr 28' },
    { label: '12 wk', state: 'current', date: 'Jun 24' },
    { label: '6 mo', state: 'future', date: 'Sep' },
    { label: '12 mo', state: 'future', date: 'Mar ’27' },
  ];
  const [tab, setTab] = useState('bp');
  const metrics = MimumReadingMetrics.summarize(readings);
  const padSeries = (values, fallback) => values.length >= 2 ? values : values.length === 1 ? [values[0], values[0]] : fallback;
  const padLabels = (labels, fallback) => labels.length >= 2 ? labels : labels.length === 1 ? ['', labels[0]] : fallback;
  const bpSys = padSeries(metrics.chart.sys, [126, 123, 121, 124, 119, 120, 118]);
  const bpDia = padSeries(metrics.chart.dia, [84, 82, 80, 81, 78, 79, 76]);
  const bpLabels = padLabels(metrics.chart.labels, ['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6', 'now']);
  const chartManualIdx = metrics.chart.manualIdx.length && metrics.chart.sys.length >= 2 ? metrics.chart.manualIdx : [];
  const latest = metrics.latest;
  const latestValue = latest ? `${latest.sys}/${latest.dia}` : '--/--';
  const steadyOverlay = metrics.chart.recent.length >= 2
    ? metrics.chart.recent.map((reading) => reading.steady ? 1 : 0.25)
    : metrics.chart.recent.length === 1
      ? [metrics.chart.recent[0].steady ? 1 : 0.25, metrics.chart.recent[0].steady ? 1 : 0.25]
      : [1, 1, 1, 1, 1, 1, 1];
  const steadyValue = metrics.total ? `${metrics.steadyPct}%` : '--';
  const steadyTrend = metrics.total ? `${metrics.monthCount} readings this month` : 'Save a reading to begin';

  return (
    <AppScreen>
      <ScreenHeader eyebrow="My trajectory" title="The bigger picture" sub="Your first-year follow-up, mapped gently. Trends matter more than any single day." />

      {/* checkpoint path */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 18 }}>Your follow-up plan</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 13, left: 14, right: 14, height: 3, background: 'var(--blush-100)', borderRadius: 9 }} />
          <div style={{ position: 'absolute', top: 13, left: 14, width: '34%', height: 3, background: 'var(--blush-400)', borderRadius: 9 }} />
          {checkpoints.map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1, flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: c.state === 'done' ? 'var(--blush-400)' : c.state === 'current' ? 'var(--surface)' : 'var(--bg-soft)',
                border: c.state === 'current' ? '3px solid var(--blush-400)' : '3px solid transparent',
                boxShadow: c.state !== 'future' ? 'var(--sh-soft)' : 'none',
              }}>
                {c.state === 'done' && <Icon name="check" size={15} stroke="#fff" sw={2.6} />}
                {c.state === 'current' && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--blush-400)' }} />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: c.state === 'future' ? 'var(--ink-3)' : 'var(--ink)' }}>{c.label}</div>
                <div style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-3)', marginTop: 1 }}>{c.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* metric tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
        {[['bp', 'Blood pressure'], ['combo', 'BP + meds'], ['weight', 'Weight'], ...(hasGlucose ? [['glucose', 'Glucose']] : [])].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            flexShrink: 0, padding: '9px 16px', borderRadius: 99, fontSize: 13.5, fontWeight: 700,
            background: tab === id ? 'var(--blush-500)' : 'var(--surface)',
            color: tab === id ? '#fff' : 'var(--ink-2)',
            boxShadow: tab === id ? 'var(--sh-btn)' : 'var(--sh-soft)',
            border: '1px solid oklch(92% 0.01 24 / 0.6)',
          }}>{label}</button>
        ))}
      </div>

      {/* chart card */}
      <Card style={{ marginBottom: 16 }}>
        {tab === 'bp' && (
          <>
            <ChartHead title="Blood pressure" value={latestValue} unit="mmHg latest" tone={latest?.attention ? 'blush' : 'sage'} trend={metrics.trend} />
            <BPTrendChart sys={bpSys} dia={bpDia} labels={bpLabels} manualIdx={chartManualIdx} />
            <LegendRow items={[['var(--blush-500)', 'Systolic'], ['var(--lav-dot)', 'Diastolic', true], ['var(--blush-500)', 'Manual', false, true]]} />
          </>
        )}
        {tab === 'combo' && (
          <>
            <ChartHead title="BP consistency" value={steadyValue} unit="steady readings" tone="blush" trend={steadyTrend} />
            <AdherenceOverlay sys={bpSys} adherence={steadyOverlay} labels={bpLabels} />
            <LegendRow items={[['var(--blush-500)', 'Systolic'], ['var(--blush-200)', 'Steady day']]} />
          </>
        )}
        {tab === 'weight' && (
          <>
            <ChartHead title="Weight" value="68.4" unit="kg" tone="sage" trend="Gently settling" />
            <LineChart data={[74, 73, 72, 71.5, 70, 69, 68.4]} labels={['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6', 'now']} yMin={64} yMax={78} yTicks={[68, 72, 76]} color="var(--sage-dot)" fillColor="oklch(80% 0.06 152 / 0.14)" />
          </>
        )}
        {tab === 'glucose' && (
          <>
            <ChartHead title="Fasting glucose" value="5.2" unit="mmol/L" tone="sage" trend="Comfortably in range" />
            <LineChart data={[6.1, 5.8, 5.6, 5.5, 5.4, 5.3, 5.2]} labels={['wk1', 'wk2', 'wk3', 'wk4', 'wk5', 'wk6', 'now']} yMin={4} yMax={8} band={{ from: 0, to: 5.6 }} yTicks={[5, 6, 7]} color="var(--lav-dot)" fillColor="oklch(80% 0.05 295 / 0.14)" />
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10, fontWeight: 600 }}>Shown because gestational diabetes was part of your history.</div>
          </>
        )}
      </Card>

      {/* Mimum+ quarterly report (soft, locked) */}
      <Card style={{ marginBottom: 16 }} onClick={() => onNav('premium')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 15, background: 'linear-gradient(135deg, var(--lav-fill), var(--blush-100))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="doc" size={24} stroke="var(--lav-ink)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)' }}>Quarterly story report</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>Your trends, warmly explained · as a PDF</div>
          </div>
          <PremiumTag />
        </div>
      </Card>

      <TintCard tint="var(--lav-fill)" pad={18}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: 'oklch(100% 0 0 / 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="doc" size={21} stroke="var(--lav-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5, color: 'var(--lav-ink)', fontWeight: 600, textWrap: 'pretty' }}>
              Heading to your 12-week check? Bring a clean summary your GP will appreciate.
            </p>
            <button onClick={() => onNav('handoff')} style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'oklch(100% 0 0 / 0.7)', color: 'var(--lav-ink)', fontWeight: 700, fontSize: 14, padding: '11px 16px', borderRadius: 99 }}>
              <Icon name="share" size={16} stroke="var(--lav-ink)" />Prepare GP summary
            </button>
          </div>
        </div>
      </TintCard>
    </AppScreen>
  );
}

function ChartHead({ title, value, unit, tone, trend }) {
  const col = tone === 'sage' ? 'var(--sage-ink)' : 'var(--rose-ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }} dangerouslySetInnerHTML={{ __html: title }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, fontSize: 12, fontWeight: 700, color: col }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor' }} />{trend}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }} dangerouslySetInnerHTML={{ __html: value }} />
        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)' }}>{unit}</div>
      </div>
    </div>
  );
}

function LegendRow({ items }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingLeft: 4, flexWrap: 'wrap' }}>
      {items.map(([color, label, dashed, square], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {square
            ? <span style={{ width: 9, height: 9, borderRadius: 2, border: `2px solid ${color}`, background: 'var(--surface)', transform: 'rotate(45deg)' }} />
            : <span style={{ width: 16, height: 3, borderRadius: 9, background: dashed ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)` : color }} />}
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { TrendsScreen });
