class MethodOption {
  constructor(idList) {
    this.radioInputs = idList.map((id) => document.getElementById(id));
  }

  get value() {
    return this.radioInputs.find((radioInput) => radioInput.checked)?.value;
  }
}
