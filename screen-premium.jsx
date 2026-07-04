// screen-premium.jsx — Physique Pro
function PremiumTag({ size = 'sm', style = {} }) {
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: big ? 6 : 4,
      background: 'linear-gradient(135deg, var(--lav-fill), var(--blush-100))',
      color: 'var(--lav-ink)', fontWeight: 800,
      fontSize: big ? 13 : 11, letterSpacing: 0.2,
      padding: big ? '6px 12px' : '3px 9px', borderRadius: 99,
      boxShadow: 'inset 0 0 0 1px oklch(80% 0.05 295 / 0.35)', ...style,
    }}>
      <Icon name="sparkle" size={big ? 14 : 11} stroke="var(--lav-ink)" />Pro
    </span>
  );
}

function PremiumLockRow({ icon, tone = 'lav', title, sub, onOpen }) {
  const TONE_FILL = { blush: 'var(--blush-50)', lav: 'var(--lav-fill)', sage: 'var(--sage-fill)', honey: 'var(--honey-fill)' };
  const TONE_INK = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', sage: 'var(--sage-ink)', honey: 'var(--honey-ink)' };
  return (
    <button onClick={onOpen} style={{
      display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
      padding: '15px 16px', background: 'transparent', cursor: 'pointer',
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 14, background: TONE_FILL[tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={22} stroke={TONE_INK[tone]} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 600, marginTop: 1 }}>{sub}</div>
      </div>
      <PremiumTag />
    </button>
  );
}

const PREMIUM_FEATURES = [
  { icon: 'doc', tone: 'lav', title: 'Informe semanal', body: 'Peso, cintura, hombros, pecho y cadera convertidos en un resumen claro.' },
  { icon: 'chart', tone: 'blush', title: 'Escenarios de peso', body: 'Compara llegar a 73 kg, 72 kg o 70 kg segun como responda tu cintura.' },
  { icon: 'sparkle', tone: 'honey', title: 'Ajustes inteligentes', body: 'Sugerencias prudentes cuando el ritmo sea demasiado rapido o demasiado lento.' },
];

const COMPARE = [
  ['Dashboard de corte', true, true],
  ['Check-ins de medidas', true, true],
  ['Graficas de peso y cintura', true, true],
  ['Medidas de hombros, pecho y cadera', true, true],
  ['Informe semanal PDF', false, true],
  ['Escenarios de objetivo', false, true],
  ['Ajustes por tendencia', false, true],
];

function PremiumScreen({ onExit }) {
  return (
    <AppScreen pad={false}>
      <div style={{ position: 'relative', padding: '58px 22px 26px', textAlign: 'center', background: 'radial-gradient(120% 90% at 50% 0%, var(--lav-fill) 0%, var(--blush-50) 55%, var(--bg-app) 100%)' }}>
        <div style={{ position: 'absolute', top: 56, left: 22 }}>
          <IconButton onClick={onExit} icon={<Icon name="close" size={20} stroke="var(--ink-2)" />} label="Close" size={42} />
        </div>
        <div style={{ paddingTop: 18 }}>
          <RingProgress value={0.58} size={126} stroke={10} color="var(--blush-500)" track="var(--blush-100)">
            <Icon name="trophy" size={42} stroke="var(--rose-ink)" />
          </RingProgress>
        </div>
        <div style={{ marginTop: 10 }}><PremiumTag size="lg" /></div>
        <h1 style={{ margin: '12px 0 0', fontSize: 27, fontWeight: 800, letterSpacing: -0.6, color: 'var(--ink)' }}>Más precisión, menos ruido</h1>
        <p style={{ margin: '10px auto 0', maxWidth: 300, fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
          La versión gratis cubre el plan inicial. Pro añade informes y ajustes cuando ya tienes suficientes datos.
        </p>
      </div>

      <div style={{ padding: '4px 22px 30px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: '6px 0 20px' }}>
          {PREMIUM_FEATURES.map((f) => {
            const TONE_FILL = { blush: 'var(--blush-50)', lav: 'var(--lav-fill)', honey: 'var(--honey-fill)' };
            const TONE_INK = { blush: 'var(--rose-ink)', lav: 'var(--lav-ink)', honey: 'var(--honey-ink)' };
            return (
              <Card key={f.title} pad={18}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: TONE_FILL[f.tone], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={f.icon} size={24} stroke={TONE_INK[f.tone]} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>{f.title}</div>
                    <p style={{ margin: '5px 0 0', fontSize: 13.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>{f.body}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', margin: '4px 4px 12px' }}>Incluido</div>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-soft)' }}>
            <div />
            <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-2)', textAlign: 'center' }}>Free</div>
            <div style={{ textAlign: 'center' }}><PremiumTag /></div>
          </div>
          {COMPARE.map(([label, free, plus], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 64px 72px', alignItems: 'center', padding: '13px 16px', borderTop: '1px solid var(--hairline)' }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', textWrap: 'pretty' }}>{label}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{free ? <CheckMark /> : <Dash />}</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{plus ? <CheckMark tone="lav" /> : <Dash />}</div>
            </div>
          ))}
        </Card>

        <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '16px 4px 20px', fontSize: 12.5, color: 'var(--sage-ink)', fontWeight: 700 }}>
          <Icon name="info" size={16} stroke="var(--sage-ink)" />Los datos base y las medidas corporales siguen siendo gratis.
        </div>

        <PrimaryButton onClick={onExit} icon={<Icon name="sparkle" size={19} stroke="#fff" />}>Probar Pro</PrimaryButton>
        <GhostButton onClick={onExit} style={{ display: 'flex', margin: '8px auto 0' }}>Ahora no</GhostButton>
      </div>
    </AppScreen>
  );
}

function CheckMark({ tone }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', background: tone === 'lav' ? 'var(--lav-fill)' : 'var(--sage-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="check" size={14} stroke={tone === 'lav' ? 'var(--lav-ink)' : 'var(--sage-ink)'} sw={2.8} />
    </div>
  );
}
function Dash() {
  return <span style={{ width: 14, height: 3, borderRadius: 9, background: 'var(--hairline)' }} />;
}

Object.assign(window, { PremiumScreen, PremiumTag, PremiumLockRow });
