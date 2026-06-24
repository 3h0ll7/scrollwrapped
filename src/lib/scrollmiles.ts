// ScrollMiles estimation engine.
// All numbers are rough but defensible estimates designed to feel real & shareable.

export interface CalcInput {
  age: number;
  yearsOwningSmartphone: number;
  dailyScreenTimeHours: number;
  socialMediaHours: number;
}

export interface CalcResult {
  totalScrolls: number;
  thumbMiles: number;
  contentMiles: number;
  lifetimeScreenHours: number;
  dailyAverageScrolls: number;
  currentStreakDays: number;
}

// ~ scrolls per minute of active social feed use (rough industry estimate).
const SCROLLS_PER_MIN = 14;
// Average thumb sweep distance per scroll (~3.5 cm).
const THUMB_CM_PER_SCROLL = 3.5;
// Average vertical content scrolled per flick (~750 px ≈ 19.8 cm on screen, but content-distance
// represents what passed in the feed: ~3 cards × ~28cm visual content per scroll).
const CONTENT_CM_PER_SCROLL = 90;

const CM_PER_MILE = 160934.4;

export function calculateScrollMiles(input: CalcInput): CalcResult {
  const years = Math.max(0.1, Math.min(input.yearsOwningSmartphone, input.age));
  const days = years * 365;
  const socialMinPerDay = Math.max(0, input.socialMediaHours) * 60;
  const dailyAverageScrolls = Math.round(socialMinPerDay * SCROLLS_PER_MIN);
  const totalScrolls = Math.round(dailyAverageScrolls * days);

  const thumbCm = totalScrolls * THUMB_CM_PER_SCROLL;
  const contentCm = totalScrolls * CONTENT_CM_PER_SCROLL;

  return {
    totalScrolls,
    thumbMiles: thumbCm / CM_PER_MILE,
    contentMiles: contentCm / CM_PER_MILE,
    lifetimeScreenHours: input.dailyScreenTimeHours * days,
    dailyAverageScrolls,
    currentStreakDays: Math.min(365, Math.round(days)),
  };
}

export const DEFAULT_INPUT: CalcInput = {
  age: 27,
  yearsOwningSmartphone: 12,
  dailyScreenTimeHours: 5.5,
  socialMediaHours: 2.8,
};

export function formatNumber(n: number, digits = 1): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(digits) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(digits) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(digits) + "K";
  return n.toFixed(0);
}

export function formatMiles(n: number): string {
  return n.toFixed(1);
}

// Generate a daily series (last `days` days) of thumb & content miles consistent
// with the user's current totals. Used by the chart.
export function generateSeries(result: CalcResult, days: number): {
  date: string;
  thumb: number;
  content: number;
}[] {
  const today = new Date();
  // base "per day" derived from totals
  const baseThumb = result.thumbMiles / Math.max(1, result.currentStreakDays);
  const baseContent = result.contentMiles / Math.max(1, result.currentStreakDays);
  const data: { date: string; thumb: number; content: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // deterministic wobble
    const seed = (d.getDate() * 13 + d.getMonth() * 7) % 100;
    const wobble = 0.7 + (seed / 100) * 0.7;
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 1.25 : 1;
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      thumb: +(baseThumb * wobble * weekend).toFixed(3),
      content: +(baseContent * wobble * weekend).toFixed(2),
    });
  }
  return data;
}

export function funInsights(r: CalcResult): string[] {
  const out: string[] = [];
  const miles = r.thumbMiles;
  const cMiles = r.contentMiles;
  if (miles > 0.5) {
    out.push(`Your thumb traveled ${miles.toFixed(1)} miles — about ${Math.round(miles * 17.6)} football fields.`);
  }
  if (cMiles > 200) {
    out.push(`You scrolled enough content to travel from New York to ${cMiles > 2800 ? "Tokyo" : cMiles > 1500 ? "Los Angeles" : cMiles > 200 ? "Miami" : "Boston"}.`);
  }
  if (r.lifetimeScreenHours > 24) {
    const days = r.lifetimeScreenHours / 24;
    out.push(`You spent ${days.toFixed(0)} full days staring at your phone.`);
  }
  if (r.totalScrolls > 100000) {
    out.push(`You've performed ${formatNumber(r.totalScrolls)} individual scrolls. That's a lot of dopamine.`);
  }
  if (miles > 5) {
    out.push(`If your scrolling was walking, you would have crossed an entire ${miles > 50 ? "country" : "city"}.`);
  }
  out.push(`Your thumb is fitter than ${Math.min(99, Math.round(miles * 4 + 20))}% of thumbs worldwide.`);
  return out;
}
