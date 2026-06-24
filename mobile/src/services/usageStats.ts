import { NativeModules, Platform, Linking } from 'react-native';
import type { DeviceUsage } from './scrollmilesEngine';
const native = NativeModules.ExpoUsageStats;
export async function hasUsagePermission(): Promise<boolean> { return Platform.OS === 'android' && native ? native.hasPermission() : false; }
export async function openUsageSettings() { if (native?.openUsageSettings) return native.openUsageSettings(); return Linking.openSettings(); }
export async function getDailyUsage(days = 1): Promise<DeviceUsage[]> {
  if (Platform.OS !== 'android' || !native) return [];
  return native.getDailyUsage(days);
}
