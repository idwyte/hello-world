package expo.modules.calendargaps

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android stub. Calendar gap-detection on Android requires READ_CALENDAR
 * permission and a CalendarContract query — out of scope for v1.1 per the
 * plan §"Out of scope for v1.1".
 */
class CalendarGapsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HoneCalendarGapsModule")

    Function("isAvailable") { -> false }

    AsyncFunction("requestAuthorization") { promise: Promise ->
      promise.resolve("denied")
    }

    AsyncFunction("findNextGap") { _minMinutes: Double, _withinSeconds: Double, promise: Promise ->
      promise.resolve(null)
    }
  }
}
