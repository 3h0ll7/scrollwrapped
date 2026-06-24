# ScrollMiles Android Build Instructions

## Migration plan
1. Keep the existing TanStack/Lovable web app as the marketing and browser dashboard.
2. Add `mobile/`, an Expo React Native Android application that reuses the ScrollMiles brand, dashboard language, Supabase tables, badge model, and transparent estimated-vs-verified metric labeling.
3. Use a custom Expo native module for Android `UsageStatsManager`; this requires a development build/prebuild and cannot run in Expo Go.
4. Sync verified Android analytics into the existing `daily_metrics` and `app_metrics` tables with `source = android`.
5. Use Supabase Auth with Google ID tokens and persisted mobile sessions.

## Prerequisites
- Node 20+
- Android Studio with Android SDK 35
- JDK 17
- EAS CLI: `npm i -g eas-cli`
- Supabase URL and publishable key
- Google OAuth Web and Android client IDs

## Install
```bash
cd mobile
npm install
cp .env.example .env
```
Fill `.env` with non-secret public mobile values. Do not commit `.env`.

## Local Android project generation
```bash
cd mobile
npx expo prebuild --platform android
```

## Debug APK
```bash
cd mobile
npm run android
# or
npx eas build --platform android --profile development --local
```

## Release APK
```bash
cd mobile
npx eas build --platform android --profile preview --local
```

## Release AAB
```bash
cd mobile
npx eas build --platform android --profile production --local
```

Generated artifacts are written by EAS local build under the mobile build output path printed by EAS.
