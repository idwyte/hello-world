import AVFoundation

/// Inspects the current AVAudioSession output route. Used to gate audio cues
/// to AirPods / wired headphones only — never the speaker.
enum StealthAudioRoute {
  static func current() -> String {
    let outputs = AVAudioSession.sharedInstance().currentRoute.outputs
    if outputs.isEmpty { return "silent" }
    for o in outputs {
      switch o.portType {
      case .bluetoothA2DP, .bluetoothLE, .bluetoothHFP, .airPlay:
        return "bluetooth"
      case .headphones, .headsetMic, .usbAudio, .lineOut:
        return "wired"
      case .builtInSpeaker, .builtInReceiver:
        return "speaker"
      default:
        continue
      }
    }
    return "unknown"
  }
}
