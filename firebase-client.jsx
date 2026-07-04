const MimumBackend = (() => {
  const CONFIG = window.MIMUM_FIREBASE_CONFIG || {};
  const REQUIRED_CONFIG = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const configured = REQUIRED_CONFIG.every((key) => Boolean(CONFIG[key]));
  const hasFirebase = typeof firebase !== 'undefined' && configured && CONFIG.enabled === true;

  const local = {
    userKey: 'optimalPhysique.localUser',
    profileKey: (uid) => `optimalPhysique.profile.${uid}`,
    readingsKey: (uid) => `optimalPhysique.entries.${uid}`,
    listeners: new Set(),
    readingListeners: new Map(),
    profileListeners: new Map(),
  };

  const readJSON = (key, fallback) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  };

  const writeJSON = (key, value) => {
    window.localStorage.setItem(key, JSON.stringify(value));
  };

  const nowStamp = () => {
    const now = new Date();
    return {
      takenAt: now.toISOString(),
      timestampMs: now.getTime(),
      registeredAtIso: now.toISOString(),
      registeredAtMs: now.getTime(),
    };
  };

  const normalizeAuthUser = (user) => {
    if (!user) return null;
    return {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || user.name || 'Alex',
      isAnonymous: Boolean(user.isAnonymous),
    };
  };

  const normalizeReading = (reading = {}) => {
    if (reading.eventType === 'body_measurement_check_in' || reading.bodyMeasures) {
      const stamp = nowStamp();
      const body = reading.bodyMeasures || reading;
      return {
        weight: Number(body.weight),
        waist: Number(body.waist),
        shoulders: Number(body.shoulders),
        chest: Number(body.chest),
        hips: Number(body.hips),
        neck: Number(body.neck),
        leftArm: Number(body.leftArm),
        rightArm: Number(body.rightArm),
        leftThigh: Number(body.leftThigh),
        rightThigh: Number(body.rightThigh),
        calf: Number(body.calf),
        bodyMeasures: body,
        calories: Number(reading.calories ?? 2100),
        protein: Number(reading.protein ?? 162),
        steps: Number(reading.steps ?? 9400),
        deficit: Number(reading.deficit ?? 450),
        tier: Number(body.waist) <= 77 ? 'steady' : 'attention',
        source: 'manual',
        manual: true,
        takenAtLabel: reading.takenAtLabel || 'today',
        eventType: 'body_measurement_check_in',
        ...stamp,
      };
    }

    const hasPhysiqueFields = ['weight', 'waist', 'calories', 'protein', 'steps'].some((key) => reading[key] != null);
    if (hasPhysiqueFields) {
      const weight = Number(reading.weight);
      const waist = Number(reading.waist);
      const calories = Number(reading.calories);
      const protein = Number(reading.protein);
      const steps = Number(reading.steps);
      const deficit = Number(reading.deficit ?? 450);
      const stamp = nowStamp();
      return {
        weight,
        waist,
        calories,
        protein,
        steps,
        deficit,
        tier: deficit >= 350 && deficit <= 550 && protein >= 150 && protein <= 175 ? 'steady' : 'attention',
        source: reading.source || 'manual',
        manual: true,
        takenAtLabel: reading.takenAtLabel || 'today',
        eventType: 'physique_check_in',
        ...stamp,
      };
    }

    const systolic = Number(reading.sys ?? reading.systolic);
    const diastolic = Number(reading.dia ?? reading.diastolic);
    const pulse = Number(reading.pulse);
    const manual = Boolean(reading.manual);
    const stamp = nowStamp();
    return {
      sys: systolic,
      dia: diastolic,
      systolic,
      diastolic,
      pulse,
      tier: reading.tier || ((systolic >= 130 || diastolic >= 80) ? 'attention' : 'steady'),
      source: manual ? 'manual' : 'cuff',
      manual,
      takenAtLabel: reading.takenAtLabel || 'now',
      eventType: 'blood_pressure_reading',
      ...stamp,
    };
  };

  const localUserFromEmail = ({ email, name }) => ({
    uid: `local-${encodeURIComponent(email || name || 'guest').replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
    email: email || '',
    name: name || (email ? email.split('@')[0] : 'Alex'),
    isAnonymous: !email,
  });

  const emitAuth = () => {
    const user = readJSON(local.userKey, null);
    local.listeners.forEach((listener) => listener(user));
  };

  const emitProfile = (uid) => {
    const profile = readJSON(local.profileKey(uid), null);
    (local.profileListeners.get(uid) || new Set()).forEach((listener) => listener(profile));
  };

  const emitReadings = (uid) => {
    const readings = readJSON(local.readingsKey(uid), []);
    (local.readingListeners.get(uid) || new Set()).forEach((listener) => listener(readings));
  };

  const localBackend = {
    mode: 'local',
    configured: false,
    subscribeAuth(listener) {
      local.listeners.add(listener);
      listener(readJSON(local.userKey, null));
      return () => local.listeners.delete(listener);
    },
    async signIn({ email, name }) {
      const user = localUserFromEmail({ email, name });
      writeJSON(local.userKey, user);
      const currentProfile = readJSON(local.profileKey(user.uid), null);
      if (!currentProfile) writeJSON(local.profileKey(user.uid), { id_user: user.uid, name: user.name, email: user.email, situation: 'cutting', stage: 'cutting', onboardingComplete: true });
      emitAuth();
      emitProfile(user.uid);
      return user;
    },
    async signUp({ email, name }) {
      return localBackend.signIn({ email, name });
    },
    async signInWithGoogle() {
      return localBackend.signIn({ email: 'google.local@optimal-physique.test', name: 'Google user' });
    },
    async continueAsGuest(name) {
      return localBackend.signIn({ name: name || 'Alex' });
    },
    async signOut() {
      window.localStorage.removeItem(local.userKey);
      emitAuth();
    },
    subscribeProfile(user, listener) {
      if (!user) return () => {};
      const listeners = local.profileListeners.get(user.uid) || new Set();
      listeners.add(listener);
      local.profileListeners.set(user.uid, listeners);
      listener(readJSON(local.profileKey(user.uid), null));
      return () => listeners.delete(listener);
    },
    async saveProfile(user, profile) {
      if (!user) throw new Error('Sign in before saving profile details.');
      const key = local.profileKey(user.uid);
      const current = readJSON(key, {});
      writeJSON(key, { ...current, ...profile, id_user: user.uid, updatedAt: new Date().toISOString() });
      emitProfile(user.uid);
    },
    subscribeReadings(user, listener) {
      if (!user) return () => {};
      const listeners = local.readingListeners.get(user.uid) || new Set();
      listeners.add(listener);
      local.readingListeners.set(user.uid, listeners);
      listener(readJSON(local.readingsKey(user.uid), []));
      return () => listeners.delete(listener);
    },
    async saveReading(user, reading) {
      if (!user) throw new Error('Sign in before saving a reading.');
      const key = local.readingsKey(user.uid);
      const readings = readJSON(key, []);
      const saved = { id: `local-${Date.now()}`, id_user: user.uid, ...normalizeReading(reading) };
      writeJSON(key, [saved, ...readings].slice(0, 50));
      emitReadings(user.uid);
      return saved;
    },
  };

  if (!hasFirebase) return localBackend;

  const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(CONFIG);
  const auth = firebase.auth(app);
  const db = firebase.firestore(app);

  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(() => {});

  const fromDoc = (doc) => {
    const data = doc.data() || {};
    return {
      id: doc.id,
      ...data,
      takenAt: data.takenAt?.toDate ? data.takenAt.toDate().toISOString() : data.takenAt,
      registeredAt: data.registeredAt?.toDate ? data.registeredAt.toDate().toISOString() : data.registeredAt,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    };
  };

  const userDoc = (uid) => db.collection('users').doc(uid);
  const readingsCol = () => db.collection('readings');

  return {
    mode: 'firebase',
    configured: true,
    subscribeAuth(listener) {
      return auth.onAuthStateChanged((user) => listener(normalizeAuthUser(user)));
    },
    async signIn({ email, password }) {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      return normalizeAuthUser(cred.user);
    },
    async signUp({ email, password, name }) {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      if (name) await cred.user.updateProfile({ displayName: name });
      const user = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        name: name || cred.user.displayName || 'Alex',
        isAnonymous: Boolean(cred.user.isAnonymous),
      };
      await userDoc(user.uid).set({
        id_user: user.uid,
        name: user.name,
        email: user.email,
        situation: 'cutting',
        stage: 'cutting',
        onboardingComplete: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      return user;
    },
    async signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await auth.signInWithPopup(provider);
      const user = normalizeAuthUser(cred.user);
      const ref = userDoc(user.uid);
      const snap = await ref.get();
      const profile = {
        id_user: user.uid,
        name: user.name,
        email: user.email,
        situation: snap.exists ? snap.data()?.situation || 'cutting' : 'cutting',
        stage: snap.exists ? snap.data()?.stage || 'cutting' : 'cutting',
        provider: 'google.com',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (!snap.exists) {
        profile.onboardingComplete = true;
        profile.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      await ref.set(profile, { merge: true });
      return user;
    },
    async continueAsGuest(name) {
      const cred = await auth.signInAnonymously();
      if (name) await cred.user.updateProfile({ displayName: name });
      const user = {
        uid: cred.user.uid,
        email: '',
        name: name || cred.user.displayName || 'Alex',
        isAnonymous: true,
      };
      const ref = userDoc(user.uid);
      const snap = await ref.get();
      const profile = {
        id_user: user.uid,
        name: user.name,
        email: '',
        situation: snap.exists ? snap.data()?.situation || 'cutting' : 'cutting',
        stage: snap.exists ? snap.data()?.stage || 'cutting' : 'cutting',
        anonymous: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (!snap.exists) {
        profile.onboardingComplete = true;
        profile.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      }
      await ref.set(profile, { merge: true });
      return user;
    },
    async signOut() {
      await auth.signOut();
    },
    subscribeProfile(user, listener) {
      if (!user) return () => {};
      return userDoc(user.uid).onSnapshot((snap) => listener(snap.exists ? snap.data() : null));
    },
    async saveProfile(user, profile) {
      if (!user) throw new Error('Sign in before saving profile details.');
      await userDoc(user.uid).set({
        id_user: user.uid,
        ...profile,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    },
    subscribeReadings(user, listener) {
      if (!user) return () => {};
      return readingsCol()
        .where('id_user', '==', user.uid)
        .onSnapshot((snap) => {
          const readings = snap.docs
            .map(fromDoc)
            .sort((a, b) => (b.timestampMs || 0) - (a.timestampMs || 0))
            .slice(0, 50);
          listener(readings);
        });
    },
    async saveReading(user, reading) {
      if (!user) throw new Error('Sign in before saving a reading.');
      const normalized = normalizeReading(reading);
      const payload = {
        id_user: user.uid,
        ...normalized,
        takenAt: new Date(normalized.takenAt),
        registeredAt: new Date(normalized.registeredAtIso),
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      const doc = await readingsCol().add(payload);
      return { id: doc.id, id_user: user.uid, ...normalized };
    },
  };
})();

function useMimumBackend() {
  const backend = React.useRef(MimumBackend).current;
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState(null);
  const [profile, setProfile] = React.useState(null);
  const [profileReady, setProfileReady] = React.useState(false);
  const [readings, setReadings] = React.useState([]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    return backend.subscribeAuth((nextUser) => {
      setUser(nextUser);
      setProfileReady(!nextUser);
      setLoading(false);
    });
  }, [backend]);

  React.useEffect(() => {
    if (!user) {
      setProfile(null);
      setReadings([]);
      setProfileReady(true);
      return undefined;
    }
    setProfileReady(false);
    const stopProfile = backend.subscribeProfile(user, (nextProfile) => {
      setProfile(nextProfile);
      setProfileReady(true);
    });
    const stopReadings = backend.subscribeReadings(user, setReadings);
    return () => {
      stopProfile && stopProfile();
      stopReadings && stopReadings();
    };
  }, [backend, user && user.uid]);

  const friendlyError = (err) => {
    const message = `${err?.code || ''} ${err?.message || ''}`.toLowerCase();
    if (message.includes('configuration-not-found') || message.includes('configuration_not_found')) {
      return 'Firebase Auth is connected, but Authentication still needs to be enabled in the Firebase console.';
    }
    if (message.includes('operation-not-allowed')) {
      return 'This Firebase sign-in method is not enabled yet.';
    }
    if (message.includes('popup-closed-by-user')) {
      return 'Google sign-in was closed before it finished.';
    }
    if (message.includes('popup-blocked')) {
      return 'Your browser blocked the Google sign-in popup.';
    }
    return err?.message || 'Something went wrong. Please try again.';
  };

  const runAuth = async (operation) => {
    setBusy(true);
    setError('');
    try {
      return await operation();
    } catch (err) {
      setError(friendlyError(err));
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return {
    mode: backend.mode,
    configured: backend.configured,
    loading,
    user,
    profile,
    profileReady,
    readings,
    busy,
    error,
    signIn: (credentials) => runAuth(() => backend.signIn(credentials)),
    signUp: (credentials) => runAuth(() => backend.signUp(credentials)),
    signInWithGoogle: () => runAuth(() => backend.signInWithGoogle()),
    continueAsGuest: (name) => runAuth(() => backend.continueAsGuest(name)),
    signOut: () => runAuth(() => backend.signOut()),
    saveProfile: (details) => backend.saveProfile(user, details),
    saveReading: (reading) => backend.saveReading(user, reading),
  };
}

Object.assign(window, { MimumBackend, useMimumBackend });
