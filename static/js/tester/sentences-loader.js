class SentencesLoader {
  async load(type) {
    return fetch("/sentences?method=" + type, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());
  }
}
