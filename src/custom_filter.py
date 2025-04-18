from datetime import time

from numpy import clip, float32, int16, mean, percentile, sqrt, square, zeros
from numpy._typing import NDArray


class CustomFilter:
    def __init__(self, samplerate: int) -> None:
        self.enhancement_factor = 1.5
        self.noise_window = []
        self.speech_frames = 0
        self.window_size = 50
        self.speech_holdtime = 10
        self.is_recording = False
        self.noise_profile_duration = 2
        self.noise_sample = zeros(samplerate + self.noise_profile_duration)
        self.last_noise_update = time()
        self.noise_window = []
        self.window_size = 50
        self.noise_floor = 0.0
        self.speech_frames = 0
        self.min_speech_frames = 3
        self.speech_holdtime = 10
        self.enhancement_factor = 1.5

    def apply_filter(self, audio_array: NDArray) -> NDArray:
        audio_float = audio_array.astype(float32) / 32768.0

        # Calculate frame energy
        frame_energy = sqrt(mean(square(audio_float)))

        # Update noise floor estimation
        self.noise_window.append(frame_energy)
        if len(self.noise_window) > self.window_size:
            self.noise_window.pop(0)

        # Calculate noise floor as the 10th percentile of recent energies
        self.noise_floor = percentile(self.noise_window, 10)

        # Dynamic threshold based on noise floor
        dynamic_threshold = self.noise_floor * 2.0

        # Speech detection with hysteresis
        is_speech = frame_energy > dynamic_threshold

        if is_speech:
            self.speech_frames = self.speech_holdtime
        elif self.speech_frames > 0:
            self.speech_frames -= 1
            is_speech = True

        if is_speech or self.speech_frames > 0:
            # Dynamic noise reduction
            gain = clip(frame_energy / dynamic_threshold, 1.0, self.enhancement_factor)

            # Apply gain and enhance signal
            enhanced_audio = audio_float * gain

            # Soft noise gate
            gate_factor = clip(
                (frame_energy - self.noise_floor)
                / (dynamic_threshold - self.noise_floor),
                0,
                1,
            )
            processed_audio = enhanced_audio * gate_factor

            # Convert back to int16
            return (processed_audio * 32768).clip(-32768, 32767).astype(int16)
        return audio_array
