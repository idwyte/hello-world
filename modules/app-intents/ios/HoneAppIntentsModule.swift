import ExpoModulesCore

public class HoneAppIntentsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HoneAppIntentsModule")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 16.0, *) { return true }
      return false
    }

    AsyncFunction("registerIntents") { (promise: Promise) in
      if #available(iOS 16.0, *) {
        // The AppShortcutsProvider in HoneAppIntents.swift exposes the four
        // shortcuts to the system at install/update time. Calling
        // `updateAppShortcutParameters` nudges Spotlight + Siri to refresh
        // their cache after a cold start so freshly-installed shortcuts
        // appear without a reboot.
        HoneAppShortcuts.updateAppShortcutParameters()
        let payload: [String: Any] = [
          "available": true,
          "registered": [
            "start_session",
            "start_3min_discreet",
            "mark_today_complete",
            "show_streak",
          ],
        ]
        promise.resolve(payload)
      } else {
        promise.resolve([
          "available": false,
          "registered": [String](),
        ])
      }
    }
  }
}
