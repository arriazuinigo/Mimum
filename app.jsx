// app.jsx — Optimal Physique app shell: navigation, scaling, tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "name": "Alex",
  "font": "Hanken Grotesk",
  "tierStyle": "Teal & honey",
  "reading": "On plan",
  "homeMascot": "proud",
  "stage": "Cutting",
  "float": true
}/*EDITMODE-END*/;

const STAGE_KEY = { 'Cutting': 'cutting', 'Maintenance': 'maintenance', 'Muscle gain': 'gain' };

const FONT_STACK = {
  'Hanken Grotesk': "'Hanken Grotesk', system-ui, sans-serif",
  'Mulish': "'Mulish', system-ui, sans-serif",
  'Nunito Sans': "'Nunito Sans', system-ui, sans-serif",
};

// tier-palette overrides applied to :root
const TIER_PALETTES = {
  'Teal & honey': {},
  'Mint & steel': {
    '--sage-fill': 'oklch(94.5% 0.045 165)', '--sage-dot': 'oklch(74% 0.09 168)', '--sage-ink': 'oklch(48% 0.08 168)',
    '--honey-fill': 'oklch(94% 0.018 245)', '--honey-dot': 'oklch(62% 0.055 245)', '--honey-ink': 'oklch(42% 0.055 245)',
  },
  'Deep training': {
    '--sage-fill': 'oklch(93% 0.030 205)', '--sage-dot': 'oklch(62% 0.095 205)', '--sage-ink': 'oklch(38% 0.082 205)',
    '--honey-fill': 'oklch(95% 0.050 78)', '--honey-dot': 'oklch(78% 0.094 78)', '--honey-ink': 'oklch(52% 0.090 66)',
  },
};

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const backend = useMimumBackend();
  const [scale, setScale] = useState(1);
  const [screen, setScreen] = useState('home');
  const [history, setHistory] = useState(['home']);
  const [measureStart, setMeasureStart] = useState('intro');
  const stage = STAGE_KEY[t.stage] || 'cutting';
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
    const base = TIER_PALETTES['Teal & honey'];
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

  const userName = backend.profile?.name || backend.user?.name || t.name || 'Alex';
  const user = { name: userName, tier: 'steady' };
  const readings = backend.readings || [];
  const lastReading = readings[0] || null;
  const TAB_SCREENS = ['home', 'journey', 'trends', 'log'];
  const signedIn = Boolean(backend.user);
  const onboardingRequired = false;
  const activeScreen = onboardingRequired ? 'onboarding' : screen;
  const showTabs = signedIn && backend.profileReady && !onboardingRequired && TAB_SCREENS.includes(activeScreen);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <IOSDevice>
          <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg-app)', overflow: 'hidden' }}>
            {backend.loading && <AuthLoadingScreen />}
            {!backend.loading && !signedIn && (
              <AuthScreen
                mode={backend.mode}
                busy={backend.busy}
                error={backend.error}
                onSignIn={backend.signIn}
                onSignUp={backend.signUp}
                onGoogle={backend.signInWithGoogle}
                onGuest={backend.continueAsGuest}
              />
            )}
            {!backend.loading && signedIn && !backend.profileReady && <AuthLoadingScreen />}
            {!backend.loading && signedIn && backend.profileReady && (
              <>
                {activeScreen === 'home' && <HomeScreen user={user} stage={stage} mascotState={t.homeMascot} onNav={nav} onMeasure={openMeasure} lastReading={lastReading} readings={readings} />}
                {activeScreen === 'journey' && <JourneyScreen onNav={nav} readings={readings} />}
                {activeScreen === 'trends' && <TrendsScreen stage={stage} onNav={nav} readings={readings} />}
                {activeScreen === 'log' && <LogScreen onNav={nav} />}
                {activeScreen === 'measure' && <BreatheScreen start={measureStart} simulate={t.reading === 'Needs adjust' ? 'elevated' : 'inrange'} onExit={exitOverlay} onNav={nav} onSaved={() => nav('home')} onSaveReading={backend.saveReading} />}
                {activeScreen === 'handoff' && <HandoffScreen user={user} readings={readings} onExit={() => setScreen('trends')} onNav={nav} />}
                {activeScreen === 'onboarding' && <OnboardingScreen onExit={exitOverlay} onStageSet={setStage} onFinish={async (s, answers) => { const nextStage = s || stage; if (s) setStage(s); await backend.saveProfile({ name: userName, email: backend.user.email || '', situation: nextStage, stage: nextStage, onboardingAnswers: answers || {}, onboardingComplete: true }); nav('home'); }} />}
                {activeScreen === 'records' && <RecordsScreen onExit={() => setScreen('profile')} onNav={nav} />}
                {activeScreen === 'profile' && <ProfileScreen user={user} auth={{ email: backend.user.email, mode: backend.mode, onSignOut: backend.signOut }} onExit={exitOverlay} onNav={nav} />}
                {activeScreen === 'premium' && <PremiumScreen onExit={exitOverlay} />}
              </>
            )}

            {showTabs && <TabBar active={activeScreen} onNav={nav} />}
          </div>
        </IOSDevice>
      </div>

      {/* unscaled tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="The person" />
        <TweakText label="Name" value={t.name} onChange={(v) => setTweak('name', v)} />

        <TweakSection label="Feel" />
        <TweakSelect label="Typeface" value={t.font} options={Object.keys(FONT_STACK)} onChange={(v) => setTweak('font', v)} />
        <TweakSelect label="Plan colors" value={t.tierStyle} options={Object.keys(TIER_PALETTES)} onChange={(v) => setTweak('tierStyle', v)} />
        <TweakToggle label="Mascot floats" value={t.float} onChange={(v) => setTweak('float', v)} />

        <TweakSection label="Home mascot" />
        <TweakRadio label="Mood" value={t.homeMascot} options={['calm', 'proud', 'sleepy']} onChange={(v) => setTweak('homeMascot', v)} />

        <TweakSection label="Goal phase" />
        <TweakRadio label="Phase" value={t.stage} options={['Cutting', 'Maintenance', 'Muscle gain']} onChange={(v) => setTweak('stage', v)} />

        <TweakSection label="Demo the check-in" />
        <TweakRadio label="Next result" value={t.reading} options={['On plan', 'Needs adjust']} onChange={(v) => setTweak('reading', v)} />

        <TweakSection label="Explore screens" />
        <TweakButton label="Body check-in" onClick={() => openMeasure('intro')} />
        <TweakButton label="Manual metrics" onClick={() => openMeasure('manual')} />
        <TweakButton label="Profile & settings" onClick={() => nav('profile')} />
        <TweakButton label="Physique Pro" onClick={() => nav('premium')} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
