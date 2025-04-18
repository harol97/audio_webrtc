class Selector {
  constructor(id, microphones) {
    this.select = document.getElementById(id);
    this.microphones = microphones ?? [];
    this.#updateOptions();
  }

  addOptions(microphones) {
    this.microphones = [...this.microphones, ...microphones];
    this.#updateOptions();
  }

  #updateOptions() {
    const select = this.select;
    this.microphones.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.deviceId;
      optionElement.text = option.name;
      select.appendChild(optionElement);
    });
  }

  get microphoneSelected() {
    return this.microphones.find(
      (microphone) => microphone.deviceId === this.select.value
    );
  }

  get objSelected() {
    return this.microphones.find(
      (microphone) => microphone.deviceId === this.select.value
    );
  }

  get asHTML() {
    return this.select;
  }
}
