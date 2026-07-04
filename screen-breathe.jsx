// screen-breathe.jsx — Body measurement check-in for Optimal Physique
const IDEAL_BODY = {
  height: 166,
  weight: 71.5,
  shoulders: 122,
  chest: 104,
  waist: 77,
  hips: 92,
  neck: 38,
  arm: 36,
  thigh: 56,
  calf: 37,
};

const BODY_MEASURE_FIELDS = [
  ['weight', 'Peso', 'kg', 0.1],
  ['shoulders', 'Hombros', 'cm', 0.5],
  ['chest', 'Pecho', 'cm', 0.5],
  ['waist', 'Cintura', 'cm', 0.5],
  ['hips', 'Cadera', 'cm', 0.5],
  ['neck', 'Cuello', 'cm', 0.5],
  ['leftArm', 'Brazo izq.', 'cm', 0.5],
  ['rightArm', 'Brazo der.', 'cm', 0.5],
  ['leftThigh', 'Muslo izq.', 'cm', 0.5],
  ['rightThigh', 'Muslo der.', 'cm', 0.5],
  ['calf', 'Pantorrilla', 'cm', 0.5],
];

function BreatheScreen({ simulate = 'inrange', onExit, onSaved, onSaveReading }) {
  const plan = PhysiqueMetrics.PLAN;
  const defaults = simulate === 'elevated'
    ? { weight: 76.8, shoulders: 113, chest: 100, waist: 86, hips: 97, neck: 39, leftArm: 33.5, rightArm: 34, leftThigh: 56, rightThigh: 56, calf: 37 }
    : { weight: 76.5, shoulders: 114, chest: 101, waist: 85.4, hips: 96, neck: 38.5, leftArm: 34, rightArm: 34.5, leftThigh: 56, rightThigh: 56, calf: 37 };
  const [form, setForm] = useState(defaults);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const current = normalizeBodyForm(form);
  const waistGap = Math.max(0, current.waist - plan.targetWaist);
  const structureScore = bodyStructureScore(current);
  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (onSaveReading) {
        await onSaveReading({
          ...current,
          bodyMeasures: current,
          eventType: 'body_measurement_check_in',
        });
      }
      setSaved(true);
      setTimeout(() => onSaved && onSaved(), 700);
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el check-in.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen pad={false} style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 58, left: 22, right: 22, zIndex: 4,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <IconButton onClick={onExit} icon={<Icon name="chevronLeft" size={20} stroke="var(--ink-2)" />} label="Volver" size={42} />
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)' }}>Medidas</div>
          <div style={{ width: 42 }} />
        </div>

        <div className="fade-up" style={{
          position: 'absolute', top: 76, left: 10, right: 10, bottom: 195,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <BodySilhouetteComparison body={current} plan={plan} />
        </div>

        <div style={{
          position: 'absolute', left: 14, right: 14, top: 86, zIndex: 3,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none',
        }}>
          <ComparisonBadge tone="green" label="Perfecto" value={`${IDEAL_BODY.waist} cm cintura`} />
          <ComparisonBadge tone="red" label="Tú" value={`${current.waist.toFixed(1)} cm cintura`} />
        </div>

        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 5,
          padding: '8px 16px 18px',
          background: 'linear-gradient(180deg, oklch(98.4% 0.009 158 / 0), var(--bg-app) 18%, var(--bg-app) 100%)',
        }}>
          <Card pad={0} style={{ overflow: 'hidden', borderRadius: 22 }}>
            <div style={{ padding: '10px 14px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>Medidas corporales</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 700, marginTop: 1 }}>
                  {waistGap.toFixed(1)} cm de cintura por cerrar
                </div>
              </div>
              <Pill tone={structureScore >= 80 ? 'sage' : 'honey'}>{structureScore}% ideal</Pill>
            </div>

            <div style={{
              maxHeight: 74,
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '0 10px 7px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              {BODY_MEASURE_FIELDS.map(([key, label, unit, step]) => (
                <MeasureRow
                  key={key}
                  label={label}
                  value={form[key]}
                  unit={unit}
                  step={step}
                  ideal={idealForMeasure(key)}
                  onChange={(v) => setValue(key, v)}
                />
              ))}
              {error && (
                <div style={{ borderRadius: 14, padding: '10px 12px', background: 'var(--honey-fill)', color: 'var(--honey-ink)', fontSize: 12.5, fontWeight: 800 }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ padding: '7px 10px 11px', borderTop: '1px solid var(--hairline)' }}>
              <PrimaryButton onClick={saving || saved ? undefined : save} icon={<Icon name={saved ? 'check' : 'plus'} size={19} stroke="#fff" sw={2.4} />} style={{ height: 44, opacity: saving ? 0.65 : 1, fontSize: 15.5 }}>
                {saved ? 'Guardado' : saving ? 'Guardando...' : 'Guardar medidas'}
              </PrimaryButton>
            </div>
          </Card>
        </div>
      </div>
    </AppScreen>
  );
}

function normalizeBodyForm(form) {
  const avg = (a, b, fallback) => {
    const x = Number(a);
    const y = Number(b);
    if (Number.isFinite(x) && Number.isFinite(y)) return (x + y) / 2;
    if (Number.isFinite(x)) return x;
    if (Number.isFinite(y)) return y;
    return fallback;
  };
  return {
    weight: numberOr(form.weight, 76.5),
    shoulders: numberOr(form.shoulders, 114),
    chest: numberOr(form.chest, 101),
    waist: numberOr(form.waist, 85.4),
    hips: numberOr(form.hips, 96),
    neck: numberOr(form.neck, 38.5),
    leftArm: numberOr(form.leftArm, 34),
    rightArm: numberOr(form.rightArm, 34.5),
    arm: avg(form.leftArm, form.rightArm, 34.25),
    leftThigh: numberOr(form.leftThigh, 56),
    rightThigh: numberOr(form.rightThigh, 56),
    thigh: avg(form.leftThigh, form.rightThigh, 56),
    calf: numberOr(form.calf, 37),
  };
}

function numberOr(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function idealForMeasure(key) {
  const map = {
    weight: IDEAL_BODY.weight,
    shoulders: IDEAL_BODY.shoulders,
    chest: IDEAL_BODY.chest,
    waist: IDEAL_BODY.waist,
    hips: IDEAL_BODY.hips,
    neck: IDEAL_BODY.neck,
    leftArm: IDEAL_BODY.arm,
    rightArm: IDEAL_BODY.arm,
    leftThigh: IDEAL_BODY.thigh,
    rightThigh: IDEAL_BODY.thigh,
    calf: IDEAL_BODY.calf,
  };
  return map[key];
}

function bodyStructureScore(body) {
  const waistScore = clamp(100 - Math.abs(body.waist - IDEAL_BODY.waist) * 3.2, 0, 100);
  const shoulderScore = clamp(100 - Math.abs(body.shoulders - IDEAL_BODY.shoulders) * 1.8, 0, 100);
  const chestScore = clamp(100 - Math.abs(body.chest - IDEAL_BODY.chest) * 1.6, 0, 100);
  const hipScore = clamp(100 - Math.abs(body.hips - IDEAL_BODY.hips) * 1.5, 0, 100);
  return Math.round((waistScore * 0.42) + (shoulderScore * 0.24) + (chestScore * 0.2) + (hipScore * 0.14));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function bodyPathFor(measures) {
  return silhouettePath({
    shoulder: measureToWidth(measures.shoulders, 122, 92),
    chest: measureToWidth(measures.chest, 104, 72),
    waist: measureToWidth(measures.waist, 77, 46),
    hip: measureToWidth(measures.hips, 92, 58),
    arm: measureToWidth(measures.arm, 36, 13),
    thigh: measureToWidth(measures.thigh, 56, 22),
    calf: measureToWidth(measures.calf, 37, 12),
  });
}

function BodySilhouetteComparison({ body, plan }) {
  const waistGap = Math.max(0, body.waist - plan.targetWaist);
  const ideal = bodyPathFor(IDEAL_BODY);
  const current = bodyPathFor(body);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: 0,
      borderRadius: 34,
      background: 'linear-gradient(170deg, oklch(89% 0.045 188), oklch(58% 0.085 188))',
      border: '1px solid oklch(70% 0.055 188 / 0.55)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'var(--sh-soft)',
    }}>
      <svg viewBox="0 0 260 400" width="92%" height="100%" role="img" aria-label="Comparación de silueta corporal actual e ideal">
        <defs>
          <radialGradient id="bodyHalo" cx="50%" cy="42%" r="62%">
            <stop offset="0%" stopColor="oklch(98% 0.02 192 / 0.5)" />
            <stop offset="100%" stopColor="oklch(98% 0.02 192 / 0)" />
          </radialGradient>
          <filter id="bodyGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="oklch(97% 0.035 195 / 0.85)" />
          </filter>
        </defs>
        <rect x="0" y="0" width="260" height="400" fill="url(#bodyHalo)" />
        <path d={ideal} fill="oklch(54% 0.075 190)" stroke="oklch(99% 0.012 195)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" filter="url(#bodyGlow)" />
        <path d={current} fill="oklch(62% 0.16 30 / 0.10)" stroke="oklch(72% 0.155 30)" strokeWidth="2.2" strokeDasharray="7 5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', left: 20, bottom: 20 }}>
        <div style={{ fontSize: 39, fontWeight: 800, color: 'oklch(99% 0.01 195)', letterSpacing: -0.8, lineHeight: 0.95, textShadow: '0 1px 8px oklch(40% 0.06 190 / 0.5)' }}>{waistGap.toFixed(1)}</div>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'oklch(96% 0.02 195 / 0.85)', textTransform: 'uppercase' }}>cm a cerrar</div>
      </div>
    </div>
  );
}

function measureToWidth(value, ideal, base) {
  return clamp(base + ((value - ideal) * 1.25), base * 0.82, base * 1.42);
}

// Single connected silhouette modelled on the reference artwork: one closed
// outline traces head, trapezius, deltoid, hanging arm, hand, up the inner
// arm to the armpit, down the torso to the hip, leg, foot and up the inner
// leg to the crotch — then mirrors itself for the left side. Teardrop gaps
// open naturally between arms and waist, and a thin slit separates the legs.
// The measurements (shoulders, chest, waist, hip, arm, thigh, calf) drive the
// widths so the ideal and current bodies overlay precisely.
function silhouettePath({ shoulder, chest, waist, hip, arm, thigh, calf }) {
  const cx = 130;

  // fixed proportions
  const crownY = 28;
  const crotchY = 218;
  const headW = 17;
  const neckW = 10.5;

  // half-widths driven by the measurements
  const shoulderX = shoulder / 2;
  const chestX = chest / 2;
  const armpitX = chestX - 1;
  const waistX = waist / 2;
  const hipX = hip / 2 + 1;
  const upperW = arm * 0.32 + 3;
  const foreW = arm * 0.24 + 2.4;
  const wristW = 3.5;
  const thighW = thigh * 0.5 + 4;
  const kneeW = thigh * 0.27 + 3;
  const calfW = calf * 0.55 + 4;
  const ankleW = 4;

  // the arm hangs abducted ~35 degrees from the body; P(t, w) walks a
  // distance t down the arm centerline from the shoulder pivot and offsets
  // w along the outer normal, returning [xOffsetFromCentre, y]
  const sA = 0.574;
  const cA = 0.819;
  const cTop = shoulderX - upperW + 2;
  const P = (t, w) => [cTop + t * sA + w * cA, 118 + t * cA - w * sA];

  // the legs open ~20 degrees from a pivot near the hip joint; L(t, w)
  // works exactly like P(t, w) but along the leg centerline
  const sL = 0.342;
  const cL = 0.94;
  const legX = hipX * 0.4;
  const L = (t, w) => [legX + t * sL + w * cL, 210 + t * cL - w * sL];

  const dPeak = P(8, upperW + 1.6);
  const eOut = P(52, foreW);
  const eIn = P(52, -foreW);
  const wOut = P(97, wristW);
  const wIn = P(97, -wristW);
  const hOut = P(106, 4.5);
  const hIn = P(104, -4.3);
  const tip = P(123, 0);

  const oThigh = L(34, thighW);
  const iThigh = L(22, -thighW);
  const kOut = L(80, kneeW);
  const kIn = L(80, -kneeW);
  const cOut = L(104, calfW);
  const cIn = L(104, -calfW);
  const aOut = L(172, ankleW);
  const aIn = L(172, -ankleW);
  const A = L(172, 0);

  // right-side cubic segments [c1x, c1y, c2x, c2y, px, py]; x values are
  // offsets from the centre line, the left side is the mirrored reverse
  const segs = [
    // head
    [headW * 0.6, crownY, headW, crownY + 7, headW, 46],
    [headW, 56, 13.5, 66, 9.5, 72],
    // jaw -> neck
    [9.8, 76, 10.2, 81, neckW, 86],
    // trapezius slope
    [neckW + 8, 89, shoulderX - 15, 93, shoulderX - 4, 101],
    // deltoid cap bulging over the shoulder into the arm
    [shoulderX - 0.8, 103.4, dPeak[0] - 3.4, dPeak[1] - 4.9, dPeak[0], dPeak[1]],
    // outer upper arm -> elbow
    [dPeak[0] + 5.7, dPeak[1] + 8.2, ...P(40, foreW + 1), ...eOut],
    // outer forearm -> wrist
    [...P(64, foreW + 0.6), ...P(86, wristW + 0.8), ...wOut],
    // wrist -> palm
    [...P(100, wristW + 0.9), ...P(103, 4.6), ...hOut],
    // fingertip cap
    [...P(113, 4.4), ...P(121, 2.4), ...tip],
    [...P(121, -2.4), ...P(111, -4.4), ...hIn],
    // palm -> inner wrist
    [...P(101, -4.1), ...P(99, -3.7), ...wIn],
    // inner forearm -> inner elbow
    [...P(80, -(wristW + 1.4)), ...P(62, -(foreW + 0.2)), ...eIn],
    // inner upper arm -> armpit
    [...P(30, -(upperW + 1)), armpitX + 6, 139, armpitX, 132],
    // lat -> waist
    [armpitX - 1, 148, waistX + 1.5, 166, waistX, 182],
    // waist -> hip
    [waistX - 0.5, 193, hipX - 1.5, 197, hipX, 208],
    // hip -> outer thigh (following the opened leg)
    [hipX + 1, 216, oThigh[0] - 4.1, oThigh[1] - 11.3, ...oThigh],
    // thigh -> knee
    [...L(54, thighW - 1.2), ...L(66, kneeW + 0.8), ...kOut],
    // knee -> calf bulge
    [...L(88, kneeW + 0.6), ...L(96, calfW - 0.4), ...cOut],
    // calf -> ankle
    [...L(128, calfW - 1), ...L(158, ankleW + 0.6), ...aOut],
    // foot: over the toes, along the sole, back to the heel
    [A[0] + 6.5, 375.5, A[0] + 13.5, 380, A[0] + 18, 384.5],
    [A[0] + 20, 387.3, A[0] + 17.5, 390.2, A[0] + 12.5, 390.5],
    [A[0] + 3, 390.8, A[0] - 6.5, 390.4, A[0] - 10.5, 388.4],
    [A[0] - 12.3, 386, aIn[0] - 1.5, aIn[1] + 6, ...aIn],
    // inner ankle -> inner calf
    [...L(158, -(ankleW + 0.8)), ...L(126, -(calfW - 0.6)), ...cIn],
    // inner calf -> inner knee
    [...L(96, -(calfW - 0.4)), ...L(88, -(kneeW + 0.6)), ...kIn],
    // inner knee -> inner thigh
    [...L(62, -(kneeW + 1.2)), ...L(36, -(thighW - 0.6)), ...iThigh],
    // inner thigh -> crotch
    [3.4, 228, 1.4, 222.5, 0, crotchY],
  ];

  const r = (v) => Math.round(v * 10) / 10;
  const parts = [`M ${cx} ${crownY}`];
  for (const g of segs) {
    parts.push(`C ${r(cx + g[0])} ${r(g[1])}, ${r(cx + g[2])} ${r(g[3])}, ${r(cx + g[4])} ${r(g[5])}`);
  }
  for (let i = segs.length - 1; i >= 0; i--) {
    const g = segs[i];
    const px = i > 0 ? segs[i - 1][4] : 0;
    const py = i > 0 ? segs[i - 1][5] : crownY;
    parts.push(`C ${r(cx - g[2])} ${r(g[3])}, ${r(cx - g[0])} ${r(g[1])}, ${r(cx - px)} ${r(py)}`);
  }
  parts.push('Z');
  return parts.join(' ');
}

function ComparisonBadge({ tone, label, value }) {
  const color = tone === 'green' ? 'oklch(54% 0.13 152)' : 'oklch(56% 0.18 28)';
  return (
    <div style={{ minWidth: 112, borderRadius: 18, background: 'oklch(100% 0 0 / 0.72)', border: '1px solid oklch(90% 0.018 160 / 0.8)', padding: '10px 12px', boxShadow: 'var(--sh-soft)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, fontWeight: 800, color: 'var(--ink-3)', textTransform: 'uppercase' }}>
        <span style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
        {label}
      </div>
      <div style={{ marginTop: 3, fontSize: 13, fontWeight: 800, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

function MeasureRow({ label, value, unit, step, ideal, onChange }) {
  const round = (v) => Math.round(v * 10) / 10;
  const numeric = numberOr(value, 0);
  const delta = numeric - ideal;
  const next = (amount) => onChange(round(Math.max(0, numeric + amount)));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: 7, borderRadius: 14, background: 'var(--bg-soft)', padding: '6px 8px' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink)' }}>{label}</div>
        <div style={{ fontSize: 9.5, fontWeight: 800, color: Math.abs(delta) <= 1 ? 'var(--sage-ink)' : 'var(--ink-3)' }}>
          ideal {ideal}{unit} {Math.abs(delta) > 0.2 ? `${delta > 0 ? '+' : ''}${delta.toFixed(1)}` : 'ok'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <button onClick={() => next(-step)} {...pressHandlers(0.9)} style={measureStepBtn}>
          <Icon name="minus" size={15} stroke="var(--rose-ink)" sw={2.4} />
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode="decimal"
          style={{
            width: 52, height: 30, borderRadius: 11, border: '1px solid var(--hairline)',
            background: 'var(--surface)', textAlign: 'center', outline: 'none',
            fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', fontFamily: 'inherit',
            fontVariantNumeric: 'tabular-nums',
          }}
        />
        <button onClick={() => next(step)} {...pressHandlers(0.9)} style={measureStepBtn}>
          <Icon name="plus" size={15} stroke="var(--rose-ink)" sw={2.4} />
        </button>
      </div>
      <div style={{ width: 21, fontSize: 10.5, fontWeight: 800, color: 'var(--ink-3)', textAlign: 'right' }}>{unit}</div>
    </div>
  );
}

const measureStepBtn = {
  width: 28, height: 28, borderRadius: '50%', background: 'var(--blush-100)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s ease', flexShrink: 0,
};

Object.assign(window, { BreatheScreen });
