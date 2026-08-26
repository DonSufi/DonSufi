# Privacy Policy

_This is the privacy policy shipped in-app (Settings → About & Privacy) and reproduced here for reference. Last updated: this project's initial build._

DonSufi is built on one rule: your worship is not a data source.

## What we collect

**Nothing is sent to us, because there is no "us" to send it to.** DonSufi has no backend server, no user accounts, and no analytics SDK. There is nothing "we" collect, because nothing leaves your device to any server we operate.

## Location

- Used only to calculate prayer times and the Qibla direction.
- You can grant GPS access, search for a city, or enter coordinates manually — GPS permission is never required to use the app.
- Your location is stored only on your device (`AsyncStorage`), never transmitted to any analytics or advertising service.
- Reverse/forward geocoding (turning coordinates into a city name, or a city name into coordinates) uses `expo-location`'s built-in platform geocoding, which may call the OS's own location service provider (Apple/Google) — the same as any map app on your phone.

## Prayer history, bookmarks, and preferences

- Prayer-tracker history, Qur'an bookmarks and last-read position, favorite mosques, and all settings are stored locally on your device only.
- There is no cloud sync in this build. If cloud sync is ever added, it will be opt-in and clearly disclosed before any data leaves your device.

## Third-party services this app talks to (only when you use the relevant feature)

- **AlQuran Cloud** (`api.alquran.cloud`) — fetches Qur'an text and translations when you open a surah. See their own terms; no personal data is sent beyond the surah/edition you requested.
- **Google Places API** — only if a Google Places API key has been configured for this build (see `docs/LIMITATIONS.md`); used to search for nearby mosques. Your coordinates are sent to Google for that single search, the same as any maps app.
- **Notifications** are scheduled entirely on-device via the OS notification system; no push-notification server is involved.

## What we never do

- We do not sell or share your data with advertisers.
- We do not run behavioral analytics or ad-tracking SDKs.
- We do not require an account to use any core feature.
- We do not shame or expose your prayer-tracking history to anyone else — it is private by default and only ever visible to you.

## Your control

- Settings → About & Privacy → **Clear all local data** removes everything DonSufi has stored on your device.
- You can revoke location and notification permissions at any time from your OS settings; the app degrades gracefully (see the in-app messaging when a permission is off) rather than breaking.
