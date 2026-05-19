// HoneLiveActivityWidget — Lock-Screen banner + Dynamic Island UI.
//
// This file is the source for the widget extension target. The host module
// target compiles HoneSessionActivityAttributes.swift directly; the widget
// target needs to compile **both** this file and a copy of (or a shared
// reference to) HoneSessionActivityAttributes.swift so the types match.
//
// Manual Xcode setup (until `withLiveActivity.ts` automates target creation):
//
// 1. Open `ios/Hone.xcworkspace` after `expo prebuild`.
// 2. File → New → Target → Widget Extension. Product Name "HoneLiveActivity".
//    Include Configuration App Intent: NO. Include Live Activity: YES.
// 3. Delete the boilerplate `HoneLiveActivityLiveActivity.swift` Xcode
//    generates.
// 4. Right-click the new target's group → "Add Files…" → select this file
//    AND `../HoneSessionActivityAttributes.swift`. Tick BOTH the widget
//    target and the host app target (Add to targets) for the attributes
//    file; only the widget target for this widget file.
// 5. In the widget target's General → Frameworks, Libraries, and Embedded
//    Content, ensure ActivityKit.framework and WidgetKit.framework are
//    Linked. SwiftUI auto-links.
// 6. Build & run on iOS 16.1+ device. Live Activities cannot be tested
//    on simulator reliably.

import Foundation
import SwiftUI

#if canImport(WidgetKit) && canImport(ActivityKit)
import WidgetKit
import ActivityKit

@available(iOS 16.2, *)
struct HoneLiveActivityWidget: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: HoneSessionActivityAttributes.self) { context in
      // Lock-Screen / banner appearance.
      LockScreenView(context: context)
        .activityBackgroundTint(Color(.sRGB, red: 0.043, green: 0.043, blue: 0.059, opacity: 1.0))
        .activitySystemActionForegroundColor(Color.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Label {
            Text("Focus")
              .font(.headline)
              .foregroundColor(.white)
          } icon: {
            Image(systemName: "headphones")
              .foregroundColor(Color(red: 0.486, green: 0.361, blue: 1.0))
          }
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(timerString(context.state.elapsedS))
            .font(.system(size: 16, weight: .semibold, design: .rounded))
            .monospacedDigit()
            .foregroundColor(.white)
        }
        DynamicIslandExpandedRegion(.bottom) {
          ProgressBar(
            elapsedS: context.state.elapsedS,
            totalS: context.attributes.totalSeconds,
            isPaused: context.state.isPaused
          )
          .frame(height: 4)
        }
      } compactLeading: {
        Image(systemName: "headphones")
          .foregroundColor(Color(red: 0.486, green: 0.361, blue: 1.0))
      } compactTrailing: {
        Text(timerString(context.state.elapsedS))
          .monospacedDigit()
          .font(.system(size: 12, weight: .semibold, design: .rounded))
          .foregroundColor(.white)
      } minimal: {
        Image(systemName: "headphones")
          .foregroundColor(Color(red: 0.486, green: 0.361, blue: 1.0))
      }
    }
  }
}

@available(iOS 16.2, *)
private struct LockScreenView: View {
  let context: ActivityViewContext<HoneSessionActivityAttributes>

  var body: some View {
    HStack(spacing: 12) {
      Image(systemName: "headphones")
        .font(.system(size: 22, weight: .medium))
        .foregroundColor(Color(red: 0.486, green: 0.361, blue: 1.0))
        .frame(width: 40, height: 40)
        .background(
          Circle().fill(Color(red: 0.486, green: 0.361, blue: 1.0).opacity(0.12))
        )

      VStack(alignment: .leading, spacing: 4) {
        Text("Focus Session")
          .font(.system(size: 15, weight: .semibold))
          .foregroundColor(.white)
        Text(context.state.isPaused ? "Paused" : "In progress")
          .font(.system(size: 12))
          .foregroundColor(.white.opacity(0.6))
        ProgressBar(
          elapsedS: context.state.elapsedS,
          totalS: context.attributes.totalSeconds,
          isPaused: context.state.isPaused
        )
        .frame(height: 4)
      }

      Spacer()

      Text(timerString(context.state.elapsedS))
        .font(.system(size: 22, weight: .semibold, design: .rounded))
        .monospacedDigit()
        .foregroundColor(.white)
    }
    .padding(.horizontal, 16)
    .padding(.vertical, 14)
  }
}

@available(iOS 16.2, *)
private struct ProgressBar: View {
  let elapsedS: Int
  let totalS: Int
  let isPaused: Bool

  var body: some View {
    GeometryReader { geo in
      ZStack(alignment: .leading) {
        Capsule()
          .fill(Color.white.opacity(0.18))
        Capsule()
          .fill(
            isPaused
              ? Color.white.opacity(0.4)
              : Color(red: 0.486, green: 0.361, blue: 1.0)
          )
          .frame(width: geo.size.width * progressFraction)
      }
    }
  }

  private var progressFraction: CGFloat {
    guard totalS > 0 else { return 0 }
    let raw = CGFloat(elapsedS) / CGFloat(totalS)
    return max(0, min(1, raw))
  }
}

@available(iOS 16.2, *)
private func timerString(_ seconds: Int) -> String {
  let s = max(0, seconds)
  let m = s / 60
  let r = s % 60
  return String(format: "%d:%02d", m, r)
}

#endif
