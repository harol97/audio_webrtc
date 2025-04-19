class Recorder {
  constructor(props) {
    this.microphone = props.microphone;
    this.chunk = [];
    this.mediarecorder = null;
  }
  async startRecord(onStart) {
    if (this.mediarecorder) return;
    const stream = await Multimedia.getAudioStream(this.microphone.deviceId);
    this.mediarecorder = new MediaRecorder(stream);
    this.mediarecorder.ondataavailable = (ev) => this.#dataavailable(ev);
    this.mediarecorder.onstop = () => this.#onstopRecord();
    this.mediarecorder.onstart = () => onStart?.();
    this.mediarecorder.start();
    this.onstop = null;
  }

  async #dataavailable(ev) {
    this.chunk.push(ev.data);
  }

  async #onstopRecord() {
    const blob = new Blob([...this.chunk], {
      type: this.mediarecorder.mimeType,
    });
    this.onstop?.(blob);
    this.chunk = [];
  }

  async stopRecord(onstop) {
    if (!this.mediarecorder) return;
    this.onstop = onstop;
    this.mediarecorder.stop();
  }
}
