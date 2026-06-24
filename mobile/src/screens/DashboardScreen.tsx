import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, Dimensions } from 'react-native';
import { supabase } from '../services/supabase';
import { colors } from '../theme/colors';
import { getDailyUsage, getUsageSummary, hasUsagePermission } from '../services/usageStats';
import { syncUsage } from '../services/sync';
import { calculateVerifiedScrollMiles, DeviceUsage, UsageSummary } from '../services/scrollmilesEngine';

export function DashboardScreen({ navigation }: any) {
  const [rows, setRows] = useState<DeviceUsage[]>([]);
  const [weekly, setWeekly] = useState<UsageSummary | null>(null);
  const [monthly, setMonthly] = useState<UsageSummary | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setBusy(true);
    try {
      if (!(await hasUsagePermission())) { navigation.replace('Permission'); return; }
      const [dailyRows, weeklySummary, monthlySummary] = await Promise.all([getDailyUsage(30), getUsageSummary('weekly'), getUsageSummary('monthly')]);
      setRows(dailyRows);
      setWeekly(weeklySummary);
      setMonthly(monthlySummary);
      const user = (await supabase.auth.getUser()).data.user;
      if (user && dailyRows.length) await syncUsage(user.id, dailyRows, Dimensions.get('screen').scale * 160, Dimensions.get('screen').height * Dimensions.get('screen').scale);
    } catch (e: any) {
      Alert.alert('Sync issue', e.message);
    } finally {
      setBusy(false);
    }
  }

  const today = rows[0];
  const e = today ? calculateVerifiedScrollMiles(today, Dimensions.get('screen').scale * 160, Dimensions.get('screen').height * Dimensions.get('screen').scale) : null;
  const weekMinutes = weekly?.days.reduce((sum, row) => sum + row.screenTimeMinutes, 0) ?? 0;
  const monthMinutes = monthly?.days.reduce((sum, row) => sum + row.screenTimeMinutes, 0) ?? 0;

  return <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 22 }}>
    <Text style={{ color: colors.foreground, fontSize: 34, fontWeight: '800' }}>Dashboard</Text>
    <Text style={{ color: colors.blue, marginTop: 6, fontWeight: '900' }}>VERIFIED DEVICE DATA • Android UsageStatsManager</Text>
    <View style={{ marginTop: 24, padding: 22, borderRadius: 28, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.muted }}>Real thumb miles today</Text>
      <Text style={{ color: colors.foreground, fontSize: 48, fontWeight: '900' }}>{(e?.thumbMiles ?? 0).toFixed(2)}</Text>
      <Text style={{ color: colors.muted }}>Content miles {(e?.contentMiles ?? 0).toFixed(1)} • Screen time {today?.screenTimeMinutes.toFixed(0) ?? 0} min</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>App launches {today?.appOpens ?? 0} • Foreground sessions {today?.foregroundSessions ?? 0}</Text>
    </View>
    <View style={{ marginTop: 18, padding: 18, borderRadius: 22, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>Daily / weekly / monthly usage</Text>
      <Text style={{ color: colors.muted, marginTop: 10 }}>Today: {today?.screenTimeMinutes.toFixed(0) ?? 0} min</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>Last 7 days: {weekMinutes.toFixed(0)} min</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>Last 30 days: {monthMinutes.toFixed(0)} min</Text>
    </View>
    <View style={{ marginTop: 18, padding: 18, borderRadius: 22, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.foreground, fontWeight: '700', fontSize: 18 }}>Most used apps</Text>
      {(today?.apps ?? []).slice(0, 12).map(app => <Text key={app.packageName} style={{ color: colors.muted, marginTop: 10 }}>{app.appName}: {app.minutes.toFixed(0)} min • {app.opens} launches • {app.foregroundSessions} sessions</Text>)}
    </View>
    <Pressable onPress={refresh} disabled={busy} style={{ marginTop: 18, padding: 16, borderRadius: 16, backgroundColor: colors.purple }}><Text style={{ color: 'white', fontWeight: '700', textAlign: 'center' }}>{busy ? 'Syncing…' : 'Sync VERIFIED DEVICE DATA'}</Text></Pressable>
    <Pressable onPress={() => navigation.navigate('Privacy')} style={{ marginTop: 12, padding: 16 }}><Text style={{ color: colors.blue, textAlign: 'center' }}>Privacy controls</Text></Pressable>
  </ScrollView>;
}
