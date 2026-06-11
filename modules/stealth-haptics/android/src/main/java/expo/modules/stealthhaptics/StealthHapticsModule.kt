package expo.modules.stealthhaptics

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class StealthHapticsModule : Module() {
  private val scheduled = ConcurrentHashMap<String, java.util.concurrent.ScheduledFuture<*>>()
  private val executor = Executors.newSingleThreadScheduledExecutor()

  private val context: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No context")

  private val vibrator: Vibrator
    get() {
      return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        val vm = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
        vm.defaultVibrator
      } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
      }
    }

  private val audioManager: AudioManager
    get() = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  override fun definition() = ModuleDefinition {
    Name("StealthHapticsModule")

    AsyncFunction("prepareEngine") { promise: Promise -> promise.resolve(null) }

    AsyncFunction("playPattern") { pattern: String, intensity: Double, promise: Promise ->
      try {
        playWaveform(pattern, intensity.toFloat())
        promise.resolve(null)
      } catch (e: Throwable) {
        promise.reject("ERR_HAPTICS_PLAY", e.message, e)
      }
    }

    AsyncFunction("schedulePattern") { pattern: String, atMs: Double, intensity: Double, promise: Promise ->
      val handle = UUID.randomUUID().toString()
      val future = executor.schedule({
        try { playWaveform(pattern, intensity.toFloat()) } catch (_: Throwable) {}
        scheduled.remove(handle)
      }, atMs.toLong(), TimeUnit.MILLISECONDS)
      scheduled[handle] = future
      promise.resolve(handle)
    }

    AsyncFunction("cancelScheduled") { handle: String, promise: Promise ->
      scheduled.remove(handle)?.cancel(false)
      promise.resolve(null)
    }

    AsyncFunction("cancelAll") { promise: Promise ->
      scheduled.values.forEach { it.cancel(false) }
      scheduled.clear()
      vibrator.cancel()
      promise.resolve(null)
    }

    AsyncFunction("currentAudioRoute") { promise: Promise ->
      promise.resolve(audioRoute())
    }

    AsyncFunction("isBluetoothAudioConnected") { promise: Promise ->
      promise.resolve(audioRoute() == "bluetooth")
    }
  }

  private fun playWaveform(name: String, intensity: Float) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val clamped = intensity.coerceIn(0f, 1f)
    val amp = (clamped * 255).toInt().coerceIn(1, 255)
    val (timings, amplitudes) = when (name) {
      "squeezeStart" -> longArrayOf(0, 30, 20, 200) to intArrayOf(0, amp, 0, (amp * 0.8f).toInt())
      "hold" -> longArrayOf(0, 25) to intArrayOf(0, (amp * 0.25f).toInt().coerceAtLeast(1))
      "release" -> longArrayOf(0, 300) to intArrayOf(0, (amp * 0.6f).toInt())
      "rest" -> return
      "sessionStart" -> longArrayOf(0, 60, 80, 60) to intArrayOf(0, amp, 0, amp)
      "sessionEnd" -> longArrayOf(0, 80, 60, 400) to intArrayOf(0, amp, 0, (amp * 0.5f).toInt())
      "reconnect" -> longArrayOf(0, 40, 80, 40, 80, 40) to intArrayOf(0, amp, 0, amp, 0, amp)
      else -> return
    }
    val effect = VibrationEffect.createWaveform(timings, amplitudes, -1)
    vibrator.vibrate(effect)
  }

  private fun audioRoute(): String {
    val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)
    if (devices.isEmpty()) return "silent"
    for (d in devices) {
      when (d.type) {
        AudioDeviceInfo.TYPE_BLUETOOTH_A2DP,
        AudioDeviceInfo.TYPE_BLUETOOTH_SCO,
        AudioDeviceInfo.TYPE_BLE_HEADSET,
        AudioDeviceInfo.TYPE_BLE_SPEAKER -> return "bluetooth"
        AudioDeviceInfo.TYPE_WIRED_HEADPHONES,
        AudioDeviceInfo.TYPE_WIRED_HEADSET,
        AudioDeviceInfo.TYPE_USB_HEADSET -> return "wired"
        AudioDeviceInfo.TYPE_BUILTIN_SPEAKER,
        AudioDeviceInfo.TYPE_BUILTIN_EARPIECE -> return "speaker"
      }
    }
    return "unknown"
  }
}
