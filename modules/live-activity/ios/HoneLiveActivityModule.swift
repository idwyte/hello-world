import ExpoModulesCore
import Foundation

#if canImport(ActivityKit)
import ActivityKit
#endif

public class HoneLiveActivityModule: Module {
  public func definition() -> ModuleDefinition {
    Name("HoneLiveActivityModule")

    Function("isAvailable") { () -> Bool in
      if #available(iOS 16.2, *) {
        #if canImport(ActivityKit)
        return ActivityAuthorizationInfo().areActivitiesEnabled
        #else
        return false
        #endif
      }
      return false
    }

    AsyncFunction("startActivity") { (input: [String: Any], promise: Promise) in
      if #available(iOS 16.2, *) {
        #if canImport(ActivityKit)
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
          promise.resolve(nil)
          return
        }
        let total = (input["totalSeconds"] as? NSNumber)?.intValue ?? 0
        do {
          let attributes = HoneSessionActivityAttributes(totalSeconds: total)
          let state = HoneSessionActivityAttributes.ContentState(
            elapsedS: 0,
            isPaused: false
          )
          let content = ActivityContent(state: state, staleDate: nil)
          let activity = try Activity<HoneSessionActivityAttributes>.request(
            attributes: attributes,
            content: content,
            pushType: nil
          )
          promise.resolve(["activityId": activity.id])
        } catch {
          promise.reject("ERR_LIVE_ACTIVITY_START", error.localizedDescription)
        }
        #else
        promise.resolve(nil)
        #endif
      } else {
        promise.resolve(nil)
      }
    }

    AsyncFunction("updateActivity") { (activityId: String, update: [String: Any], promise: Promise) in
      if #available(iOS 16.2, *) {
        #if canImport(ActivityKit)
        Task {
          let elapsedS = (update["elapsedS"] as? NSNumber)?.intValue ?? 0
          let isPaused = (update["isPaused"] as? NSNumber)?.boolValue ?? false
          let state = HoneSessionActivityAttributes.ContentState(
            elapsedS: elapsedS,
            isPaused: isPaused
          )
          let content = ActivityContent(state: state, staleDate: nil)
          for activity in Activity<HoneSessionActivityAttributes>.activities
          where activity.id == activityId {
            await activity.update(content)
          }
          promise.resolve(nil)
        }
        #else
        promise.resolve(nil)
        #endif
      } else {
        promise.resolve(nil)
      }
    }

    AsyncFunction("endActivity") { (activityId: String, promise: Promise) in
      if #available(iOS 16.2, *) {
        #if canImport(ActivityKit)
        Task {
          for activity in Activity<HoneSessionActivityAttributes>.activities
          where activity.id == activityId {
            await activity.end(nil, dismissalPolicy: .immediate)
          }
          promise.resolve(nil)
        }
        #else
        promise.resolve(nil)
        #endif
      } else {
        promise.resolve(nil)
      }
    }
  }
}
