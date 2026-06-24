import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { calculateVerifiedScrollMiles, DeviceUsage } from './scrollmilesEngine';
const QUEUE_KEY = 'scrollmiles-sync-queue';
export async function queueUsage(rows: DeviceUsage[]) { await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(rows)); }
export async function syncUsage(userId: string, rows: DeviceUsage[], dpi = 420, heightPx = 2400) {
  const daily = rows.map(row => { const e = calculateVerifiedScrollMiles(row, dpi, heightPx); return { user_id: userId, day: row.day, screen_time_minutes: row.screenTimeMinutes, total_scrolls: e.totalScrolls, thumb_cm: e.thumbCm, content_cm: e.contentCm, sessions: row.sessions, app_opens: row.appOpens, source: 'android' }; });
  const apps = rows.flatMap(row => calculateVerifiedScrollMiles(row, dpi, heightPx).apps.map(app => ({ user_id: userId, day: row.day, app_id: app.packageName, minutes: app.minutes, opens: app.opens, estimated_scrolls: app.scrolls, thumb_cm: app.thumbCm, source: 'android' })));
  const { error } = await supabase.from('daily_metrics').upsert(daily, { onConflict: 'user_id,day,source' });
  if (error) { await queueUsage(rows); throw error; }
  if (apps.length) {
    const { error: appsError } = await supabase.from('app_metrics').upsert(apps, { onConflict: 'user_id,day,app_id,source' });
    if (appsError) { await queueUsage(rows); throw appsError; }
  }
  await supabase.from('profiles').update({ data_source: 'verified' }).eq('id', userId);
  await AsyncStorage.removeItem(QUEUE_KEY);
}
