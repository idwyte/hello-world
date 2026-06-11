package expo.modules.appintents

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android stub. iOS AppIntents have no direct Android equivalent in v1.1 —
 * a future iteration could front Quick Settings tiles or App Actions, but
 * for now we expose a no-op surface so the JS layer never has to branch
 * on `Platform.OS`.
 */
class AppIntentsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HoneAppIntentsModule")

    Function("isAvailable") { -> false }

    AsyncFunction("registerIntents") { promise: Promise ->
      promise.resolve(mapOf(
        "available" to false,
        "registered" to emptyList<String>()
      ))
    }
  }
}
