# Architecture

## Stack

- **Expo (SDK 57) + React Native + TypeScript**, `expo-router` for file-based navigation. Chosen as the pragmatic way to ship one codebase to iOS and Android with a mature ecosystem for the native capabilities this app needs (location, sensors, notifications).
- **No backend.** DonSufi is a local-first client. The only network calls are: (a) Qur'an text/translation from AlQuran Cloud, (b) reverse/forward geocoding via `expo-location`, (c) mosque search via Google Places (optional, requires a key). Everything else runs entirely offline.
- **State**: a single `AppStateProvider` (React Context) loads persisted settings/location on launch and exposes typed setters that write through to `AsyncStorage` and update in-memory state. No Redux/MobX — the app's state shape is small and doesn't need it.
- **Persistence**: `AsyncStorage`, wrapped by `src/storage/db.ts` into `readJSON`/`writeJSON` helpers that never throw and never hang (a `withTimeout` guard around every read — see "Lessons learned" below).

## Layering

```
app/                      expo-router screens (UI only — no business logic)
src/components/           shared UI primitives (Screen, Text, Card, Button, ListRow, StateView, LocationPicker)
src/theme/                design tokens, light/dark palettes, ThemeProvider
src/state/                AppStateProvider (the one source of truth for settings/location)
src/domain/               pure business logic, framework-agnostic where possible
  prayerTimes/            calculation engine (wraps `adhan`)
  hijri/                  Hijri calendar + key Islamic dates
  qibla/                  bearing/distance calculations
  location/                location resolution (GPS/search/manual) — the one domain module that
                           talks to a platform API (`expo-location`) directly, since "where am I"
                           has no meaningful pure-function form
  notifications/          planner (pure, tested) + scheduler (expo-notifications adapter)
  tracker/                prayer-tracking stats (streaks, completion rate)
  ramadan/                fasting-window calculations
src/data/                 content and external-API clients
  quran/                  AlQuran Cloud client + typed cache
  duas/                   curated, sourced du'a content
  mosques/                Google Places client
src/storage/               typed AsyncStorage-backed stores, one per domain area
src/i18n/                  i18next setup, locale JSON, RTL sync hook
```

The domain layer is intentionally the only place that imports `adhan`, does astronomical math, or touches Hijri-date arithmetic — UI code only ever calls domain functions. This is what makes `src/domain/**/__tests__` meaningful: the same functions the UI calls are the ones under test, not a parallel reimplementation.

## Data flow: prayer times → notifications

1. `AppStateProvider` holds `location` and `prayerSettings` (calculation method, madhab, high-latitude rule, offsets).
2. Any screen that needs today's schedule calls `computeDailyPrayerTimes` / `computeSchedule` (pure functions, deterministic, offline).
3. Whenever `location`, `prayerSettings`, or `notificationSettings` change, an effect in `AppStateProvider` calls `rescheduleAdhanNotifications`, which:
   - recomputes a rolling 4-day window from the same engine functions,
   - runs it through `planNotifications` (pure, tested) to get a capped, deterministic list of notifications with stable ids,
   - diffs that against what's currently scheduled (`diffNotificationPlans`, pure, tested) and only cancels/creates what actually changed.
4. Nothing here ever assumes a previously scheduled notification is still valid — every reschedule re-derives from scratch, so DST transitions, timezone changes, method/offset edits, and location changes all self-correct on the next app foreground or settings change.
5. Because step 4 only fires on a foreground/settings-change, `src/domain/notifications/backgroundTask.ts` registers an `expo-background-task` (~12-hour minimum interval) that calls the same `rescheduleAdhanNotifications` from persisted storage, so the rolling window keeps advancing even if the app isn't opened for a few days. The task definition lives at module scope (required by `expo-task-manager`) and is loaded as a side effect of importing it from `AppStateProvider`; registration itself is idempotent and deliberately swallows errors so an OS/device that refuses background execution never affects app startup.

## Design system

Tokens live in `src/theme/`: a warm off-white / deep-emerald palette (with midnight-blue and warm-gold accent alternatives), light and dark variants, and spacing/radius/type scales. `ThemeProvider` combines the OS color scheme, the user's theme preference, and accessibility settings (text scale, high contrast, large touch targets) into one `useTheme()` hook so every screen stays consistent without prop-drilling.

The app icon (`assets/icon.png` and its adaptive/monochrome/splash/favicon variants) carries the same identity into the one place the design system itself can't reach: an 8-pointed Islamic geometric star -- a classic, purely geometric motif with no figurative content -- in the app's emerald/gold palette, generated at each platform's exact resolution with the Android adaptive-icon foreground and monochrome variants deliberately scaled to survive circular/squircle icon masking.

## Testing strategy

- **Unit tests** (`src/domain/**/__tests__`, Jest, Node environment, no React Native runtime needed) cover: prayer-time ordering and determinism, manual offsets, Hanafi vs. Shafi Asr, the Umm al-Qura fixed-Isha-interval rule, high-latitude/polar handling (including the documented NaN behavior when polar resolution is left unresolved), a 7-day schedule generator, current/next-prayer logic across day rollovers, Hijri↔Gregorian round-tripping across thousands of dates, Hijri calendar structural invariants (29/30-day months, 11-leap-years-per-30-year-cycle), key Islamic date ordering, Qibla bearing sanity checks against known city pairs, the notification planner (master switch, per-prayer disable, pre/post reminders, the pending-notification budget, deterministic ids), prayer-tracker statistics, and DST transitions.
- **DST and timezone testing**: `npm test` runs Jest under `TZ=America/New_York` (set in `package.json`'s script, not mutated at test-run time — see the "Lessons learned" note below on why that distinction matters) rather than whatever the host machine happens to default to, specifically because the engine's day-boundary logic depends on the *local* calendar day of the `Date` it's given. `src/domain/prayerTimes/__tests__/dst.test.ts` exercises both the March spring-forward and November fall-back transitions for a real DST-observing city and skips itself (with a clear console warning, not a false pass or a confusing failure) if run under a different host timezone.
- **Integration smoke test**: during development, the app was exported for web and driven end-to-end with a headless browser (onboarding → location entry → calculation method/madhab → Home screen showing a live, correct countdown; Prayer Times, Qibla, and Quran tabs). This is documented, not a permanent part of the repo, and is not a substitute for on-device iOS/Android testing (see `docs/LIMITATIONS.md`) — but it did catch and fix two real cross-platform bugs (an async-effect hang and an onboarding-redirect loop) before they could ever reach a device.
- What's **not** covered here: component-level React Native Testing Library tests. The `jest-expo`/`@react-native/jest-preset` toolchain that ships with this Expo SDK version had a version-compatibility issue in this environment (see `docs/LIMITATIONS.md`); domain logic is fully covered, UI components are exercised via the manual smoke test above.

## Notable decisions & lessons learned this session

- **`adhan` over a bespoke calculation engine.** Astronomical prayer-time math is exactly the kind of code where "reinvent it carefully" is the wrong call — `adhan` is MIT-licensed, has a matching implementation across iOS/Android/Python, and is what a meaningful fraction of production Adhan apps already use.
- **No Quran or du'a text is hardcoded as if authoritative.** Quran text/translation is always fetched from a named, cited source and cached, never embedded in source. The bundled du'a set is intentionally small, each entry cites a specific hadith/Quran reference, and every entry carries a `verified: false` flag until a qualified reviewer checks it against a primary source — see `docs/LIMITATIONS.md`.
- **Storage reads never hang.** `readJSON` races every `AsyncStorage.getItem` against a timeout. This was not theoretical: during the smoke test, an unresolving storage call left the app stuck on a loading screen indefinitely, and the fix (timeout + `try/finally`) is now a permanent defensive pattern, not just a workaround for the web target.
- **The onboarding gate checks the current route.** An earlier version redirected to `/onboarding` unconditionally whenever onboarding wasn't complete — including while already on `/onboarding` — which meant the onboarding screen itself could never mount. The fix (`pathname !== '/onboarding'`) is a one-line change with an outsized impact: without it, first-launch users would never get past a blank loading screen on any platform.
- **"Local midnight" is not a safe stand-in for "before any prayer today."** Several notification-planner tests originally built `new Date(2026, 2, 1, 0, 0, 0)` as a "now, safely before Fajr" anchor. That's only true by accident of running under UTC or a similarly-early-offset zone — under US Eastern (UTC-5 in March), local midnight is 5am UTC, which can already be *after* London's Fajr, so the test silently depended on the host machine's timezone. Once the test suite was pinned to a real DST-observing timezone (see below) this test started failing, which is exactly the point: it surfaced a latent assumption instead of hiding it. The fix decouples "which calendar day" (still expressed as a local `Date`, since that's what the engine's day-boundary logic actually needs) from "what counts as now" (always derived from the computed schedule's own instants, e.g. `fajr.getTime() - 1h`, never assumed).
- **Mutating `process.env.TZ` mid-test-run doesn't reliably change `Date`/`Intl` behavior.** An early version of the DST tests set `process.env.TZ` in a `beforeAll` hook. That silently no-ops in this Node/V8 build once any `Date` or `Intl` object has already been constructed elsewhere in the process — the runtime resolves and caches the default timezone from the environment at first use, not on every read. Setting `TZ` before the process even starts (`package.json`'s `test` script) is the reliable form; the DST test file also guards itself with `Intl.DateTimeFormat().resolvedOptions().timeZone` and skips with a clear warning rather than running meaninglessly (or failing confusingly) if that guard isn't in place.
- **Translation content existing is not the same as translation content being used.** A manual smoke test of switching to French mid-onboarding revealed every onboarding string still rendered in English — `app/onboarding.tsx` had never called `useTranslation()` at all, despite every locale file (including a "complete" Arabic) carrying a full `onboarding` namespace. A repo-wide check found 17 screens in the same state. This was closed in two passes: first the highest-impact path (onboarding, the shared location picker, the tab bar, every native screen-header title, and the language picker), then the remaining 11 screens (Home, Qibla, Prayer Times, Ramadan, Du'a, Islamic Calendar, Prayer Tracker, Mosques, Qur'an index/reader, and all five Settings sub-screens), plus a new `prayerSettings` i18n namespace and core-screen (`common`/`home`/`qibla`) keys added to all 9 partial-language locale files so Home/Qibla/Prayer Times work in every supported language, not just English/Arabic. `src/i18n/__tests__/locales.test.ts` was expanded alongside this to check every locale for key parity, orphaned keys, empty strings, and — for partial languages — coverage of the core-screen namespaces specifically (`common`, `nav`, `more`, `home`, `prayers`, `qibla`, `prayerSettings`), which is what caught missing keys in 8 of the 9 partial locale files while this fix was in progress. The practical lesson stands regardless: a locale file passing validation proves nothing about whether a screen actually renders it; only exercising the UI (ideally per-language) catches that class of gap — which is why this fix was verified with a real headless-browser walkthrough in French, not just the test suite.
