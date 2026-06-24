export type DataLabel = 'VERIFIED DEVICE DATA';
export type UsageApp = {
  packageName: string;
  appName: string;
  minutes: number;
  opens: number;
  sessions: number;
  foregroundSessions: number;
  category: string;
};
export type DeviceUsage = {
  day: string;
  screenTimeMinutes: number;
  appOpens: number;
  sessions: number;
  foregroundSessions: number;
  apps: UsageApp[];
  verified: true;
};
export type UsageSummary = { range: 'daily' | 'weekly' | 'monthly'; days: DeviceUsage[]; verified: true };

const CM_PER_MILE = 160934.4;
const SCROLLS_PER_MINUTE_BY_CATEGORY: Record<string, number> = {
  social: 14,
  video: 7,
  browser: 11,
  messaging: 8,
  other: 6,
};
const THUMB_CM_PER_SCROLL = 3.5;
const CONTENT_MULTIPLIER_BY_CATEGORY: Record<string, number> = {
  social: 5.4,
  video: 3.2,
  browser: 4.7,
  messaging: 2.8,
  other: 3.5,
};

export function calculateVerifiedScrollMiles(usage: DeviceUsage, dpi: number, heightPx: number) {
  const physicalScreenCm = (heightPx / Math.max(dpi, 1)) * 2.54;
  const appRows = usage.apps.map((app) => {
    const category = app.category in SCROLLS_PER_MINUTE_BY_CATEGORY ? app.category : 'other';
    const scrolls = Math.round(app.minutes * SCROLLS_PER_MINUTE_BY_CATEGORY[category]);
    const thumbCm = scrolls * THUMB_CM_PER_SCROLL;
    const contentCm = scrolls * physicalScreenCm * CONTENT_MULTIPLIER_BY_CATEGORY[category];
    return { ...app, scrolls, thumbCm, contentCm };
  });
  const totalScrolls = appRows.reduce((sum, app) => sum + app.scrolls, 0);
  const thumbCm = appRows.reduce((sum, app) => sum + app.thumbCm, 0);
  const contentCm = appRows.reduce((sum, app) => sum + app.contentCm, 0);
  return {
    label: 'VERIFIED DEVICE DATA' as DataLabel,
    totalScrolls,
    thumbCm,
    contentCm,
    thumbMiles: thumbCm / CM_PER_MILE,
    contentMiles: contentCm / CM_PER_MILE,
    apps: appRows,
  };
}
