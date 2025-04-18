window.onload = async () => {
  const id = uuid.v4();
  const socket = io();

  const loadGif = document.createElement("img");
  loadGif.src = "/static/img/tester/load.gif";
  loadGif.width = 200;
  loadGif.height = 200;
  const startButton = document.getElementById("start-button");
  const stopButton = document.getElementById("stop-button");
  const continueButton = document.getElementById("continue-button");
  const repeatButton = document.getElementById("repeat-button");
  const processContainer = document.getElementById("process-container");
  const useFilterChecker = document.getElementById("option-use-filter");
  const multimedia = new Multimedia();
  const havePermission = await multimedia.requestMicrophonePermission();
  if (!havePermission) return;
  const microphones = await multimedia.getMicrophonesList();
  const methodPractice = new MethodOption([
    "option-speaking",
    "option-listening",
    "option-reading",
  ]);
  const microphoneSelector = new Selector("microphone-selector", microphones);

  let peerConnection = null;
  let track = null;
  let currentSentenceIndex = 0;
  let sentences = [];
  let action = null;

  let testId = null;
  microphoneSelector.asHTML.onchange = async () => {
    if (!microphoneSelector.microphoneSelected) {
      alert("Please. Select a Microphone");
      return;
    }
    clearInterval(testId);
    const threshold = 30;
    const stream = await Multimedia.getAudioStream(
      microphoneSelector.microphoneSelected
    );
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const soundGif = document.getElementById("no-sound-gif");

    function detectAudio() {
      analyser.getByteFrequencyData(dataArray);

      // Calcular el volumen promedio
      let total = 0;
      for (let i = 0; i < bufferLength; i++) {
        total += dataArray[i];
      }
      const average = total / bufferLength;

      // Si el volumen promedio supera el umbral, activar el GIF
      if (average > threshold) {
        soundGif.hidden = true;
      } else {
        soundGif.hidden = false;
      }
    }
    testId = setInterval(detectAudio, 100);
  };

  const restart = () => {
    socket.emit("leave", id);
    peerConnection = null;
    currentSentenceIndex = 0;
    sentences = [];
    action = null;
    startButton.disabled = false;
    stopButton.disabled = true;
    continueButton.disabled = true;
    repeatButton.disabled = true;
    processContainer.textContent = "";
  };

  restart();

  startButton.onclick = async () => {
    const isMicrophoneSelected = microphoneSelector.microphoneSelected;
    if (!isMicrophoneSelected) {
      processContainer.innerHTML =
        "<p style='color:red'>Choose a Microphone</p>";
      return;
    }
    const method = methodPractice.value;
    if (!method) return;
    socket.emit("join", id);
    startButton.disabled = true;
    stopButton.disabled = false;
    const sentenceLoader = new SentencesLoader();
    sentences = await sentenceLoader.load(method);
    action = actions[method];
    if (!action) return;
    processContainer.style = "align-items:center;justify-content:center";
    processContainer.appendChild(loadGif);
    const data = await startWebRTC(
      microphoneSelector,
      useFilterChecker.checked,
      id,
      async () => {
        await actionHelper();
      }
    );
    peerConnection = data.peerConnection;
    track = data.audioTrack;
  };

  continueButton.onclick = async () => {
    const nextIndex = (currentSentenceIndex += 1);
    if (nextIndex > sentences.length - 1) {
      peerConnection.close();
      restart();
      return;
    }
    currentSentenceIndex = nextIndex;
    stopButton.disabled = false;
    continueButton.disabled = true;
    repeatButton.disabled = true;
    await actionHelper();
  };

  repeatButton.onclick = async () => {
    await actionHelper();
  };

  stopButton.onclick = async () => {
    if (peerConnection) peerConnection.close();
    restart();
  };

  socket.on("sentence", (sentence) => {
    if (!track) return;
    if (!track.enabled) return;
    pause();
    const node = document.createElement("p");
    node.textContent = "processing...";
    node.style = "color:red;";
    processContainer.appendChild(node);
    fetch("/analyzers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expected: sentences[currentSentenceIndex],
        actual: sentence,
        method: methodPractice.value,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        data.forEach((item) => {
          const p = document.createElement("p");
          p.textContent = item.text;
          p.style.color = item.color;
          processContainer.appendChild(p);
        });
      })
      .catch(() => {})
      .finally(() => {
        continueButton.disabled = false;
        repeatButton.disabled = false;
      });
  });

  const actionHelper = async () => {
    processContainer.style = "alig-items:start;";
    await action(sentences, currentSentenceIndex, processContainer, unpause);
  };

  const unpause = async () => {
    await fetch("/unpause", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(id),
    });
    track.enabled = true;
  };

  const pause = () => {
    track.enabled = false;
  };
};
