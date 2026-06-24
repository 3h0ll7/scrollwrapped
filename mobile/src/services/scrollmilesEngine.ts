export type DataLabel = 'Verified Device Data' | 'Estimated Data';
export type UsageApp = { packageName: string; appName: string; minutes: number; opens: number; sessions: number };
export type DeviceUsage = { day: string; screenTimeMinutes: number; appOpens: number; sessions: number; apps: UsageApp[]; verified: boolean };
const CM_PER_MILE = 160934.4;
const DEFAULT_SCROLLS_PER_MINUTE = 10;
const THUMB_CM_PER_SCROLL = 3.5;
const CONTENT_MULTIPLIER = 4.8;
export function estimateScrollMiles(usage: DeviceUsage, dpi: number, heightPx: number) {
  const scrolls = Math.round(usage.screenTimeMinutes * DEFAULT_SCROLLS_PER_MINUTE);
  const physicalScreenCm = (heightPx / Math.max(dpi, 1)) * 2.54;
  const thumbCm = scrolls * THUMB_CM_PER_SCROLL;
  const contentCm = scrolls * physicalScreenCm * CONTENT_MULTIPLIER;
  const label: DataLabel = usage.verified ? 'Verified Device Data' : 'Estimated Data';
  return { label, totalScrolls: scrolls, thumbCm, contentCm, thumbMiles: thumbCm / CM_PER_MILE, contentMiles: contentCm / CM_PER_MILE };
}
