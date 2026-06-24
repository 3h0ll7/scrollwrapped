import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { estimateScrollMiles, DeviceUsage } from './scrollmilesEngine';
const QUEUE_KEY = 'scrollmiles-sync-queue';
export async function queueUsage(rows: DeviceUsage[]) { await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(rows)); }
export async function syncUsage(userId: string, rows: DeviceUsage[], dpi = 420, heightPx = 2400) {
  const daily = rows.map(row => { const e = estimateScrollMiles(row, dpi, heightPx); return { user_id: userId, day: row.day, screen_time_minutes: row.screenTimeMinutes, total_scrolls: e.totalScrolls, thumb_cm: e.thumbCm, content_cm: e.contentCm, sessions: row.sessions, app_opens: row.appOpens, source: 'android' }; });
  const apps = rows.flatMap(row => row.apps.map(app => ({ user_id: userId, day: row.day, app_id: app.packageName, minutes: app.minutes, opens: app.opens, estimated_scrolls: Math.round(app.minutes * 10), thumb_cm: Math.round(app.minutes * 10 * 3.5), source: 'android' })));
  const { error } = await supabase.from('daily_metrics').upsert(daily, { onConflict: 'user_id,day,source' });
  if (error) { await queueUsage(rows); throw error; }
  if (apps.length) await supabase.from('app_metrics').upsert(apps, { onConflict: 'user_id,day,app_id,source' });
  await supabase.from('profiles').update({ data_source: 'verified' }).eq('id', userId);
  await AsyncStorage.removeItem(QUEUE_KEY);
}
