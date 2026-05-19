import CoreHaptics
import Foundation

/// Wraps a long-lived `CHHapticEngine` and exposes pattern-by-name playback +
/// time-anchored scheduling. Patterns are tuned for the SQZ Stealth Mode
/// experience — see `lib/haptics/patterns.ts` for the user-facing mapping.
final class StealthCoreHapticsEngine {
  private var engine: CHHapticEngine?
  private var scheduledPlayers: [String: CHHapticPatternPlayer] = [:]
  private let queue = DispatchQueue(label: "com.sqzclone.stealthhaptics", qos: .userInitiated)

  enum HapticsError: Error {
    case unsupported
    case unknownPattern(String)
  }

  func prepare() throws {
    guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
      throw HapticsError.unsupported
    }
    if engine != nil { return }
    let e = try CHHapticEngine()
    e.isAutoShutdownEnabled = false
    // Restart engine if iOS resets it (e.g., after a phone call interruption)
    e.resetHandler = { [weak self] in
      try? self?.engine?.start()
    }
    e.stoppedHandler = { reason in
      NSLog("Stealth Core Haptics engine stopped: \(reason)")
    }
    try e.start()
    self.engine = e
  }

  func play(pattern name: String, intensity: Float) throws {
    try ensureEngine()
    let pattern = try buildPattern(name: name, intensity: intensity)
    let player = try engine!.makePlayer(with: pattern)
    try player.start(atTime: CHHapticTimeImmediate)
  }

  func schedule(pattern name: String, atSeconds: Double, intensity: Float) throws -> String {
    try ensureEngine()
    let pattern = try buildPattern(name: name, intensity: intensity)
    let player = try engine!.makePlayer(with: pattern)
    let handle = UUID().uuidString
    // Register the entry BEFORE starting playback so cancel() can find it
    // even if start() is racing with cancelScheduled().
    queue.sync { scheduledPlayers[handle] = player }
    try player.start(atTime: atSeconds)
    // Auto-evict from the dictionary after the pattern's nominal duration so
    // a long session doesn't accumulate handles. Conservative 30s ceiling.
    let evictAfter = max(0, atSeconds) + 30.0
    DispatchQueue.global(qos: .utility).asyncAfter(deadline: .now() + evictAfter) { [weak self] in
      self?.queue.sync { self?.scheduledPlayers.removeValue(forKey: handle) }
    }
    return handle
  }

  func cancelScheduled(handle: String) {
    queue.sync {
      if let p = scheduledPlayers.removeValue(forKey: handle) {
        try? p.stop(atTime: CHHapticTimeImmediate)
      }
    }
  }

  func cancelAll() {
    queue.sync {
      for (_, p) in scheduledPlayers {
        try? p.stop(atTime: CHHapticTimeImmediate)
      }
      scheduledPlayers.removeAll()
    }
  }

  // MARK: - patterns

  private func ensureEngine() throws {
    if engine == nil { try prepare() }
  }

  private func buildPattern(name: String, intensity i: Float) throws -> CHHapticPattern {
    let clamped = max(0.0, min(1.0, i))
    switch name {
    case "squeezeStart":
      // Sharp transient + 200 ms continuous ramp-up.
      let transient = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped),
          .init(parameterID: .hapticSharpness, value: 0.9),
        ],
        relativeTime: 0
      )
      let continuous = CHHapticEvent(
        eventType: .hapticContinuous,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped * 0.8),
          .init(parameterID: .hapticSharpness, value: 0.3),
        ],
        relativeTime: 0.02,
        duration: 0.2
      )
      let intensityCurve = CHHapticParameterCurve(
        parameterID: .hapticIntensityControl,
        controlPoints: [
          .init(relativeTime: 0, value: 0.0),
          .init(relativeTime: 0.2, value: clamped * 0.8),
        ],
        relativeTime: 0.02
      )
      return try CHHapticPattern(events: [transient, continuous], parameterCurves: [intensityCurve])

    case "hold":
      // Subtle low-intensity tap at the midpoint as reassurance.
      let tap = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped * 0.25),
          .init(parameterID: .hapticSharpness, value: 0.1),
        ],
        relativeTime: 0
      )
      return try CHHapticPattern(events: [tap], parameterCurves: [])

    case "release":
      // 300 ms continuous ramp-down.
      let continuous = CHHapticEvent(
        eventType: .hapticContinuous,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped * 0.8),
          .init(parameterID: .hapticSharpness, value: 0.2),
        ],
        relativeTime: 0,
        duration: 0.3
      )
      let curve = CHHapticParameterCurve(
        parameterID: .hapticIntensityControl,
        controlPoints: [
          .init(relativeTime: 0, value: clamped * 0.8),
          .init(relativeTime: 0.3, value: 0.0),
        ],
        relativeTime: 0
      )
      return try CHHapticPattern(events: [continuous], parameterCurves: [curve])

    case "rest":
      // Silence is information. Empty pattern is valid CoreHaptics.
      return try CHHapticPattern(events: [], parameterCurves: [])

    case "sessionStart":
      let one = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped),
          .init(parameterID: .hapticSharpness, value: 0.5),
        ],
        relativeTime: 0
      )
      let two = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped),
          .init(parameterID: .hapticSharpness, value: 0.5),
        ],
        relativeTime: 0.15
      )
      return try CHHapticPattern(events: [one, two], parameterCurves: [])

    case "sessionEnd":
      let one = CHHapticEvent(
        eventType: .hapticTransient,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped),
          .init(parameterID: .hapticSharpness, value: 0.3),
        ],
        relativeTime: 0
      )
      let two = CHHapticEvent(
        eventType: .hapticContinuous,
        parameters: [
          .init(parameterID: .hapticIntensity, value: clamped * 0.7),
          .init(parameterID: .hapticSharpness, value: 0.2),
        ],
        relativeTime: 0.1,
        duration: 0.4
      )
      let curve = CHHapticParameterCurve(
        parameterID: .hapticIntensityControl,
        controlPoints: [
          .init(relativeTime: 0, value: clamped * 0.7),
          .init(relativeTime: 0.4, value: 0.0),
        ],
        relativeTime: 0.1
      )
      return try CHHapticPattern(events: [one, two], parameterCurves: [curve])

    case "reconnect":
      // tap-tap-tap to signal "we paused, we're back"
      let evs = (0..<3).map { i in
        CHHapticEvent(
          eventType: .hapticTransient,
          parameters: [
            .init(parameterID: .hapticIntensity, value: clamped * 0.6),
            .init(parameterID: .hapticSharpness, value: 0.4),
          ],
          relativeTime: Double(i) * 0.12
        )
      }
      return try CHHapticPattern(events: evs, parameterCurves: [])

    default:
      throw HapticsError.unknownPattern(name)
    }
  }
}
