import React, { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { hasUsagePermission, openUsageSettings } from '../services/usageStats';

export function PermissionScreen({ onGranted }: { onGranted: () => void }) {
  const [checking, setChecking] = useState(false);

  async function checkPermission() {
    setChecking(true);
    try {
      if (await hasUsagePermission()) onGranted();
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    checkPermission();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') checkPermission(); });
    return () => sub.remove();
  }, []);

  async function openSettings() {
    await openUsageSettings();
  }

  return <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
    <Text style={{ color: colors.foreground, fontSize: 32, fontWeight: '900' }}>Usage Access required</Text>
    <Text style={{ color: colors.muted, marginTop: 16, lineHeight: 22 }}>ScrollMiles only shows VERIFIED DEVICE DATA from Android UsageStatsManager. Enable Usage Access for ScrollMiles to read real screen time, app usage duration, launches, foreground sessions, and daily/weekly/monthly usage.</Text>
    <Text style={{ color: colors.muted, marginTop: 12, lineHeight: 22 }}>No fake, demo, random, mock, or placeholder analytics will be generated while permission is missing.</Text>
    <Pressable onPress={openSettings} style={{ marginTop: 28, padding: 16, borderRadius: 16, backgroundColor: colors.purple }}><Text style={{ color: 'white', fontWeight: '800', textAlign: 'center' }}>Open Usage Access settings</Text></Pressable>
    <Pressable onPress={checkPermission} disabled={checking} style={{ marginTop: 12, padding: 16, borderRadius: 16, backgroundColor: colors.surface2 }}><Text style={{ color: colors.foreground, fontWeight: '700', textAlign: 'center' }}>{checking ? 'Checking…' : 'I enabled Usage Access'}</Text></Pressable>
  </View>;
}
