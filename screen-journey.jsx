// screen-journey.jsx — Calendar "My journey"
function JourneyScreen({ onNav }) {
  // June 2026, Monday-start. June 1 falls on Sunday → 6 leading blanks.
  const LEADING = 6;
  const DAYS = 30;
  const today = 6;
  const logged = { 1: 'var(--blush-300)', 2: 'var(--blush-400)', 3: 'var(--sage-dot)', 4: 'var(--blush-400)', 6: 'var(--blush-500)' };
  const missed = [5];

  const cells = [];
  for (let i = 0; i < LEADING; i++) cells.push(null);
  for (let d = 1; d <= DAYS; d++) cells.push(d);

  const [picked, setPicked] = useState(today);

  return (
    <AppScreen>
      <ScreenHeader eyebrow="My journey" title="Every day counts" sub="Each log blooms. Quiet days are just rest — never a mark against you." />

      {/* summary */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Mascot state="proud" h={92} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <Stat n="18" label="days logged" />
              <Stat n="5" label="day streak" tone="blush" />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, lineHeight: 1.4 }}>
              Your strongest month yet. Keep blooming.
            </p>
          </div>
        </div>
      </Card>

      {/* month calendar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronLeft" size={20} stroke="var(--ink-3)" /></button>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>June 2026</div>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronRight" size={20} stroke="var(--ink-3)" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, i) => {
            if (d === null) return <div key={i} />;
            const isLogged = logged[d];
            const isToday = d === today;
            const isMissed = missed.includes(d);
            const isFuture = d > today;
            return (
              <button key={i} onClick={() => setPicked(d)} style={{
                aspectRatio: '1', borderRadius: 14, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isLogged ? 'var(--blush-50)' : 'transparent',
                border: picked === d ? '2px solid var(--blush-400)' : isToday ? '2px solid var(--blush-200)' : '2px solid transparent',
                transition: 'all .2s ease',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: isLogged ? 800 : 600,
                  color: isFuture ? 'var(--ink-3)' : isLogged ? 'var(--rose-ink)' : 'var(--ink-2)',
                }}>{d}</span>
                {isLogged && (
                  <span style={{
                    position: 'absolute', bottom: 5, width: 7, height: 7,
                    borderRadius: '40% 40% 45% 45% / 48% 48% 40% 40%', background: isLogged,
                  }} />
                )}
                {isMissed && <span style={{ position: 'absolute', bottom: 6, width: 4, height: 4, borderRadius: '50%', background: 'var(--hairline)' }} />}
              </button>
            );
          })}
        </div>
      </Card>

      {/* milestones */}
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 4px 12px' }}>Milestones</div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Badge icon="leaf" label="First week" tone="sage" earned />
          <Badge icon="star" label="10 readings" tone="blush" earned />
          <Badge icon="trophy" label="Full month" tone="honey" earned={false} />
          <Badge icon="heart" label="Steady 30" tone="lav" earned={false} />
        </div>
      </Card>
    </AppScreen>
  );
}

function Stat({ n, label, tone }) {
  return (
    <div>
      <div style={{ fontSize: 26, fontWeight: 800, color: tone === 'blush' ? 'var(--rose-ink)' : 'var(--ink)', letterSpacing: -0.5, lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { JourneyScreen });
