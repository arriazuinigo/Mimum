// screen-handoff.jsx — GP hand-off summary
function HandoffScreen({ user, readings = [], onExit, onNav }) {
  const [sent, setSent] = useState(false);
  const metrics = MimumReadingMetrics.summarize(readings);
  const padSeries = (values, fallback) => values.length >= 2 ? values : values.length === 1 ? [values[0], values[0]] : fallback;
  const bpSys = padSeries(metrics.chart.sys, [126, 123, 121, 124, 119, 118]);
  const bpDia = padSeries(metrics.chart.dia, [84, 82, 80, 81, 78, 76]);
  const avgValue = metrics.avg ? `${metrics.avg.sys}/${metrics.avg.dia} mmHg` : '--/-- mmHg';
  const generatedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (sent) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', textAlign: 'center', background: 'radial-gradient(130% 90% at 50% 14%, var(--blush-100), var(--bg-app) 58%)' }}>
        <div className="pop-in"><Mascot state="proud" h={176} float /></div>
        <h1 className="fade-up" style={{ margin: '12px 0 0', fontSize: 27, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5 }}>Summary ready to share</h1>
        <p className="fade-up" style={{ animationDelay: '80ms', margin: '12px auto 0', maxWidth: 290, fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          Your clean one-page summary is prepared. Share it however suits you — your GP will have the full picture.
        </p>
        <div className="fade-up" style={{ animationDelay: '160ms', marginTop: 28, width: '100%', maxWidth: 320 }}>
          <PrimaryButton onClick={onExit}>Done</PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <AppScreen pad={false}>
      <div style={{ padding: '58px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <IconButton onClick={onExit} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={42} />
          <Pill tone="lav"><Icon name="lock" size={13} stroke="var(--lav-ink)" />Private to you</Pill>
        </div>
        <ScreenHeader eyebrow="For your GP" title="Your summary, ready" sub="A calm one-page picture of your year so far. It shares facts — never a diagnosis." />
      </div>

      {/* the "document" preview */}
      <div style={{ padding: '0 22px 24px' }}>
        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--r-card)', overflow: 'hidden',
          boxShadow: 'var(--sh-lift)', border: '1px solid oklch(92% 0.01 24 / 0.7)',
        }}>
          {/* doc header */}
          <div style={{ background: 'var(--blush-50)', padding: '18px 20px', borderBottom: '1px solid var(--hairline)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{user?.name || 'Mimum patient'}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 2 }}>Postpartum cardiovascular follow-up</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>Generated</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>{generatedDate}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              <Pill tone="honey" style={{ fontSize: 11.5 }}>Preeclampsia</Pill>
              <Pill tone="honey" style={{ fontSize: 11.5 }}>Gestational diabetes</Pill>
            </div>
          </div>

          {/* BP trend */}
          <div style={{ padding: '18px 20px' }}>
            <DocRow label="Blood pressure" value={avgValue} sub={`${metrics.total} reading${metrics.total === 1 ? '' : 's'} · recent avg`} tone={metrics.latest?.attention ? 'honey' : 'sage'} />
            <div style={{ margin: '6px -4px 0' }}>
              <BPTrendChart sys={bpSys} dia={bpDia} labels={bpSys.map(() => '')} height={120} />
            </div>
          </div>
          <SummaryLine label="Readings in range" value={metrics.total ? `${metrics.steadyPct}%` : '--'} detail={metrics.trend} tone={metrics.latest?.attention ? 'honey' : 'sage'} />
          <SummaryLine label="Mood (EPDS)" value="6 / 30" detail="low range · stable" tone="sage" />
          <SummaryLine label="Weight" value="68.4 kg" detail="−5.6 kg over 6 wk" tone="plain" />
          <SummaryLine label="Reading days" value={String(metrics.monthDays)} detail={`${metrics.monthCount} readings this month`} tone="plain" last />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 4px', fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600 }}>
          <Icon name="info" size={15} stroke="var(--ink-3)" />Mimum shares your data, not opinions. Your GP interprets it.
        </div>
      </div>

      <div style={{ padding: '0 22px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PrimaryButton onClick={() => setSent(true)} icon={<Icon name="share" size={19} stroke="#fff" />}>Share with my GP</PrimaryButton>
        <SoftButton full icon={<Icon name="doc" size={18} stroke="var(--rose-ink)" />}>Save as PDF</SoftButton>
      </div>
    </AppScreen>
  );
}

function DocRow({ label, value, sub, tone }) {
  const col = tone === 'sage' ? 'var(--sage-ink)' : tone === 'honey' ? 'var(--honey-ink)' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{label}</div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: col, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{sub}</div>
      </div>
    </div>
  );
}

function SummaryLine({ label, value, detail, tone, last }) {
  const col = tone === 'sage' ? 'var(--sage-ink)' : tone === 'honey' ? 'var(--honey-ink)' : 'var(--ink)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid var(--hairline)' }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>{detail}</div>
      </div>
      <span style={{ fontSize: 17, fontWeight: 800, color: col, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

Object.assign(window, { HandoffScreen });
