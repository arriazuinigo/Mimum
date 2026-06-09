# MIMO / Mimum — UK GDPR Compliance Review

**Date:** 9 June 2026  
**Applicable Law:** UK GDPR (retained EU law) + Data Protection Act 2018  
**Regulator:** ICO (Information Commissioner's Office)  
**App purpose:** Postpartum / pregnancy cardiovascular monitoring — blood pressure, medications, mental health (EPDS), medical document uploads, GP hand-off summaries  

---

## 1. Executive Summary

The app processes **special-category health data** (Article 9 UK GDPR) including blood pressure, pregnancy complications, medications, mood/EPDS screening, red-flag symptoms, and uploaded medical documents. This places it in the **highest-risk processing tier** under UK GDPR.

**The current codebase is NOT compliant with UK GDPR.** While the project documentation (`database_information.md`) describes a compliant posture, the actual implemented code contradicts nearly every claim made. The gap between what is documented and what is built is significant.

| Area | Status | Severity |
|---|---|---|
| Lawful basis & consent | ❌ Not implemented | **Critical** |
| Privacy policy / notice | ❌ Missing | **Critical** |
| Special-category data consent (Art. 9) | ❌ Not implemented | **Critical** |
| Data storage location (UK claim) | ❌ Not configured | **High** |
| Right to erasure (Art. 17) | ❌ Not implemented | **High** |
| Right to data portability (Art. 20) | ❌ Not implemented | **High** |
| Cookie / analytics consent | ❌ Not implemented | **High** |
| DPIA (Data Protection Impact Assessment) | ⚠️ Claimed but no evidence | **High** |
| Data processor agreements | ⚠️ Unknown | **High** |
| Data retention policy | ❌ Not implemented in code | **Medium** |
| Age verification | ❌ Missing | **Medium** |
| Breach notification procedures | ❌ No evidence | **Medium** |
| Data minimisation | ⚠️ Partial | **Low** |
| Encryption at rest (localStorage) | ❌ Not encrypted | **Medium** |

---

## 2. Detailed Findings

### 2.1 ❌ CRITICAL — No Consent Mechanism (Articles 6 & 7)

**What the documentation claims:**
> "We require a separate, granular consent for [EPDS] specifically — it's not bundled with general consent."

**What the code does:**
The app has **zero consent collection**. Users go directly from sign-up/login to onboarding, which immediately starts collecting sensitive health data (pregnancy complications, medications, mood/EPDS scores, red-flag symptoms). There is:

- No terms of service acceptance checkbox
- No privacy policy agreement screen
- No cookie consent banner
- No granular consent toggles for different data categories
- No record of when/how consent was given

**Affected files:**  
- `screen-auth.jsx` — sign-up flow has no consent step  
- `screen-onboarding.jsx` — collects health data without prior consent  
- `app.jsx` — routes directly from auth → onboarding → home  

### 2.2 ❌ CRITICAL — No Privacy Policy or Transparency Notice (Articles 13 & 14)

UK GDPR requires a clear, accessible privacy notice **before** processing begins, specifying:

- Identity and contact details of the data controller
- Purpose and lawful basis for each type of processing
- Categories of personal data collected
- Data retention periods
- Rights of the data subject
- Details of international transfers
- Contact for the Data Protection Officer (if appointed)

**The app contains no privacy policy, no terms of service, and no transparency notice anywhere in the UI or codebase.** The profile screen has a "Your data" row, but it is non-functional (`onClick: null`).

### 2.3 ❌ CRITICAL — Special-Category Data Without Explicit Consent (Article 9)

The app collects the following **special-category data** (health data under Article 9(1)):

| Data type | Collection point | Consent obtained? |
|---|---|---|
| Pregnancy complications (preeclampsia, gestational HTN, diabetes, preterm birth) | Onboarding | ❌ No |
| Current medications (labetalol, aspirin, metformin, insulin) | Onboarding + Log screen | ❌ No |
| Blood pressure readings (systolic, diastolic, pulse) | Breathe/measure flow | ❌ No |
| Mood / EPDS screening | Onboarding | ❌ No |
| Red-flag symptoms (headache, vision, swelling, chest pain) | Onboarding | ❌ No |
| Weight and glucose | Log screen | ❌ No |
| Medical documents (discharge summaries, lab results) | Records screen | ❌ No |

Under Article 9(2)(a), processing special-category data requires **explicit consent** — which is a higher bar than ordinary consent. This means:

- A clear, affirmative statement specifically referencing health data
- Separate from general T&C acceptance
- Granular (user can consent to some but not all)
- Withdrawable at any time with clear mechanism

### 2.4 ❌ HIGH — Firebase Data Location Not Configured for UK

**What the documentation claims:**
> "All user data is stored within the UK, in a GDPR-compliant cloud infrastructure."

**What the code does:**
The `firebase.json` contains only Firestore rules — **no region is specified**. Firebase Firestore defaults to `us-central1` (Iowa, USA) when no location is set during project creation. The Firebase project ID is `mimum-4bbcf`, but there is no evidence in the codebase that the Firestore database was created with a UK/European region (e.g., `europe-west2` for London).

If data is indeed stored in the US:
- This constitutes an **international transfer** under Chapter V UK GDPR
- Requires either an adequacy decision, Standard Contractual Clauses (SCCs), or Binding Corporate Rules
- Google Cloud does have appropriate SCCs, but you must verify your Firebase project region

### 2.5 ❌ HIGH — No Right to Erasure Implementation (Article 17)

**What the documentation claims:**
> "Deletion on request is built into our retention policy."

**What the code does:**
- `signOut()` only signs the user out — it does not delete any data
- There is no "Delete my account" or "Delete my data" function anywhere in the codebase
- Firestore data persists indefinitely after sign-out
- The profile screen's "Your data" row is non-functional

### 2.6 ❌ HIGH — No Data Portability Implementation (Article 20)

Users have the right to receive their personal data in a structured, commonly used, machine-readable format. The GP hand-off feature (`screen-handoff.jsx`) generates a visual summary but:

- It is not a full data export
- There is no JSON/CSV export of all personal data
- The "Save as PDF" button exists in the UI but has no implementation

### 2.7 ❌ HIGH — Google Analytics Without Consent

The Firebase config includes:
```js
measurementId: 'G-GHR39H3HKX'
```

This is a Google Analytics 4 measurement ID. If GA is active (even via Firebase), it sets cookies and tracks user behavior. Under UK GDPR + the Privacy and Electronic Communications Regulations (PECR):

- Analytics cookies require **prior, informed consent**
- No cookie banner or consent mechanism exists in the app
- Google Fonts are loaded from `fonts.googleapis.com` (potential tracking)

### 2.8 ⚠️ HIGH — Data Processor Agreements

Firebase (Google Cloud) acts as a **data processor** under Article 28. You must have:

- A signed Data Processing Agreement (DPA) with Google  
  *(Google offers this via Cloud console — verify it is accepted)*
- Documented sub-processors (Firebase Auth, Firestore, potentially Analytics, Cloud Storage)
- Assurance that Google's processing is limited to your instructions

### 2.9 ❌ MEDIUM — No Data Retention Policy in Code

**What the documentation claims:**
> "We only retain data as long as there's a clinical or legal justification."

**What the code does:**
- Readings are stored indefinitely (no TTL, no auto-purge)
- `subscribeReadings` loads up to 50 readings but never deletes older ones from Firestore
- User profiles persist forever
- Uploaded documents have no retention limit
- localStorage data (in local/demo mode) persists until manually cleared

### 2.10 ❌ MEDIUM — No Age Verification

Under UK GDPR, the age of digital consent is **13 years**. The app targets postpartum/pregnant women, so users are overwhelmingly adults, but:

- No age gate or verification exists
- Children could create accounts
- If users under 13 are possible, parental consent is required (Article 8)

### 2.11 ❌ MEDIUM — localStorage Health Data Not Encrypted

In local/demo mode, all health data is stored in `localStorage` as plain JSON:
```js
writeJSON(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}
```

This includes blood pressure, medications, mood scores, and pregnancy complications — all stored unencrypted in the browser. If the device is shared or compromised, this data is fully exposed.

### 2.12 ❌ MEDIUM — Guest/Anonymous Users Still Tracked

Anonymous users (via `continueAsGuest`) still have their health data written to Firestore with a Firebase-generated UID. This raises questions about:

- Processing data without any identifiable consent
- No mechanism for anonymous users to request data deletion
- Firebase anonymous auth still creates a persistent identifier

---

## 3. Remediation Guide

### Priority 1 — Critical (must fix before launch)

#### 3.1 Implement a Consent Flow

Add a consent screen **between sign-up and onboarding** with:

```
┌─────────────────────────────────┐
│  Before we begin                │
│                                 │
│  ☐ I agree to the Privacy       │
│    Policy and Terms of Service  │
│                                 │
│  ☐ I consent to Mimum           │
│    collecting my health data    │
│    (blood pressure, medications,│
│    mood check-ins) to provide   │
│    personalised monitoring.     │
│    [What data we collect →]     │
│                                 │
│  ☐ I consent to Mimum           │
│    collecting mood/wellbeing    │
│    data (EPDS screening).      │
│    This is optional.           │
│                                 │
│  [Continue]                     │
│                                 │
│  Read our Privacy Policy →      │
│  Read our Terms of Service →    │
└─────────────────────────────────┘
```

**Implementation steps:**

1. Create a `screen-consent.jsx` with granular checkboxes
2. Store consent records in Firestore under `users/{uid}`:
   ```js
   consents: {
     privacyPolicy: { version: "1.0", acceptedAt: timestamp },
     healthData: { version: "1.0", acceptedAt: timestamp },
     epdsData: { version: "1.0", acceptedAt: timestamp, accepted: true/false },
     analytics: { version: "1.0", acceptedAt: timestamp, accepted: true/false },
   }
   ```
3. Gate the onboarding flow: do not proceed until required consents are given
4. Add a "Manage consents" section in the Profile screen where users can withdraw consent
5. If consent is withdrawn, stop processing that category of data and offer deletion

#### 3.2 Create and Link a Privacy Policy

Write a privacy policy covering (at minimum):

1. **Data controller identity**: company name, registered address, contact email
2. **DPO contact** (if applicable — required if core activities involve large-scale processing of health data, which this app likely does)
3. **What data is collected**: enumerate each category (BP, meds, mood, documents, etc.)
4. **Lawful basis**: explicit consent (Article 6(1)(a)) for general data; explicit consent (Article 9(2)(a)) for health data
5. **Purpose**: personalised cardiovascular monitoring and follow-up
6. **Retention periods**: how long each data type is kept
7. **Data sharing**: GP hand-off (user-initiated), Firebase/Google as processor
8. **International transfers**: if data leaves the UK, what safeguards apply
9. **User rights**: access, rectification, erasure, portability, restriction, objection, withdraw consent
10. **Complaints**: right to lodge a complaint with the ICO
11. **Cookies/analytics**: what is used, how to opt out

Host it at a URL and link it from:
- The consent screen
- The auth screen footer
- The profile "Your data" section
- App store listing

#### 3.3 Fix Special-Category Data Consent

For each special-category data point in the onboarding flow, add a brief explanation of:
- **Why** this data is needed
- **How** it will be used
- That it is **optional** where possible (especially EPDS/mood)
- That consent can be **withdrawn** at any time

The onboarding currently has `help` text explaining purpose (good), but no actual consent capture.

### Priority 2 — High (must fix before or shortly after launch)

#### 3.4 Verify and Configure Firebase Region

```bash
# Check your Firestore region:
firebase firestore:databases:list --project mimum-4bbcf
```

If the region is not `europe-west2` (London) or another UK/EEA location:

1. **Create a new Firestore database** in `europe-west2` (Firestore region cannot be changed after creation)
2. Migrate existing data
3. Update `firebase.json`:
   ```json
   {
     "firestore": {
       "rules": "firestore.rules",
       "database": "(default)"
     }
   }
   ```
4. If using Cloud Storage for document uploads, also set the bucket region to `europe-west2`

#### 3.5 Implement Right to Erasure

Add to the Profile screen → "Your data" section:

1. **"Download my data"** — exports all user data as JSON
2. **"Delete my account and data"** — with confirmation dialog:
   - Deletes all documents in `readings` where `id_user == uid`
   - Deletes the `users/{uid}` document
   - Deletes any uploaded files in Cloud Storage
   - Deletes the Firebase Auth account
   - Clears localStorage
   - Signs the user out

Example implementation for the backend:
```js
async deleteAllUserData(user) {
  if (!user) throw new Error('Not signed in');
  // Delete readings
  const readings = await readingsCol().where('id_user', '==', user.uid).get();
  const batch = db.batch();
  readings.docs.forEach(doc => batch.delete(doc.ref));
  // Delete user profile
  batch.delete(userDoc(user.uid));
  await batch.commit();
  // Delete auth account
  await auth.currentUser.delete();
  // Clear local storage
  localStorage.clear();
}
```

#### 3.6 Implement Data Portability

Add a "Download my data" feature:
```js
async exportUserData(user) {
  const profile = await userDoc(user.uid).get();
  const readings = await readingsCol()
    .where('id_user', '==', user.uid).get();
  const data = {
    exportDate: new Date().toISOString(),
    profile: profile.data(),
    readings: readings.docs.map(d => d.data()),
  };
  // Trigger download as JSON
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mimum-data-${user.uid}.json`;
  a.click();
}
```

#### 3.7 Handle Google Analytics / Cookies

**Option A — Remove analytics entirely** (simplest):
- Remove `measurementId` from `firebase-config.js`
- Ensure Firebase Analytics SDK is not loaded

**Option B — Add cookie consent banner**:
- Implement a PECR-compliant cookie banner
- Only initialise GA after consent is given
- Store cookie preference
- Provide an opt-out mechanism

### Priority 3 — Medium (should fix before public launch)

#### 3.8 Implement Data Retention

Add a Cloud Function or scheduled task:
```js
// Purge readings older than the retention period
// e.g., 7 years for health data (NHS recommended for maternity records)
exports.purgeOldReadings = functions.pubsub
  .schedule('every 24 hours').onRun(async () => {
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 7);
    const old = await db.collection('readings')
      .where('createdAt', '<', cutoff).get();
    const batch = db.batch();
    old.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  });
```

Document the retention period in the privacy policy.

#### 3.9 Add Age Verification

Add to the sign-up flow:
```
☐ I confirm I am at least 13 years old
```

Store the confirmation with the consent record.

#### 3.10 Encrypt localStorage Data

If localStorage fallback is retained for offline/demo mode:
```js
// Use the Web Crypto API to encrypt before storing
const encrypt = async (data, key) => { /* AES-GCM encryption */ };
const decrypt = async (ciphertext, key) => { /* AES-GCM decryption */ };
```

Or better: store offline data in IndexedDB with encryption, or remove the local fallback for health data entirely.

#### 3.11 Prepare Breach Notification Procedures

Document a process for:
1. Detecting a data breach
2. Notifying the ICO within **72 hours** (Article 33)
3. Notifying affected users "without undue delay" if high risk (Article 34)
4. Recording all breaches in a breach register

#### 3.12 Conduct and Document a DPIA

The `database_information.md` claims a DPIA was conducted, but there is no evidence. Under Article 35, a DPIA is **mandatory** because:
- You process health data on a large scale
- You use new technologies (app-based automated health monitoring)
- You process data of a vulnerable group (postpartum women)

The DPIA must include:
1. Systematic description of processing operations and purposes
2. Assessment of necessity and proportionality
3. Assessment of risks to data subjects' rights
4. Measures to address those risks

---

## 4. Firestore Security Rules Review

The current rules are reasonably well-structured:

```
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

match /readings/{readingId} {
  allow create: if request.auth != null
    && request.resource.data.id_user == request.auth.uid;
  allow read, delete: if request.auth != null
    && resource.data.id_user == request.auth.uid;
  allow update: if request.auth != null
    && resource.data.id_user == request.auth.uid
    && request.resource.data.id_user == request.auth.uid;
}
```

**Good:** Users can only access their own data. The `id_user` field is validated on create and update.

**Gaps to address:**
- No rules for a `consents` subcollection or field (needed once consent is implemented)
- No rules for uploaded documents (Cloud Storage rules are not defined in this codebase)
- No admin-only collection for audit logs
- Consider adding `request.resource.data.keys()` validation to prevent users from writing arbitrary fields

---

## 5. Checklist Before UK Launch

| # | Action | Owner | Status |
|---|--------|-------|--------|
| 1 | Implement consent flow with granular health-data consent | Dev | ☐ |
| 2 | Write and publish Privacy Policy | Legal + Dev | ☐ |
| 3 | Write and publish Terms of Service | Legal | ☐ |
| 4 | Verify Firestore region is `europe-west2` (London) | DevOps | ☐ |
| 5 | Implement account + data deletion | Dev | ☐ |
| 6 | Implement data export / portability | Dev | ☐ |
| 7 | Remove or gate Google Analytics behind consent | Dev | ☐ |
| 8 | Accept Google Cloud DPA in Firebase console | Legal | ☐ |
| 9 | Conduct and document DPIA | DPO / Legal | ☐ |
| 10 | Implement data retention schedule | Dev | ☐ |
| 11 | Add age verification to sign-up | Dev | ☐ |
| 12 | Encrypt or remove localStorage health data | Dev | ☐ |
| 13 | Document breach notification procedure | DPO / Legal | ☐ |
| 14 | Appoint a DPO (if required at scale) | Management | ☐ |
| 15 | Register with ICO (fee required for data controllers) | Management | ☐ |
| 16 | Cookie/PECR compliance for any tracking | Dev + Legal | ☐ |
| 17 | Update Firestore rules for consent records | Dev | ☐ |

---

## 6. Key References

- [UK GDPR full text (legislation.gov.uk)](https://www.legislation.gov.uk/eur/2016/679/contents)
- [Data Protection Act 2018](https://www.legislation.gov.uk/ukpga/2018/12/contents)
- [ICO Guide to UK GDPR](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/)
- [ICO Special Category Data Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/)
- [ICO DPIA Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/)
- [ICO Health Data Guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/special-category-data/what-are-the-conditions-for-processing/#conditions4)
- [PECR Cookie Guidance](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
- [Firebase Data Processing Terms](https://firebase.google.com/terms/data-processing-terms)
