# Android Setup

## Supabase
The Android app uses the existing Supabase schema: `profiles`, `daily_metrics`, `app_metrics`, `badges`, and `insights`.

Required environment variables in `mobile/.env`:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Google Sign-In
1. Create an Android OAuth client in Google Cloud.
2. Package name: `com.scrollmiles.app`.
3. Add the SHA-1 fingerprint for each debug/release keystore.
4. Add the Web client ID to Supabase Auth Google provider configuration.
5. Put the Web client ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.

## Usage Access permission
Android does not show `PACKAGE_USAGE_STATS` in a normal runtime permission prompt. The app opens Usage Access settings. Users must manually enable ScrollMiles.

The native module collects:
- foreground time per package,
- app open/session events,
- daily totals,
- top apps.

Scroll distance and thumb distance remain estimates derived from verified device screen-time inputs.

## Push notifications
`expo-notifications` is installed and configured. Production rollout still needs an EAS project ID and notification scheduling policy for daily/weekly/monthly insight reminders.
