// screen-journey.jsx — Calendar "My journey"
function JourneyScreen({ onNav, readings = [] }) {
  const metrics = MimumReadingMetrics.summarize(readings);
  const calendar = metrics.calendar;
  const [picked, setPicked] = useState(null);
  const selectedDayNumber = picked || calendar.todayDay;
  const selectedDay = calendar.cells.find((cell) => cell && cell.day === selectedDayNumber);
  const selectedReadings = selectedDay?.readings || [];
  const selectedAvg = selectedDay?.avg;
  const selectedTone = selectedDay?.attention ? 'honey' : selectedReadings.length ? 'sage' : 'plain';
  const summaryCopy = metrics.total
    ? metrics.currentStreak
      ? `${metrics.currentStreak} days in a row. Keep blooming.`
      : `${metrics.monthCount} readings saved this month.`
    : 'Your calendar will bloom as soon as you save your first reading.';
  const firstWeekEarned = metrics.totalDays >= 7;
  const tenReadingsEarned = metrics.total >= 10;
  const fullMonthEarned = metrics.monthDays >= 28;
  const steadyThirtyEarned = metrics.steadyCount >= 30;

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
              <Stat n={metrics.totalDays} label="days logged" />
              <Stat n={metrics.currentStreak} label="day streak" tone="blush" />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, lineHeight: 1.4 }}>
              {summaryCopy}
            </p>
          </div>
        </div>
      </Card>

      {/* month calendar */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronLeft" size={20} stroke="var(--ink-3)" /></button>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{calendar.label}</div>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronRight" size={20} stroke="var(--ink-3)" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {calendar.cells.map((cell, i) => {
            if (cell === null) return <div key={i} />;
            const isLogged = cell.count > 0;
            const isToday = cell.isToday;
            const isSelected = selectedDayNumber === cell.day;
            return (
              <button key={i} onClick={() => setPicked(cell.day)} aria-label={`${cell.count ? `${cell.count} reading${cell.count === 1 ? '' : 's'}` : 'No readings'} on ${MimumReadingMetrics.shortDate(cell.date)}`} style={{
                aspectRatio: '1', borderRadius: 14, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isLogged ? 'var(--blush-50)' : 'transparent',
                border: isSelected ? '2px solid var(--blush-400)' : isToday ? '2px solid var(--blush-200)' : '2px solid transparent',
                transition: 'all .2s ease',
              }}>
                <span style={{
                  fontSize: 13, fontWeight: isLogged ? 800 : 600,
                  color: cell.isFuture ? 'var(--ink-3)' : isLogged ? 'var(--rose-ink)' : 'var(--ink-2)',
                }}>{cell.day}</span>
                {isLogged && (
                  <span style={{
                    position: 'absolute', bottom: 5, width: 7, height: 7,
                    borderRadius: '40% 40% 45% 45% / 48% 48% 40% 40%', background: cell.color,
                  }} />
                )}
              </button>
            );
          })}
        </div>
        <Divider style={{ margin: '16px 0 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{selectedDay ? MimumReadingMetrics.shortDate(selectedDay.date) : 'Selected day'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
              {selectedReadings.length
                ? `${selectedReadings.length} reading${selectedReadings.length === 1 ? '' : 's'} · avg ${selectedAvg.sys}/${selectedAvg.dia}`
                : selectedDay?.isFuture
                  ? 'No reading planned yet'
                  : 'No reading saved for this day'}
            </div>
          </div>
          {selectedReadings.length ? (
            <Pill tone={selectedTone}>{selectedDay.attention ? 'Watch' : 'Steady'}</Pill>
          ) : (
            <button onClick={() => onNav('measure')} style={{ height: 36, padding: '0 12px', borderRadius: 99, background: 'var(--blush-100)', color: 'var(--rose-ink)', fontSize: 12.5, fontWeight: 800 }}>
              Add reading
            </button>
          )}
        </div>
      </Card>

      {/* milestones */}
      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 4px 12px' }}>Milestones</div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Badge icon="leaf" label="First week" tone="sage" earned={firstWeekEarned} />
          <Badge icon="star" label="10 readings" tone="blush" earned={tenReadingsEarned} />
          <Badge icon="trophy" label="Full month" tone="honey" earned={fullMonthEarned} />
          <Badge icon="heart" label="Steady 30" tone="lav" earned={steadyThirtyEarned} />
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
