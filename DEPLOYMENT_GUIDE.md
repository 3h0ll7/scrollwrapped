# Deployment Guide

## Pre-release checklist
- Run `npm run lint` in the web root.
- Run `cd mobile && npm run typecheck`.
- Run `cd mobile && npx expo prebuild --platform android --clean`.
- Build preview APK and test Google login on a physical Android device.
- Enable Usage Access and verify `daily_metrics.source = android` rows are uploaded.
- Confirm `.env` files, keystores, OAuth secrets, and Supabase service-role keys are not committed.

## Store release
1. Replace placeholder icons in `mobile/assets` with production PNG app, splash, and adaptive-icon assets.
2. Configure `mobile/app.json` `extra.eas.projectId`.
3. Configure release keystore in EAS.
4. Build AAB: `cd mobile && npx eas build --platform android --profile production`.
5. Upload AAB to Google Play Console internal testing.
6. Complete Data Safety disclosures for UsageStats-derived analytics.

## Known production risks
- UsageStats requires explicit user settings approval and may vary by OEM.
- Exact scroll gestures inside third-party apps are not available to normal Android apps; ScrollMiles transparently estimates scroll/content distance from verified usage data.
- Full account deletion of the Supabase Auth user should be implemented as an Edge Function using service-role credentials, not from the client.
