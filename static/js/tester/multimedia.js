class Multimedia {
  constructor() {
    this.permissions = {};
  }
  async requestPermission(constraints) {
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(() => true)
      .catch(() => false);
  }

  async requestMicrophonePermission() {
    return await this.requestPermission({ audio: true });
  }

  async getMicrophonesList() {
    return navigator.mediaDevices
      .enumerateDevices()
      .then((devices) =>
        devices
          .filter((device) => device.kind === "audioinput")
          .map((device) => new Microphone(device)),
      )
      .catch(() => []);
  }

  static async getAudioStream(deviceId) {
    return navigator.mediaDevices.getUserMedia({
      audio: { deviceId, noiseSuppression: true },
    });
  }

  async getSpeakerList() {
    return navigator.mediaDevices
      .enumerateDevices()
      .then((devices) =>
        devices
          .filter((device) => device.kind === "audiooutput")
          .map((device) => new Speaker(device)),
      )
      .catch(() => []);
  }
}
