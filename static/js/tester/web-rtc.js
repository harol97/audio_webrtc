class PeerConnectionBuilder {
  build() {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          url: "stun:global.stun.twilio.com:3478",
          urls: "stun:global.stun.twilio.com:3478",
        },
        {
          credential: "oy7XfhV3WuShq0DttqjFL/XT8YjChokysgQ0QKOEOe4=",
          url: "turn:global.turn.twilio.com:3478?transport=udp",
          urls: "turn:global.turn.twilio.com:3478?transport=udp",
          username:
            "dcaaafe17448fe6354057499a4394f3787e828f480eb071bb158fa803dd8dbf6",
        },
        {
          credential: "oy7XfhV3WuShq0DttqjFL/XT8YjChokysgQ0QKOEOe4=",
          url: "turn:global.turn.twilio.com:3478?transport=tcp",
          urls: "turn:global.turn.twilio.com:3478?transport=tcp",
          username:
            "dcaaafe17448fe6354057499a4394f3787e828f480eb071bb158fa803dd8dbf6",
        },
        {
          credential: "oy7XfhV3WuShq0DttqjFL/XT8YjChokysgQ0QKOEOe4=",
          url: "turn:global.turn.twilio.com:443?transport=tcp",
          urls: "turn:global.turn.twilio.com:443?transport=tcp",
          username:
            "dcaaafe17448fe6354057499a4394f3787e828f480eb071bb158fa803dd8dbf6",
        },
      ],
    });

    // peerConnection.addEventListener("track", (evt) => {
    //   const audioElement = document.createElement("audio");
    //   if (evt.track.kind === "audio") audioElement.srcObject = evt.streams[0];
    //   audioElement.play();
    // });

    return peerConnection;
  }
}

class WebRTCNegotiator {
  constructor(peerConnection, samplerate, useFilter, userId) {
    this.userId = userId;
    this.peerConnection = peerConnection;
    this.samplerate = samplerate;
    this.useFilter = useFilter;
  }
  async toNegotiate() {
    const pc = this.peerConnection;
    return pc
      .createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .then(() => {
        // wait for ICE gathering to complete
        return new Promise((resolve) => {
          console.log("mmmmm", pc.iceGatheringState);
          if (pc.iceGatheringState === "complete") {
            console.log("hola");
            resolve();
          } else {
            function checkState() {
              console.log("mmmm");
              if (pc.iceGatheringState === "complete") {
                pc.removeEventListener("icegatheringstatechange", checkState);
                resolve();
              }
            }
            pc.addEventListener("icegatheringstatechange", checkState);
          }
        });
      })
      .then(() => {
        var offer = pc.localDescription;
        return fetch("/offer", {
          body: JSON.stringify({
            sdp: offer.sdp,
            type: offer.type,
            samplerate: this.samplerate,
            useFilter: this.useFilter,
            userId: this.userId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });
      })
      .then((response) => response.json())
      .then((answer) => {
        pc.setRemoteDescription(answer);
      });
  }
}
