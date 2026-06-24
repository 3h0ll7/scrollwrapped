package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

class ExpoUsageStatsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoUsageStats")
    AsyncFunction("hasPermission") { hasUsagePermission() }
    AsyncFunction("openUsageSettings") { appContext.reactContext?.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)); true }
    AsyncFunction("getDailyUsage") { days: Int -> collectDailyUsage(days.coerceIn(1, 365)) }
  }
  private fun context(): Context = appContext.reactContext ?: throw IllegalStateException("No React context")
  private fun hasUsagePermission(): Boolean {
    val ops = context().getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context().packageName)
    return mode == AppOpsManager.MODE_ALLOWED
  }
  private fun collectDailyUsage(days: Int): List<Map<String, Any>> {
    if (!hasUsagePermission()) return emptyList()
    val c = context(); val usm = c.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val pm = c.packageManager; val out = mutableListOf<Map<String, Any>>(); val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    repeat(days) { offset ->
      val cal = Calendar.getInstance(); cal.add(Calendar.DAY_OF_YEAR, -offset); cal.set(Calendar.HOUR_OF_DAY,0); cal.set(Calendar.MINUTE,0); cal.set(Calendar.SECOND,0); cal.set(Calendar.MILLISECOND,0)
      val start = cal.timeInMillis; cal.add(Calendar.DAY_OF_YEAR,1); val end = cal.timeInMillis
      val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end).filter { it.totalTimeInForeground > 0 }
      val events = usm.queryEvents(start, end); val openCounts = mutableMapOf<String, Int>(); var sessions = 0
      val ev = UsageEvents.Event(); while (events.hasNextEvent()) { events.getNextEvent(ev); if (ev.eventType == UsageEvents.Event.ACTIVITY_RESUMED || ev.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) { openCounts[ev.packageName] = (openCounts[ev.packageName] ?: 0) + 1; sessions++ } }
      val apps = stats.sortedByDescending { it.totalTimeInForeground }.take(50).map { s ->
        val label = try { pm.getApplicationLabel(pm.getApplicationInfo(s.packageName, 0)).toString() } catch (_: Exception) { s.packageName }
        mapOf("packageName" to s.packageName, "appName" to label, "minutes" to s.totalTimeInForeground / 60000.0, "opens" to (openCounts[s.packageName] ?: 0), "sessions" to (openCounts[s.packageName] ?: 0))
      }
      out += mapOf("day" to fmt.format(start), "screenTimeMinutes" to apps.sumOf { it["minutes"] as Double }, "appOpens" to openCounts.values.sum(), "sessions" to sessions, "apps" to apps, "verified" to true)
    }
    return out
  }
}
