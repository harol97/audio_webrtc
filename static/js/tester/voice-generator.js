class VoiceGenerator {
  constructor(sentence) {
    this.sentence = sentence;
  }
  async generate() {
    return fetch("/sentences/audios", {
      method: "POST",
      body: JSON.stringify(this.sentence),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  }
  async play(filename, onend) {
    const audio = new Audio(filename);
    audio.onended = onend;
    await audio.play();
  }
}
