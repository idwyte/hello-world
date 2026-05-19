import ExpoModulesCore
import EventKit

public class HoneCalendarGapsModule: Module {
  private let store = EKEventStore()
  private static let iso8601: ISO8601DateFormatter = {
    let f = ISO8601DateFormatter()
    f.formatOptions = [.withInternetDateTime]
    return f
  }()

  public func definition() -> ModuleDefinition {
    Name("HoneCalendarGapsModule")

    Function("isAvailable") { () -> Bool in true }

    AsyncFunction("requestAuthorization") { (promise: Promise) in
      if #available(iOS 17.0, *) {
        // iOS 17 introduced read-only access; prefer it where possible.
        self.store.requestFullAccessToEvents { granted, _ in
          promise.resolve(self.authString(granted: granted))
        }
      } else {
        self.store.requestAccess(to: .event) { granted, _ in
          promise.resolve(self.authString(granted: granted))
        }
      }
    }

    AsyncFunction("findNextGap") { (minMinutes: Double, withinSeconds: Double, promise: Promise) in
      let status = EKEventStore.authorizationStatus(for: .event)
      guard status == .authorized || status == .fullAccess else {
        promise.resolve(nil)
        return
      }

      let now = Date()
      let horizon = now.addingTimeInterval(withinSeconds)
      let predicate = self.store.predicateForEvents(
        withStart: now,
        end: horizon,
        calendars: nil
      )
      let events = self.store
        .events(matching: predicate)
        .filter { !$0.isAllDay }
        .sorted { $0.startDate < $1.startDate }

      let minSeconds = max(60, minMinutes * 60)
      var cursor = now

      // Case 1: no events at all in the window -> the entire window is free.
      if events.isEmpty {
        let duration = horizon.timeIntervalSince(cursor)
        if duration >= minSeconds {
          promise.resolve(self.gapPayload(start: cursor, durationSec: duration))
        } else {
          promise.resolve(nil)
        }
        return
      }

      // Case 2: walk the events; first gap >= minSeconds wins.
      for evt in events {
        if evt.startDate > cursor {
          let duration = evt.startDate.timeIntervalSince(cursor)
          if duration >= minSeconds {
            promise.resolve(self.gapPayload(start: cursor, durationSec: duration))
            return
          }
        }
        if evt.endDate > cursor {
          cursor = evt.endDate
        }
      }

      // Case 3: tail of the window after the last event.
      if cursor < horizon {
        let duration = horizon.timeIntervalSince(cursor)
        if duration >= minSeconds {
          promise.resolve(self.gapPayload(start: cursor, durationSec: duration))
          return
        }
      }
      promise.resolve(nil)
    }
  }

  private func authString(granted: Bool) -> String {
    return granted ? "authorized" : "denied"
  }

  private func gapPayload(start: Date, durationSec: TimeInterval) -> [String: Any] {
    return [
      "startsAt": Self.iso8601.string(from: start),
      "durationMin": Int((durationSec / 60).rounded(.down)),
    ]
  }
}
