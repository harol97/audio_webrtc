class MicrophoneTester {
  constructor(microphones) {
    this.modal = document.getElementById("modal-test-microphone");
    this.selectMicrophone = document.getElementById(
      "modal-test-microphone-selector"
    );
    this.microphones = microphones;
  }

  show() {
    this.modal.showModal();
  }
}
