// screen-journey.jsx — Progress calendar
function JourneyScreen({ onNav, readings = [] }) {
  const metrics = PhysiqueMetrics.summarize(readings);
  const calendar = metrics.calendar;
  const [picked, setPicked] = useState(null);
  const selectedDayNumber = picked || calendar.todayDay;
  const selectedDay = calendar.cells.find((cell) => cell && cell.day === selectedDayNumber);
  const selectedEntries = selectedDay?.entries || [];
  const selectedLatest = selectedEntries[selectedEntries.length - 1];
  const summaryCopy = metrics.demo
    ? 'Demo inicial basada en el plan del documento. Guarda tu primer check-in para reemplazarla.'
    : `${metrics.monthCount} check-ins este mes. La tendencia pesa más que cualquier día suelto.`;

  const sixKgEarned = metrics.weightLost >= 6;
  const waistHalfEarned = metrics.waistProgress >= 50;
  const proteinEarned = metrics.latest.protein >= metrics.plan.proteinLow;
  const stepsEarned = metrics.latest.steps >= metrics.plan.stepsLow;

  return (
    <AppScreen>
      <ScreenHeader eyebrow="Progreso" title="Cada semana cuenta" sub="Un registro simple para ver cintura, peso y adherencia sin ruido." />

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <RingProgress value={metrics.kgProgress / 100} size={86} stroke={8} color="var(--blush-500)" track="var(--blush-100)">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 21, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>{metrics.kgProgress}%</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--ink-3)' }}>6 kg</div>
            </div>
          </RingProgress>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', gap: 18 }}>
              <Stat n={metrics.weightLost.toFixed(1)} label="kg perdidos" />
              <Stat n={metrics.waistDrop.toFixed(1)} label="cm cintura" tone="blush" />
            </div>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'var(--ink-2)', fontWeight: 500, lineHeight: 1.4 }}>
              {summaryCopy}
            </p>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronLeft" size={20} stroke="var(--ink-3)" /></button>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{calendar.label}</div>
          <button {...pressHandlers(0.9)} style={{ padding: 6 }}><Icon name="chevronRight" size={20} stroke="var(--ink-3)" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d, i) => (
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
              <button key={i} onClick={() => setPicked(cell.day)} aria-label={`${cell.count ? `${cell.count} check-in` : 'Sin check-in'} ${PhysiqueMetrics.shortDate(cell.date)}`} style={{
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
                    borderRadius: '50%', background: cell.color,
                  }} />
                )}
              </button>
            );
          })}
        </div>
        <Divider style={{ margin: '16px 0 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{selectedDay ? PhysiqueMetrics.shortDate(selectedDay.date) : 'Día seleccionado'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 2 }}>
              {selectedLatest
                ? `${selectedLatest.weight.toFixed(1)} kg · ${selectedLatest.waist.toFixed(1)} cm · ${selectedLatest.calories} kcal`
                : selectedDay?.isFuture
                  ? 'Aún sin check-in'
                  : 'Sin datos guardados'}
            </div>
          </div>
          {selectedLatest ? (
            <Pill tone={selectedLatest.onPlan ? 'sage' : 'honey'}>{selectedLatest.onPlan ? 'En plan' : 'Ajustar'}</Pill>
          ) : (
            <button onClick={() => onNav('measure')} style={{ height: 36, padding: '0 12px', borderRadius: 99, background: 'var(--blush-100)', color: 'var(--rose-ink)', fontSize: 12.5, fontWeight: 800 }}>
              Añadir
            </button>
          )}
        </div>
      </Card>

      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 4px 12px' }}>Hitos</div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Badge icon="weight" label="Primer corte" tone="sage" earned={sixKgEarned} />
          <Badge icon="flag" label="50% cintura" tone="blush" earned={waistHalfEarned} />
          <Badge icon="check" label="Proteína" tone="honey" earned={proteinEarned} />
          <Badge icon="walk" label="Pasos" tone="lav" earned={stepsEarned} />
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
