import Foundation

#if canImport(AppIntents)
import AppIntents
import UIKit

// MARK: - Intent: open the app at today's session

@available(iOS 16.0, *)
public struct StartSessionIntent: AppIntent {
  public static var title: LocalizedStringResource = "Start Hone session"
  public static var description = IntentDescription(
    "Open Hone at today's session and start it.")
  public static var openAppWhenRun: Bool = true

  public init() {}

  @MainActor
  public func perform() async throws -> some IntentResult {
    if let url = URL(string: "hone://session/today") {
      _ = await UIApplication.shared.open(url)
    }
    return .result()
  }
}

// MARK: - Intent: 3-minute discreet session

@available(iOS 16.0, *)
public struct Start3MinDiscreetIntent: AppIntent {
  public static var title: LocalizedStringResource = "Quick discreet"
  public static var description = IntentDescription(
    "Start a 3-minute Hone session with stealth haptics, no on-screen UI.")
  public static var openAppWhenRun: Bool = true

  public init() {}

  @MainActor
  public func perform() async throws -> some IntentResult {
    if let url = URL(string: "hone://session/today?preset=quick_discreet") {
      _ = await UIApplication.shared.open(url)
    }
    return .result()
  }
}

// MARK: - Intent: mark today complete (placeholder)

@available(iOS 16.0, *)
public struct MarkTodayCompleteIntent: AppIntent {
  public static var title: LocalizedStringResource = "Mark today complete"
  public static var description = IntentDescription(
    "Open Hone so you can confirm today's session.")
  public static var openAppWhenRun: Bool = true

  public init() {}

  @MainActor
  public func perform() async throws -> some IntentResult {
    // Deep-link to /(app)/home where today's session card lives. The user
    // confirms inside the app; we don't write to Supabase from the intent.
    if let url = URL(string: "hone://home?action=mark_complete") {
      _ = await UIApplication.shared.open(url)
    }
    return .result()
  }
}

// MARK: - Intent: show streak

@available(iOS 16.0, *)
public struct ShowStreakIntent: AppIntent {
  public static var title: LocalizedStringResource = "Show Hone streak"
  public static var description = IntentDescription(
    "Open Hone on the progress page.")
  public static var openAppWhenRun: Bool = true

  public init() {}

  @MainActor
  public func perform() async throws -> some IntentResult {
    if let url = URL(string: "hone://progress") {
      _ = await UIApplication.shared.open(url)
    }
    return .result()
  }
}

// MARK: - Shortcuts provider

@available(iOS 16.0, *)
public struct HoneAppShortcuts: AppShortcutsProvider {
  public static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: StartSessionIntent(),
      phrases: [
        "Start \(.applicationName) session",
        "Begin \(.applicationName)",
        "Open \(.applicationName)",
      ],
      shortTitle: "Start session",
      systemImageName: "play.circle.fill")
    AppShortcut(
      intent: Start3MinDiscreetIntent(),
      phrases: [
        "\(.applicationName) quick discreet",
        "Quick discreet with \(.applicationName)",
        "Start quick discreet",
      ],
      shortTitle: "Quick discreet",
      systemImageName: "moon.zzz.fill")
    AppShortcut(
      intent: MarkTodayCompleteIntent(),
      phrases: [
        "Mark \(.applicationName) complete",
        "Finish today with \(.applicationName)",
      ],
      shortTitle: "Mark complete",
      systemImageName: "checkmark.circle.fill")
    AppShortcut(
      intent: ShowStreakIntent(),
      phrases: [
        "Show \(.applicationName) streak",
        "\(.applicationName) progress",
      ],
      shortTitle: "Show streak",
      systemImageName: "flame.fill")
  }
}

#endif
