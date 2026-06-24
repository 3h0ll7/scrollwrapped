import { NativeModules, Platform, Linking } from 'react-native';
import type { DeviceUsage, UsageSummary } from './scrollmilesEngine';

const native = NativeModules.ExpoUsageStats;

export async function hasUsagePermission(): Promise<boolean> {
  return Platform.OS === 'android' && native ? native.hasPermission() : false;
}

export async function openUsageSettings() {
  if (native?.openUsageSettings) return native.openUsageSettings();
  return Linking.openSettings();
}

export async function getDailyUsage(days = 1): Promise<DeviceUsage[]> {
  if (Platform.OS !== 'android' || !native) return [];
  const hasPermission = await native.hasPermission();
  if (!hasPermission) return [];
  return native.getDailyUsage(days);
}

export async function getUsageSummary(range: 'daily' | 'weekly' | 'monthly'): Promise<UsageSummary> {
  if (Platform.OS !== 'android' || !native) return { range, days: [], verified: true };
  const hasPermission = await native.hasPermission();
  if (!hasPermission) return { range, days: [], verified: true };
  return native.getUsageSummary(range);
}
