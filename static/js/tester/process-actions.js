const actions = {
  speaking: async function showDataSpeaking(
    sentences,
    currentSentenceIndex,
    processContainer,
    unpause
  ) {
    const p = document.createElement("p");
    p.textContent = "Sentence to Read >> " + sentences[currentSentenceIndex];
    p.style = "color:green";
    const pWait = document.createElement("p");
    pWait.textContent = "Wait a moment please...";
    pWait.style = "color:red";
    processContainer.innerHTML = "";
    processContainer.appendChild(p);
    processContainer.appendChild(pWait);
    const pRead = document.createElement("p");
    pRead.textContent = "Now Read...";
    pRead.style = "color:green";
    await unpause();
    processContainer.appendChild(pRead);
  },
  listening: async function showDataListening(
    sentences,
    currentSentenceIndex,
    processContainer,
    unpause
  ) {
    processContainer.innerHTML = "listen...";
    const generator = new VoiceGenerator(sentences[currentSentenceIndex]);
    const filename = await generator.generate();
    generator.play(filename, () => {
      fetch("/sentences/audios", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filename.split("/").pop()),
      });
      const pRead = document.createElement("p");
      pRead.textContent = "Now Read...";
      pRead.style = "color:greeen";
      unpause();
      processContainer.appendChild(pRead);
    });
  },
  reading: async function showDataListening(
    sentences,
    currentSentenceIndex,
    processContainer,
    unpause,
    _
  ) {
    const warningParagraph = document.createElement("p");
    warningParagraph.textContent =
      "You will read this sentence for a minute and then it will disappear. At that moment, you should explain in English what you have understood.\n";
    warningParagraph.style = "color:red;";
    const p = document.createElement("p");
    p.textContent = "Sentence: " + sentences[currentSentenceIndex];
    p.style = "color:green";
    const pWait = document.createElement("p");
    pWait.textContent = "Wait a moment please...";
    pWait.style = "color:red";
    processContainer.innerHTML = "";
    processContainer.appendChild(warningParagraph);
    processContainer.appendChild(p);
    const pRead = document.createElement("p");
    pRead.textContent = "Now explain with your words...";
    pRead.style = "color:green";
    setTimeout(async () => {
      processContainer.innerHTML = "";
      processContainer.appendChild(pWait);
      await unpause();
      processContainer.appendChild(pRead);
    }, 60 * 1000);
  },
};

async function startWebRTC(microphoneSelector, useFilter, userId, action) {
  const microphoneSelected = microphoneSelector.microphoneSelected;
  if (!microphoneSelected) return;
  const peerConnection = new PeerConnectionBuilder().build();
  peerConnection.addEventListener("connectionstatechange", () => {
    if (peerConnection.connectionState === "connected") {
      action();
    }
  });
  const negotiator = new WebRTCNegotiator(
    peerConnection,
    microphoneSelected.samplerate,
    useFilter,
    userId
  );
  const stream = await Multimedia.getAudioStream(microphoneSelected.deviceId);
  const audioTrack = stream.getAudioTracks()[0];
  audioTrack.enabled = false;
  const sender = peerConnection.addTrack(audioTrack, stream);
  await negotiator.toNegotiate();
  return { audioTrack, peerConnection, sender, stream };
}
