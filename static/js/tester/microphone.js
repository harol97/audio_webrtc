class Microphone {
  constructor(props) {
    this.deviceId = props.deviceId;
    this.name = props.label;
    this.stream = props.stream;
    this.samplerate = props.getCapabilities().sampleRate.max;
    this.audio = null;
  }

  test() {
    if (this.audio === null)
      navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then((stream) => {
          this.audio = new Audio();
          this.audio.srcObject = stream;
          this.audio.play();
        });
    else {
      this.audio.pause();
      this.audio = null;
    }
  }
}
