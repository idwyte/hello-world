import ExpoModulesCore
import CoreHaptics
import AVFoundation

public class StealthHapticsModule: Module {
  private let engine = StealthCoreHapticsEngine()

  public func definition() -> ModuleDefinition {
    Name("StealthHapticsModule")

    AsyncFunction("prepareEngine") { (promise: Promise) in
      do {
        try self.engine.prepare()
        promise.resolve()
      } catch {
        promise.reject("ERR_HAPTICS_PREPARE", error.localizedDescription)
      }
    }

    AsyncFunction("playPattern") { (pattern: String, intensity: Double, promise: Promise) in
      do {
        try self.engine.play(pattern: pattern, intensity: Float(intensity))
        promise.resolve()
      } catch {
        promise.reject("ERR_HAPTICS_PLAY", error.localizedDescription)
      }
    }

    AsyncFunction("schedulePattern") { (pattern: String, atMs: Double, intensity: Double, promise: Promise) in
      do {
        let handle = try self.engine.schedule(
          pattern: pattern,
          atSeconds: atMs / 1000.0,
          intensity: Float(intensity)
        )
        promise.resolve(handle)
      } catch {
        promise.reject("ERR_HAPTICS_SCHEDULE", error.localizedDescription)
      }
    }

    AsyncFunction("cancelScheduled") { (handle: String, promise: Promise) in
      self.engine.cancelScheduled(handle: handle)
      promise.resolve()
    }

    AsyncFunction("cancelAll") { (promise: Promise) in
      self.engine.cancelAll()
      promise.resolve()
    }

    AsyncFunction("currentAudioRoute") { (promise: Promise) in
      promise.resolve(StealthAudioRoute.current())
    }

    AsyncFunction("isBluetoothAudioConnected") { (promise: Promise) in
      promise.resolve(StealthAudioRoute.current() == "bluetooth")
    }
  }
}
