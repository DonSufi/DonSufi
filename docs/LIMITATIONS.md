# Known Limitations & What's Needed to Close Them

This app was built in a single sandboxed development environment with **no iOS/Android simulator, no physical device, no Apple/Google developer account, and a network egress policy that blocks most external domains** (only the npm registry and a couple of Google domains were reachable; `docs.expo.dev`, `api.alquran.cloud`, and `en.wikipedia.org`, among others, returned proxy-blocked errors during development). Per the project's own rule ("where a requirement cannot be implemented because of platform limitations, licensing, missing APIs, or unavailable credentials, clearly identify the limitation and implement the best production-safe fallback"), everything below is exactly that: a named gap, why it exists, and what closes it.

## Platform testing

- **No on-device or simulator testing was possible in this environment.** Validation here consisted of: TypeScript compiling cleanly (`npm run typecheck`), 54 passing domain-logic unit tests (`npm test`), and a headless-browser smoke test of the app exported for web (onboarding → location entry → a working Home screen with a live, correct prayer countdown; Prayer Times, Qibla, and Quran tabs all rendering without errors). That smoke test is genuinely useful — it caught and fixed two real bugs that would have affected iOS/Android identically (see `docs/ARCHITECTURE.md`) — but it is not a substitute for running on real iOS/Android hardware, and the web target is not a shipped feature of this app (react-native-web was installed only as a local testing aid).
- **Before shipping**, run `npx expo run:ios` / `npx expo run:android` (or `eas build`) on real devices and walk through: onboarding, permission prompts (location, notifications), backgrounding/reopening across a prayer time boundary, and a timezone change (e.g. via device settings or actual travel) to confirm notifications reschedule correctly.

## Notification reliability across days

- Notifications are recomputed and rescheduled whenever the app is opened or relevant settings change, covering a rolling 4-day window (kept deliberately short to stay well under iOS's 64-pending-local-notification limit even with pre/post reminders enabled on every prayer).
- **Closed (with a residual caveat)**: `src/domain/notifications/backgroundTask.ts` registers a periodic OS-level background task (`expo-background-task` + `expo-task-manager`, wired up in `AppStateProvider`) that re-runs the exact same `rescheduleAdhanNotifications` on roughly a 12-hour cadence, loading its inputs from persisted storage since a background task runs outside the React tree. Registration is idempotent, fire-and-forget, and never blocks app startup if unavailable.
- **Residual caveat, unverified in this environment**: both iOS (`BGTaskScheduler`) and Android (`WorkManager`) treat the requested interval as an inexact *minimum*, not a guarantee — actual cadence depends on battery state, OS version, and (on Android specifically) OEM battery-optimization behavior, which varies widely and is well known for being more aggressive about killing background work than stock Android. This is real platform behavior, not a bug in this code, but it means the background refresh should be treated as a reliability improvement, not an absolute guarantee — the in-app resync on every foreground remains the primary mechanism. Verify actual firing behavior on real iOS and Android hardware before relying on it, and consider surfacing a "last synced" timestamp in Settings if real-world testing shows the background task firing less often than expected.

## Mosque finder

- Needs a billable Google Places API key, which this environment cannot provision. The app never fabricates mosque data in its place — with no key configured, the Mosques screen shows an explicit "isn't configured yet" state (see `src/data/mosques/mosqueClient.ts`).
- **To close**: obtain a Google Places API key (or switch to another licensed mosque/POI dataset), add it to `app.json`'s `extra.googlePlacesApiKey` (or better, inject via EAS secrets / `app.config.js` + environment variable so it isn't committed to source control).

## Qur'an audio recitation

- Not implemented. The spec allows this "where legally licensed" — that requires a specific licensed reciter/CDN partnership this environment has no way to arrange or verify. Text and translation (via AlQuran Cloud) are implemented and cached offline; audio is the one Qur'an sub-feature left out rather than stubbed with fake playback controls.

## Du'a & Adhkar content — needs scholarly verification before shipping

- The bundled library (`src/data/duas/duaLibrary.ts`) is a small, deliberately limited set of well-known duas (not a full reproduction of a larger collection like Hisnul Muslim), each with an explicit hadith/Quran citation.
- Every entry carries `verified: false` (the UI surfaces this as "pending scholarly review"). This is intentional: this content was authored with AI assistance during this build and, per the project's own data-integrity rule ("never generate religious content from an LLM at runtime... religious content should require verification before publication"), must be checked word-for-word (including Arabic diacritics) against a certified reference by a qualified reviewer before the `verified` flag is flipped to `true` and the "pending review" notice removed.
- **To close**: have a qualified reviewer check each entry against a published, vetted source (e.g. a certified Hisnul Muslim edition, or Sunnah.com's canonical hadith text), correct anything needed, and flip `verified: true`.

## Localization

- **English and Arabic are complete** (all UI strings, correct RTL for Arabic).
- **Nine more languages are scaffolded** (French, Urdu, Turkish, Indonesian, Malay, Spanish, Italian, German, Bengali) with core navigation/common strings translated and everything else falling back to English via i18next. These were translated without a professional linguist review and should be checked by a native speaker before being presented as "complete" in an app store listing.
- RTL layout mirroring (`I18nManager.forceRTL`) requires an app restart to fully apply on native platforms, which the Language settings screen explicitly tells the user.

## Testing coverage

- Domain/business logic (prayer calculation, Hijri calendar, Qibla, notification planning, tracker stats, Ramadan) has real unit tests with 54 passing assertions, run against a Node test environment.
- **Gap**: no React Native Testing Library component tests. The `jest-expo` preset for this Expo SDK version depends on `@react-native/jest-preset`, and in this environment that combination hit a resolver error (`Could not locate module react-native/setup-env`) that looked like a version-skew issue in a very new/bleeding-edge SDK (57) rather than anything in this app's code. Domain logic — the highest-risk, most safety-critical code — is fully covered; UI components were instead validated via the manual headless-browser smoke test described in `docs/ARCHITECTURE.md`.
- **To close**: on a machine with normal internet access, `npm ls @react-native/jest-preset` and align versions (or move to a slightly older/newer Expo SDK patch release) so `jest --selectProjects app` runs, then add component tests for the interactive screens (onboarding, settings toggles, prayer tracker).

## Linting

- `eslint-config-expo/flat` (the officially recommended config for this SDK) could not be used as-is: its `react/display-name` rule, via `eslint-plugin-react@7.37.5`, throws `contextOrFilename.getFilename is not a function` under this project's ESLint version — an upstream compatibility gap between `eslint-plugin-react` and ESLint's newer flat-config rule context, reproducible and not fixable from application code. `eslint.config.js` instead uses a minimal hand-built config (`typescript-eslint` recommended rules + `eslint-plugin-react-hooks`) that catches real bugs (and did, during this build — see the `useMemo`/ref/effect fixes in the commit history) without the broken rule. `npm run lint` passes cleanly. Swap back to `eslint-config-expo/flat` once `eslint-plugin-react` ships a fix for this.

## Dependency audit

- `npm audit` reports 11 moderate-severity findings, all tracing back to a single advisory (a bounds-check issue in the `uuid` package, GHSA-w5hq-g745-h8pq) pulled in transitively through Expo's own build-time tooling (`@expo/config-plugins` and friends) — not through any runtime code shipped to end users. Re-run `npm audit` after a normal `npm install` on a machine with full registry access and apply `npm audit fix` (non-breaking) periodically; a version bump on Expo's side will eventually resolve the transitive `uuid` version.

## Branding assets

- App icon, splash screen, and adaptive-icon foreground/background images are still the default Expo template placeholders (`assets/icon.png`, etc.). These need real DonSufi brand artwork before an app store submission — this is a design asset gap, not a code gap.

## App store readiness

- No EAS project is configured, no Apple Developer / Google Play Console credentials exist in this environment, and no build has been submitted anywhere. `app.json` has placeholder bundle identifiers (`com.donsufi.app`) that should be confirmed as available/owned before a real submission.

## Out of scope by design (not gaps)

- **Monetization**: the spec makes this conditional ("if monetization is required"); no payment/subscription code was added since it wasn't requested and would need real payment-processor credentials and legal review (subscription terms, refund policy) that don't belong in a first build.
- **Remote content-management backend**: du'a, calendar, and translation content ship as static, versioned JSON in the app bundle rather than a remote CMS. For a single-developer build this is the right call (no server to run, secure, and offline-safe); a future version distributing frequent content updates without app releases would need the admin/content architecture the spec describes as optional infrastructure.
- **Cloud sync**: deliberately not built — the spec requires it be explicitly opt-in if it exists at all, and local-first-only is the safer default until there's a concrete need and a security review of a sync backend.
