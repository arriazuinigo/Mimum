// screen-profile.jsx — Profile and plan settings
function ProfileScreen({ user, auth, onExit, onNav }) {
  const plan = PhysiqueMetrics.PLAN;
  const sections = [
    {
      title: 'Plan',
      rows: [
        ['flag', 'blush', 'Objetivo inicial', `${plan.targetWeightRange} kg · ${plan.targetWaist} cm cintura`, () => onNav('measure')],
        ['chart', 'honey', 'Estructura', 'Hombros, pecho, cintura y cadera', () => onNav('measure')],
        ['weight', 'sage', 'Peso', 'Referencia junto a las medidas corporales', () => onNav('measure')],
      ],
    },
    {
      title: 'Medidas',
      rows: [
        ['pulse', 'lav', 'Check-in corporal', 'Comparación rojo vs verde', () => onNav('measure')],
        ['doc', 'sage', 'Historial', 'Registros de medidas guardadas', () => onNav('measure')],
      ],
    },
    {
      title: 'Privacidad',
      rows: [
        ['lock', 'lav', 'Tus datos', 'Guardados solo en tu cuenta o en este dispositivo', null],
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
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Perfil</div>
          <div style={{ width: 42 }} />
        </div>
      </div>

      <div style={{ padding: '0 22px 30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <Avatar initials={user.name[0]} size={64} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: -0.4 }}>{user.name}</div>
            <div style={{ marginTop: 6 }}><TierPill tier={user.tier} /></div>
          </div>
        </div>
        <p style={{ margin: '14px 2px 18px', fontSize: 14, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500 }}>
          Medición corporal: peso, cintura, hombros, pecho, cadera, brazos y piernas.
        </p>

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
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Physique Pro</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600, marginTop: 1 }}>Informes, ajustes y escenarios de peso</div>
          </div>
          <Icon name="chevronRight" size={20} stroke="var(--lav-ink)" />
        </button>

        {sections.map((s) => (
          <div key={s.title} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 4px 10px' }}>{s.title}</div>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {s.rows.map(([icon, tone, title, sub, onClick], i) => (
                <button key={title} onClick={onClick || undefined} disabled={!onClick} style={{
                  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                  padding: '15px 16px', background: 'transparent',
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
                  {onClick && <Icon name="chevronRight" size={19} stroke="var(--ink-3)" />}
                </button>
              ))}
            </Card>
          </div>
        ))}

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: 0.4, margin: '0 4px 10px' }}>Cuenta</div>
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
