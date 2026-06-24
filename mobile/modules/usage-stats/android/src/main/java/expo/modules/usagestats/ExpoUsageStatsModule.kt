package expo.modules.usagestats

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
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
    AsyncFunction("getUsageSummary") { range: String ->
      val days = when (range.lowercase(Locale.US)) { "daily" -> 1; "weekly" -> 7; "monthly" -> 30; else -> 30 }
      mapOf("range" to range.lowercase(Locale.US), "days" to collectDailyUsage(days), "verified" to true)
    }
  }

  private fun context(): Context = appContext.reactContext ?: throw IllegalStateException("No React context")

  private fun hasUsagePermission(): Boolean {
    val ops = context().getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context().packageName)
    return mode == AppOpsManager.MODE_ALLOWED
  }

  private fun collectDailyUsage(days: Int): List<Map<String, Any>> {
    if (!hasUsagePermission()) return emptyList()
    val c = context()
    val usm = c.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    val out = mutableListOf<Map<String, Any>>()
    val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    repeat(days) { offset ->
      val cal = Calendar.getInstance()
      cal.add(Calendar.DAY_OF_YEAR, -offset)
      cal.set(Calendar.HOUR_OF_DAY, 0); cal.set(Calendar.MINUTE, 0); cal.set(Calendar.SECOND, 0); cal.set(Calendar.MILLISECOND, 0)
      val start = cal.timeInMillis
      cal.add(Calendar.DAY_OF_YEAR, 1)
      val end = cal.timeInMillis
      out += collectWindow(start, end, fmt.format(start), usm)
    }
    return out
  }

  private fun collectWindow(start: Long, end: Long, day: String, usm: UsageStatsManager): Map<String, Any> {
    val c = context()
    val pm = c.packageManager
    val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end).filter { it.totalTimeInForeground > 0 }
    val events = usm.queryEvents(start, end)
    val launches = mutableMapOf<String, Int>()
    val foregroundSessions = mutableMapOf<String, Int>()
    val event = UsageEvents.Event()
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      if (event.eventType == UsageEvents.Event.ACTIVITY_RESUMED || event.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND) {
        launches[event.packageName] = (launches[event.packageName] ?: 0) + 1
        foregroundSessions[event.packageName] = (foregroundSessions[event.packageName] ?: 0) + 1
      }
    }
    val apps = stats.sortedByDescending { it.totalTimeInForeground }.map { s ->
      val label = appLabel(pm, s.packageName)
      val sessionCount = foregroundSessions[s.packageName] ?: 0
      mapOf(
        "packageName" to s.packageName,
        "appName" to label,
        "minutes" to (s.totalTimeInForeground / 60000.0),
        "opens" to (launches[s.packageName] ?: 0),
        "sessions" to sessionCount,
        "foregroundSessions" to sessionCount,
        "category" to appCategory(s.packageName)
      )
    }
    return mapOf(
      "day" to day,
      "screenTimeMinutes" to apps.sumOf { it["minutes"] as Double },
      "appOpens" to launches.values.sum(),
      "sessions" to foregroundSessions.values.sum(),
      "foregroundSessions" to foregroundSessions.values.sum(),
      "apps" to apps,
      "verified" to true
    )
  }

  private fun appLabel(pm: PackageManager, packageName: String): String = try {
    @Suppress("DEPRECATION")
    val info = pm.getApplicationInfo(packageName, 0)
    pm.getApplicationLabel(info).toString()
  } catch (_: Exception) { packageName }

  private fun appCategory(packageName: String): String = when (packageName.lowercase(Locale.US)) {
    "com.instagram.android", "com.zhiliaoapp.musically", "com.twitter.android", "com.reddit.frontpage", "com.facebook.katana", "com.snapchat.android" -> "social"
    "com.google.android.youtube" -> "video"
    "com.whatsapp" -> "messaging"
    "com.android.chrome", "com.chrome.beta", "com.chrome.dev", "com.chrome.canary" -> "browser"
    else -> "other"
  }
}
