import Foundation

#if canImport(ActivityKit)
import ActivityKit

/// Shared attributes between the host app (which starts/updates/ends
/// activities) and the widget extension target (which renders Lock Screen
/// and Dynamic Island UI). Both targets compile this file.
///
/// `totalSeconds` is the immutable session duration (used by the progress
/// bar). `ContentState.elapsedS` ticks up via `updateActivity` from
/// `app/(app)/session/stealth.tsx`.
@available(iOS 16.2, *)
public struct HoneSessionActivityAttributes: ActivityAttributes {
  public typealias HoneSessionStatus = ContentState

  public struct ContentState: Codable, Hashable {
    public var elapsedS: Int
    public var isPaused: Bool

    public init(elapsedS: Int, isPaused: Bool) {
      self.elapsedS = elapsedS
      self.isPaused = isPaused
    }
  }

  public var totalSeconds: Int

  public init(totalSeconds: Int) {
    self.totalSeconds = totalSeconds
  }
}
#endif
