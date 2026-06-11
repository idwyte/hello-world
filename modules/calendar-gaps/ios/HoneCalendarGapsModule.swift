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
        // iOS 17 introduced separate full / write access APIs.
        self.store.requestFullAccessToEvents { _, _ in
          let status = EKEventStore.authorizationStatus(for: .event)
          promise.resolve(self.authString(status))
        }
      } else {
        self.store.requestAccess(to: .event) { _, _ in
          let status = EKEventStore.authorizationStatus(for: .event)
          promise.resolve(self.authString(status))
        }
      }
    }

    AsyncFunction("findNextGap") { (minMinutes: Double, withinSeconds: Double, promise: Promise) in
      let status = EKEventStore.authorizationStatus(for: .event)
      // .authorized is the iOS ≤16 grant; .fullAccess is the iOS 17 equivalent.
      // Use the string mapping rather than direct case-matching so we don't
      // require an iOS 17 deployment target.
      let authorized = self.authString(status) == "authorized"
      guard authorized else {
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

  private func authString(_ status: EKAuthorizationStatus) -> String {
    if #available(iOS 17.0, *) {
      switch status {
      case .notDetermined: return "notDetermined"
      case .restricted: return "restricted"
      case .denied: return "denied"
      case .fullAccess, .authorized: return "authorized"
      case .writeOnly: return "denied" // we need read access; treat as denied
      @unknown default: return "denied"
      }
    } else {
      switch status {
      case .notDetermined: return "notDetermined"
      case .restricted: return "restricted"
      case .denied: return "denied"
      case .authorized: return "authorized"
      @unknown default: return "denied"
      }
    }
  }

  private func gapPayload(start: Date, durationSec: TimeInterval) -> [String: Any] {
    return [
      "startsAt": Self.iso8601.string(from: start),
      "durationMin": Int((durationSec / 60).rounded(.down)),
    ]
  }
}
