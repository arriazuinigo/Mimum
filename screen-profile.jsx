// screen-profile.jsx — Profile & settings (entry to records, etc.)
function ProfileScreen({ user, auth, onExit, onNav }) {
  const sections = [
    {
      title: 'My health', rows: [
        ['doc', 'blush', 'Medical records', '3 ways to enrich your profile', () => onNav('records'), 'records'],
        ['pulse', 'sage', 'Pregnancy history', 'Preeclampsia · Gestational diabetes', () => onNav('onboarding')],
        ['pill', 'lav', 'My medications', 'Labetalol · Aspirin', () => onNav('log')],
      ],
    },
    {
      title: 'Sharing & care', rows: [
        ['share', 'blush', 'GP hand-off summary', 'Prepare a page for your doctor', () => onNav('handoff')],
        ['bell', 'honey', 'Reminders', 'Gentle nudges, your way', null],
      ],
    },
    {
      title: 'Privacy', rows: [
        ['lock', 'lav', 'Your data', 'Private to you — shared only by you', null],
      ],
    },
  ];
  const TONE_FILL = { blush: 'var(--blush-50)', lav: 'var(--lav-fill)', sage: 'var(--sage-fill)', honey: 'var(--honey-fill)', plain: 'var(--bg-soft)' };
  const TONE_INK = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', sage: 'var(--sage-ink)', honey: 'var(--honey-ink)', plain: 'var(--ink-2)' };

  return (
    <AppScreen pad={false}>
      <div style={{ padding: '58px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <IconButton onClick={onExit} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Back" size={42} />
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>You</div>
          <div style={{ width: 42 }} />
        </div>
      </div>

      <div style={{ padding: '0 22px 30px' }}>
        {/* identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Avatar initials={user.name[0]} size={64} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>{user.name}</div>
            <div style={{ marginTop: 6 }}><TierPill tier={user.tier} /></div>
          </div>
        </div>
        <p style={{ margin: '14px 2px 18px', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          12 weeks postpartum · Year-one heart follow-up
        </p>

        {/* Mimum+ soft upgrade banner */}
        <button onClick={() => onNav('premium')} {...pressHandlers(0.98)} style={{
          display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
          padding: '16px 18px', borderRadius: 22, marginBottom: 22,
          background: 'linear-gradient(135deg, var(--lav-fill), var(--blush-50))',
          border: '1px solid oklch(85% 0.04 295 / 0.4)', transition: 'transform .12s ease',
        }}>
          <div style={{ width: 50, height: 50, borderRadius: 15, background: 'oklch(100% 0 0 / 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="sparkle" size={26} stroke="var(--lav-ink)" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Discover Mimum+</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 1 }}>Story reports, family mode, Mimo outfits</div>
          </div>
          <Icon name="chevronRight" size={20} stroke="var(--lav-ink)" />
        </button>

        {/* Mimum+ features (subtle locked entry points) */}
        <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 4px 10px' }}>Mimum+</div>
        <Card pad={0} style={{ overflow: 'hidden', marginBottom: 22 }}>
          <PremiumLockRow icon="doc" tone="lav" title="Quarterly story report" sub="Your trends, warmly explained" onOpen={() => onNav('premium')} />
          <div style={{ borderTop: '1px solid var(--hairline)' }}>
            <PremiumLockRow icon="heart" tone="blush" title="Family mode" sub="Share only what you choose" onOpen={() => onNav('premium')} />
          </div>
          <div style={{ borderTop: '1px solid var(--hairline)' }}>
            <PremiumLockRow icon="sparkle" tone="honey" title="Dress up Mimo" sub="Outfits, accessories & themes" onOpen={() => onNav('premium')} />
          </div>
        </Card>

        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 4px 10px' }}>{s.title}</div>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {s.rows.map(([icon, tone, title, sub, onClick, highlight], i) => (
                <button key={title} onClick={onClick || undefined} disabled={!onClick} style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                  padding: '15px 16px', background: highlight === 'records' ? 'var(--blush-50)' : 'transparent',
                  borderTop: i > 0 ? '1px solid var(--hairline)' : 'none',
                  cursor: onClick ? 'pointer' : 'default',
                }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: TONE_FILL[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={icon} size={22} stroke={TONE_INK[tone]} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
                  </div>
                  {highlight === 'records' && <Pill tone="blush" style={{ fontSize: 11 }}>New</Pill>}
                  {onClick && <Icon name="chevronRight" size={19} stroke="var(--ink-3)" />}
                </button>
              ))}
            </Card>
          </div>
        ))}

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 4px 10px' }}>Account</div>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="lock" size={22} stroke="var(--ink-2)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{auth?.email || 'Guest account'}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{auth?.mode === 'firebase' ? 'Synced with Firebase' : 'Stored on this device'}</div>
              </div>
            </div>
            <button onClick={auth?.onSignOut} style={{
              display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
              padding: '15px 16px', background: 'transparent', borderTop: '1px solid var(--hairline)', cursor: 'pointer',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--blush-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="chevronLeft" size={22} stroke="var(--rose-ink)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>Sign out</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>Come back anytime</div>
              </div>
            </button>
          </Card>
        </div>
      </div>
    </AppScreen>
  );
}

Object.assign(window, { ProfileScreen });
