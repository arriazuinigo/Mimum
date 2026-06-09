function AuthScreen({ mode, busy, error, onSignIn, onSignUp, onGoogle, onGuest }) {
  const [creating, setCreating] = React.useState(true);
  const [name, setName] = React.useState('María');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const canSubmit = email.trim() && password.length >= 6 && (!creating || password.length >= 6);

  const submit = () => {
    if (!canSubmit || busy) return;
    const payload = { name: name.trim() || 'María', email: email.trim(), password };
    return (creating ? onSignUp(payload) : onSignIn(payload)).catch(() => {});
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
      padding: '58px 24px 34px',
      background: 'radial-gradient(130% 90% at 50% 12%, var(--blush-100), var(--bg-app) 56%)',
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <Mascot state="calm" h={156} float />
          <h1 style={{ margin: '12px 0 0', fontSize: 30, fontWeight: 800, letterSpacing: -0.7, color: 'var(--ink)' }}>
            {creating ? 'Start with Mimum' : 'Welcome back'}
          </h1>
          <p style={{ margin: '10px auto 0', maxWidth: 300, fontSize: 15.5, lineHeight: 1.5, color: 'var(--ink-2)', fontWeight: 500, textWrap: 'pretty' }}>
            A calm place for your readings, check-ins, and follow-up notes.
          </p>
        </div>

        <Card pad={16} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {creating && (
            <AuthField label="Name" value={name} onChange={setName} autoComplete="given-name" />
          )}
          <AuthField label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" />
          <AuthField label="Password" value={password} onChange={setPassword} type="password" autoComplete={creating ? 'new-password' : 'current-password'} />

          {error && (
            <div style={{ borderRadius: 14, padding: '10px 12px', background: 'var(--honey-fill)', color: 'var(--honey-ink)', fontSize: 12.5, lineHeight: 1.35, fontWeight: 700 }}>
              {error}
            </div>
          )}

          <PrimaryButton onClick={submit} style={{ height: 52, opacity: canSubmit && !busy ? 1 : 0.48 }} icon={<Icon name="heart" size={18} stroke="#fff" />}>
            {busy ? 'One moment...' : creating ? 'Create account' : 'Sign in'}
          </PrimaryButton>
          <button onClick={() => setCreating((v) => !v)} style={{ alignSelf: 'center', padding: '8px 10px', color: 'var(--ink-2)', fontSize: 14, fontWeight: 700 }}>
            {creating ? 'I already have an account' : 'Create a new account'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-3)', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>
            <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
            <span>Or</span>
            <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
          </div>

          <button
            onClick={() => !busy && onGoogle().catch(() => {})}
            {...pressHandlers(0.98)}
            style={{
              width: '100%', height: 50, borderRadius: 'var(--r-pill)', background: 'var(--surface)',
              border: '2px solid var(--hairline)', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', gap: 10, color: 'var(--ink)', fontSize: 15.5, fontWeight: 800,
              transition: 'transform 110ms ease', opacity: busy ? 0.55 : 1,
            }}
          >
            <span style={{
              width: 22, height: 22, borderRadius: '50%', display: 'inline-flex', alignItems: 'center',
              justifyContent: 'center', background: '#fff', color: '#4285f4', fontSize: 15, fontWeight: 800,
              boxShadow: '0 0 0 1px oklch(90% 0.01 24)',
            }}>G</span>
            Continue with Google
          </button>
        </Card>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <GhostButton onClick={() => !busy && onGuest(name.trim() || 'María').catch(() => {})} icon={<Icon name="sparkle" size={16} stroke="var(--ink-3)" />}>
          Continue as guest
        </GhostButton>
        {mode === 'local' && (
          <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink-3)' }}>Demo mode</div>
        )}
      </div>
    </div>
  );
}

function AuthLoadingScreen() {
  return (
    <div style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(130% 90% at 50% 12%, var(--blush-100), var(--bg-app) 56%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <Mascot state="breathing" h={144} float />
        <div style={{ marginTop: 14, color: 'var(--ink-2)', fontWeight: 800 }}>Opening Mimum...</div>
      </div>
    </div>
  );
}

function AuthField({ label, value, onChange, type = 'text', autoComplete }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ink-2)' }}>{label}</span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', height: 48, borderRadius: 15, border: '2px solid var(--hairline)',
          background: 'var(--bg-soft)', padding: '0 14px', fontSize: 15.5, fontWeight: 700,
          color: 'var(--ink)', fontFamily: 'inherit', outline: 'none',
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--blush-400)'; e.target.style.background = 'var(--blush-50)'; }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--hairline)'; e.target.style.background = 'var(--bg-soft)'; }}
      />
    </label>
  );
}

Object.assign(window, { AuthScreen, AuthLoadingScreen });
