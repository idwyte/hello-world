package expo.modules.liveactivity

import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * Android stub. ActivityKit is iOS-only. Android equivalents (Quick Tiles,
 * MediaSession ongoing notification) are out of scope for v1.1.
 */
class LiveActivityModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HoneLiveActivityModule")

    Function("isAvailable") { -> false }

    AsyncFunction("startActivity") { _input: Map<String, Any?>, promise: Promise ->
      promise.resolve(null)
    }

    AsyncFunction("updateActivity") { _id: String, _update: Map<String, Any?>, promise: Promise ->
      promise.resolve(null)
    }

    AsyncFunction("endActivity") { _id: String, promise: Promise ->
      promise.resolve(null)
    }
  }
}
