package expo.modules.focusfilter

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android stub. iOS INFocusStatusCenter has no direct Android equivalent.
 * Do Not Disturb is per-app and reading it requires Notification Listener
 * permission — out of scope for v1.1.
 */
class FocusFilterModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HoneFocusFilterModule")

    Events("FocusStatusChanged")

    Function("isAvailable") { -> false }

    AsyncFunction("requestAuthorization") { promise: Promise ->
      promise.resolve("denied")
    }

    AsyncFunction("getStatus") { promise: Promise ->
      promise.resolve(mapOf(
        "isFocus" to false,
        "authorization" to "denied"
      ))
    }

    AsyncFunction("startListening") { promise: Promise -> promise.resolve(null) }
    AsyncFunction("stopListening") { promise: Promise -> promise.resolve(null) }
  }
}
