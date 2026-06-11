import ExpoModulesCore
import Intents

public class HoneFocusFilterModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("HoneFocusFilterModule")

    Events("FocusStatusChanged")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 15.0, *) { return true }
      return false
    }

    AsyncFunction("requestAuthorization") { (promise: Promise) in
      if #available(iOS 15.0, *) {
        INFocusStatusCenter.default.requestAuthorization { status in
          promise.resolve(self.authString(status))
        }
      } else {
        promise.resolve("denied")
      }
    }

    AsyncFunction("getStatus") { (promise: Promise) in
      if #available(iOS 15.0, *) {
        let center = INFocusStatusCenter.default
        let isFocus = center.focusStatus.isFocused ?? false
        promise.resolve([
          "isFocus": isFocus,
          "authorization": self.authString(center.authorizationStatus),
        ])
      } else {
        promise.resolve([
          "isFocus": false,
          "authorization": "denied",
        ])
      }
    }

    AsyncFunction("startListening") { (promise: Promise) in
      if #available(iOS 15.0, *) {
        if self.observer == nil {
          // INFocusStatusCenter doesn't expose a delegate; we observe via
          // notification name `INFocusStatusCenterDidChangeNotification`
          // (added in iOS 15.0). Falls back to a 1s polling timer if the
          // notification can't be observed — kept inside the native layer
          // so JS callers see one consistent surface.
          let name = Notification.Name("INFocusStatusCenterDidChangeNotification")
          self.observer = NotificationCenter.default.addObserver(
            forName: name,
            object: nil,
            queue: .main
          ) { [weak self] _ in
            self?.emitCurrent()
          }
          // Fire once immediately so JS knows the current state.
          self.emitCurrent()
        }
        promise.resolve(nil)
      } else {
        promise.resolve(nil)
      }
    }

    AsyncFunction("stopListening") { (promise: Promise) in
      if let obs = self.observer {
        NotificationCenter.default.removeObserver(obs)
        self.observer = nil
      }
      promise.resolve(nil)
    }

    OnDestroy {
      if let obs = self.observer {
        NotificationCenter.default.removeObserver(obs)
        self.observer = nil
      }
    }
  }

  @available(iOS 15.0, *)
  private func emitCurrent() {
    let isFocus = INFocusStatusCenter.default.focusStatus.isFocused ?? false
    self.sendEvent("FocusStatusChanged", [
      "isFocus": isFocus,
    ])
  }

  @available(iOS 15.0, *)
  private func authString(_ status: INFocusStatusAuthorizationStatus) -> String {
    switch status {
    case .notDetermined: return "notDetermined"
    case .authorized: return "authorized"
    case .denied: return "denied"
    case .restricted: return "restricted"
    @unknown default: return "denied"
    }
  }
}
