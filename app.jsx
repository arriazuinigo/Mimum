// app.jsx — Mimum app shell: navigation, scaling, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "name": "María",
  "font": "Hanken Grotesk",
  "tierStyle": "Sage & honey",
  "reading": "In range",
  "homeMascot": "calm",
  "stage": "Postpartum",
  "float": true
}/*EDITMODE-END*/;

const STAGE_KEY = { 'Planning': 'planning', 'Pregnant': 'pregnant', 'Postpartum': 'postpartum' };

const FONT_STACK = {
  'Hanken Grotesk': "'Hanken Grotesk', system-ui, sans-serif",
  'Mulish': "'Mulish', system-ui, sans-serif",
  'Nunito Sans': "'Nunito Sans', system-ui, sans-serif",
};

// tier-palette overrides applied to :root
const TIER_PALETTES = {
  'Sage & honey': {},
  'Mint & apricot': {
    '--sage-fill': 'oklch(94.5% 0.045 165)', '--sage-dot': 'oklch(74% 0.09 168)', '--sage-ink': 'oklch(48% 0.08 168)',
    '--honey-fill': 'oklch(95% 0.055 56)', '--honey-dot': 'oklch(79% 0.10 52)', '--honey-ink': 'oklch(54% 0.10 46)',
  },
  'All blush (tonal)': {
    '--sage-fill': 'oklch(95% 0.03 18)', '--sage-dot': 'oklch(76% 0.10 18)', '--sage-ink': 'oklch(52% 0.105 18)',
    '--honey-fill': 'oklch(95% 0.032 350)', '--honey-dot': 'oklch(74% 0.09 350)', '--honey-ink': 'oklch(52% 0.10 350)',
  },
};

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scale, setScale] = useState(1);
  const [screen, setScreen] = useState('home');
  const [history, setHistory] = useState(['home']);
  const [measureStart, setMeasureStart] = useState('intro');
  const stage = STAGE_KEY[t.stage] || 'postpartum';
  const setStage = (s) => setTweak('stage', s.charAt(0).toUpperCase() + s.slice(1));

  // fit phone to viewport
  useEffect(() => {
    const DW = 402, DH = 874, M = 22;
    const fit = () => setScale(Math.min((window.innerWidth - M) / DW, (window.innerHeight - M) / DH, 1.16));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // apply font + tier palette tweaks
  useEffect(() => {
    document.documentElement.style.setProperty('--font-sans', FONT_STACK[t.font] || FONT_STACK['Hanken Grotesk']);
  }, [t.font]);
  useEffect(() => {
    const base = TIER_PALETTES['Sage & honey'];
    const pal = TIER_PALETTES[t.tierStyle] || base;
    const keys = ['--sage-fill', '--sage-dot', '--sage-ink', '--honey-fill', '--honey-dot', '--honey-ink'];
    keys.forEach((k) => {
      if (pal[k]) document.documentElement.style.setProperty(k, pal[k]);
      else document.documentElement.style.removeProperty(k);
    });
  }, [t.tierStyle]);

  const nav = (to) => {
    setHistory((h) => [...h, to]);
    setScreen(to);
  };
  const exitOverlay = () => setScreen('home');
  const openMeasure = (start = 'intro') => { setMeasureStart(start); nav('measure'); };

  const user = { name: t.name || 'María', tier: 'steady' };
  const TAB_SCREENS = ['home', 'journey', 'trends', 'log'];
  const showTabs = TAB_SCREENS.includes(screen);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice>
          <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg-app)', overflow: 'hidden' }}>
            {screen === 'home' && <HomeScreen user={user} stage={stage} mascotState={t.homeMascot} onNav={nav} onMeasure={openMeasure} />}
            {screen === 'journey' && <JourneyScreen onNav={nav} />}
            {screen === 'trends' && <TrendsScreen stage={stage} onNav={nav} />}
            {screen === 'log' && <LogScreen onNav={nav} />}
            {screen === 'measure' && <BreatheScreen start={measureStart} simulate={t.reading === 'Elevated' ? 'elevated' : 'inrange'} onExit={exitOverlay} onNav={nav} onSaved={() => nav('home')} />}
            {screen === 'handoff' && <HandoffScreen onExit={() => setScreen('trends')} onNav={nav} />}
            {screen === 'onboarding' && <OnboardingScreen onExit={exitOverlay} onStageSet={setStage} onFinish={(s) => { if (s) setStage(s); nav('home'); }} />}
            {screen === 'records' && <RecordsScreen onExit={() => setScreen('profile')} onNav={nav} />}
            {screen === 'profile' && <ProfileScreen user={user} onExit={exitOverlay} onNav={nav} />}
            {screen === 'premium' && <PremiumScreen onExit={exitOverlay} />}

            {showTabs && <TabBar active={screen} onNav={nav} />}
          </div>
        </IOSDevice>
      </div>

      {/* unscaled tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="The person" />
        <TweakText label="Her name" value={t.name} onChange={(v) => setTweak('name', v)} />

        <TweakSection label="Feel" />
        <TweakSelect label="Typeface" value={t.font} options={Object.keys(FONT_STACK)} onChange={(v) => setTweak('font', v)} />
        <TweakSelect label="Risk-tier colors" value={t.tierStyle} options={Object.keys(TIER_PALETTES)} onChange={(v) => setTweak('tierStyle', v)} />
        <TweakToggle label="Mascot floats" value={t.float} onChange={(v) => setTweak('float', v)} />

        <TweakSection label="Home mascot" />
        <TweakRadio label="Mood" value={t.homeMascot} options={['calm', 'proud', 'sleepy']} onChange={(v) => setTweak('homeMascot', v)} />

        <TweakSection label="Her journey stage" />
        <TweakRadio label="Stage" value={t.stage} options={['Planning', 'Pregnant', 'Postpartum']} onChange={(v) => setTweak('stage', v)} />

        <TweakSection label="Demo the reading" />
        <TweakRadio label="Next result" value={t.reading} options={['In range', 'Elevated']} onChange={(v) => setTweak('reading', v)} />

        <TweakSection label="Explore screens" />
        <TweakButton label="Replay onboarding" onClick={() => nav('onboarding')} />
        <TweakButton label="Breathe & measure" onClick={() => openMeasure('intro')} />
        <TweakButton label="Manual BP entry" onClick={() => openMeasure('manual')} />
        <TweakButton label="Upload records" onClick={() => nav('records')} />
        <TweakButton label="Profile & settings" onClick={() => nav('profile')} />
        <TweakButton label="Mimum+ premium" onClick={() => nav('premium')} />
        <TweakButton label="GP hand-off" onClick={() => nav('handoff')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
