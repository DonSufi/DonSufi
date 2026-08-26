# DonSufi

A premium, privacy-first Azan (Adhan) and Islamic prayer companion for iOS and Android, built with Expo (React Native) and TypeScript.

DonSufi calculates accurate prayer times offline using real astronomical formulas, schedules respectful Adhan notifications, finds the Qibla, and bundles the essentials of daily worship — Qur'an, du'a, the Islamic calendar, Ramadan mode, and a private prayer tracker — without selling data or running ads next to worship content.

## Quick start

```bash
npm install
npx expo start
```

Then press `i` for iOS Simulator, `a` for Android emulator, or scan the QR code with Expo Go on a physical device. `npm run web` also works for quick UI iteration, with the caveats in [docs/LIMITATIONS.md](docs/LIMITATIONS.md).

Useful scripts:

```bash
npm run typecheck   # TypeScript, no emit
npm test            # Jest — domain/calculation logic tests
npm run lint        # ESLint
```

## What's here

- **Prayer calculation engine** (`src/domain/prayerTimes/`) — wraps [`adhan`](https://github.com/batoulapps/adhan-js) (MIT), the same astronomical library family used by several production Adhan apps across platforms. Supports all major calculation methods, Shafi/Hanafi Asr, high-latitude rules, polar-region resolution, manual per-prayer offsets, and is fully deterministic/offline.
- **Hijri calendar** (`src/domain/hijri/`) — a from-scratch, tested implementation of the standard arithmetic (tabular/civil) Islamic calendar, with a calibration offset for local moon-sighting differences.
- **Qibla** (`src/domain/qibla/`) — great-circle bearing to the Kaaba, live compass via `expo-location`'s heading API, with a static-bearing fallback when no compass is available.
- **Notifications** (`src/domain/notifications/`) — a pure, unit-tested scheduling planner plus an `expo-notifications` adapter that recomputes and re-diffs the OS's pending notifications any time settings, location, or the calendar window moves, respecting iOS's pending-notification ceiling.
- **Quran** (`src/data/quran/`) — no Quran text is hardcoded in this app; everything is fetched from [AlQuran Cloud](https://alquran.cloud) and cached locally for offline reading.
- **Du'a & Adhkar** (`src/data/duas/`) — a small, explicitly-sourced seed library (see `verified` field) rather than a bulk, unverified reproduction of a larger collection.
- **Mosque finder** (`src/data/mosques/`) — Google Places integration; shows a clear "not configured" state rather than fabricated results when no API key is present.
- **State/storage** (`src/state/`, `src/storage/`) — everything is local-first via AsyncStorage; there is no backend and no account system.
- **UI** (`app/`, `src/components/`, `src/theme/`) — `expo-router` file-based navigation, a small design system (emerald/midnight-blue/gold accents, light/dark), and RTL-aware layouts.
- **i18n** (`src/i18n/`) — `i18next`; English and Arabic are fully translated, nine more languages are scaffolded (see `docs/LIMITATIONS.md`).

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design, data flow, and key technical decisions.
- [`docs/PRIVACY.md`](docs/PRIVACY.md) — the privacy policy shipped in-app.
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — everything that's a real, explicit gap (credentials this environment doesn't have, content that needs scholarly review, platforms not testable here) rather than a silently faked feature.
- [`docs/AUDIT.md`](docs/AUDIT.md) — a section-by-section self-audit against the original product spec.
