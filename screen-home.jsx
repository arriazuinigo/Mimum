// screen-home.jsx — Home / dashboard
const HOME_STAGE = {
  postpartum: {
    heroSub: 'Your readings have been calm and steady. You’re taking beautiful care of your heart.',
    todaySub: 'Best taken now, while you’re rested',
    nextLabel: '12-week', nextDetail: 'in 18 days', nextProg: '64%', nextHead: 'Next check-in',
  },
  pregnant: {
    heroSub: 'You and your baby are doing beautifully. A calm reading today keeps us both reassured.',
    todaySub: 'A gentle weekly check keeps watch alongside your midwife',
    nextLabel: 'Week 25', nextDetail: 'midwife in 4 days', nextProg: '60%', nextHead: 'This pregnancy',
  },
  planning: {
    heroSub: 'We’re building a calm picture of your baseline — one gentle reading at a time.',
    todaySub: 'A relaxed reading helps establish your natural baseline',
    nextLabel: 'Baseline', nextDetail: '3 of 5 readings', nextProg: '60%', nextHead: 'Getting started',
  },
};
function HomeScreen({ user, onNav, mascotState, stage = 'postpartum', onMeasure, lastReading, readings = [] }) {
  const cfg = HOME_STAGE[stage] || HOME_STAGE.postpartum;
  const goMeasure = () => (onMeasure ? onMeasure('intro') : onNav('measure'));
  const last = lastReading || { sys: 118, dia: 76, tier: 'steady' };
  const spark = readings.length ? readings.slice(0, 6).reverse().map((r) => Number(r.sys || r.systolic)) : [124, 121, 122, 119, 120, 118];
  const lastInRange = last.tier === 'steady';
  const week = [
    { label: 'M', state: 'done' }, { label: 'T', state: 'done' },
    { label: 'W', state: 'done' }, { label: 'T', state: 'done' },
    { label: 'F', state: 'today' }, { label: 'S', state: 'future' },
    { label: 'S', state: 'future' },
  ];

  return (
    <AppScreen>
      {/* header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: 0.2 }}>Friday, June 6</div>
          <h1 style={{ margin: '3px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: 'var(--ink)' }}>
            Good morning, {user.name}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <IconButton icon={<Icon name="bell" size={21} stroke="var(--ink-2)" />} label="Notifications" />
          <button onClick={() => onNav('profile')} {...pressHandlers(0.92)} aria-label="Profile" style={{ borderRadius: '50%', transition: 'transform .12s ease' }}>
            <Avatar initials={user.name[0]} size={44} />
          </button>
        </div>
      </div>

      {/* hero — mascot + calm status */}
      <div className="fade-up" style={{ animationDelay: '60ms', position: 'relative', marginTop: 6, marginBottom: 18 }}>
        <div style={{
          position: 'relative', borderRadius: 'var(--r-lg)', overflow: 'hidden',
          background: 'linear-gradient(180deg, var(--surface) 0%, var(--blush-50) 100%)',
          padding: '14px 20px 24px', textAlign: 'center',
          border: '1px solid oklch(92% 0.02 20 / 0.7)',
        }}>
          {/* soft glow behind mascot */}
          <div style={{
            position: 'absolute', top: 64, left: '50%', transform: 'translateX(-50%)',
            width: 230, height: 150, borderRadius: '50%',
            background: 'radial-gradient(circle, oklch(90% 0.05 18 / 0.30), transparent 70%)', filter: 'blur(10px)',
          }} />
          <div style={{ position: 'relative' }}>
            <Mascot state={mascotState} h={172} float />
            <div style={{ marginTop: -6 }}>
              <TierPill tier={user.tier} size="lg" />
            </div>
            <p style={{ margin: '14px auto 0', maxWidth: 280, fontSize: 16, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
              {cfg.heroSub}
            </p>
          </div>
        </div>
      </div>

      {/* today's action */}
      <div className="fade-up" style={{ animationDelay: '120ms', marginBottom: 14 }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 20px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(160deg, var(--lav-fill), oklch(90% 0.05 295))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="pulse" size={28} stroke="var(--lav-ink)" sw={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 0.4, color: 'var(--rose-ink)', textTransform: 'uppercase' }}>Today</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 2 }}>Breathe &amp; measure</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 2 }}>{cfg.todaySub}</div>
            </div>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            <PrimaryButton onClick={goMeasure} icon={<Icon name="heart" size={20} stroke="#fff" fill="oklch(100% 0 0 / 0.25)" />}>
              Begin your calm reading
            </PrimaryButton>
          </div>
        </Card>
      </div>

      {/* this week streak */}
      <div className="fade-up" style={{ animationDelay: '160ms', marginBottom: 14 }}>
        <Card onClick={() => onNav('journey')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>This week</div>
            <Pill tone="blush"><Icon name="sparkle" size={14} stroke="var(--rose-ink)" />4-day streak</Pill>
          </div>
          <StreakStrip days={week} />
        </Card>
      </div>

      {/* metric snapshot row */}
      <div className="fade-up" style={{ animationDelay: '200ms', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <Card pad={16} onClick={() => onNav('trends')}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>Last reading</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, margin: '4px 0 6px' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>{last.sys || last.systolic}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink-3)' }}>/{last.dia || last.diastolic}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: lastInRange ? 'var(--sage-ink)' : 'var(--honey-ink)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: lastInRange ? 'var(--sage-dot)' : 'var(--honey-dot)' }} />{lastInRange ? 'In range' : 'Worth watching'}
            </span>
            <Sparkline data={spark} width={56} height={22} />
          </div>
        </Card>
        <Card pad={16} onClick={() => onNav('trends')}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-3)' }}>{cfg.nextHead}</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--ink)', margin: '6px 0 2px', letterSpacing: -0.3 }}>{cfg.nextLabel}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{cfg.nextDetail}</div>
          <div style={{ marginTop: 10, height: 6, borderRadius: 99, background: 'var(--blush-100)', overflow: 'hidden' }}>
            <div style={{ width: cfg.nextProg, height: '100%', borderRadius: 99, background: 'var(--blush-400)' }} />
          </div>
        </Card>
      </div>

      {/* gentle tip */}
      <div className="fade-up" style={{ animationDelay: '240ms' }}>
        <TintCard tint="var(--sage-fill)" pad={18}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 14, flexShrink: 0, background: 'oklch(100% 0 0 / 0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="leaf" size={23} stroke="var(--sage-ink)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--sage-ink)', textTransform: 'uppercase', letterSpacing: 0.3 }}>Gentle tip</div>
              <p style={{ margin: '4px 0 0', fontSize: 14.5, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 500, textWrap: 'pretty' }}>
                A short walk after lunch can quietly support your blood pressure. No pressure — even ten minutes counts.
              </p>
            </div>
          </div>
        </TintCard>
      </div>
    </AppScreen>
  );
}

Object.assign(window, { HomeScreen });
