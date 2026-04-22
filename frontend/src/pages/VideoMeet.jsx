import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import "../styles/videoComponent.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";


const server_url = server;
var connections = {};
const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

/* Reusable avatar tile — shows initials inside a full-size tile */
const AvatarTile = ({ name, size = "large" }) => {
  const initials =
    name && isNaN(name)
      ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";
  return (
    <div className="avatar-tile">
      <div className="avatar-circle" style={size === "small" ? { width: 40, height: 40, fontSize: "1rem" } : {}}>
        {initials}
      </div>
      {size === "large" && <div className="avatar-name">{name || "User"}</div>}
    </div>
  );
};

export default function VideoMeetComponent() {
  var socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoref = useRef();
  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState(false);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState(false);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  const videoRef = useRef([]);
  let [videos, setVideos] = useState([]);

  useEffect(() => { getPermissions(); });

  let getDislayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices
          .getDisplayMedia({ video: true, audio: true })
          .then(getDislayMediaSuccess)
          .then(() => {})
          .catch((e) => console.log(e));
      }
    }
  };

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      setVideoAvailable(!!videoPermission);
      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioAvailable(!!audioPermission);
      setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoref.current) localVideoref.current.srcObject = userMediaStream;
        }
      }
    } catch (error) { console.log(error); }
  };

  useEffect(() => {
    if (video !== undefined && audio !== undefined) { getUserMedia(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video, audio]);

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  let getUserMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
    window.localStream = stream;
    localVideoref.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      window.localStream.getTracks().forEach((track) => connections[id].addTrack(track, window.localStream));
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
        }).catch((e) => console.log(e));
      });
    }
    stream.getTracks().forEach((track) => (track.onended = () => {
      setVideo(false); setAudio(false);
      try { localVideoref.current.srcObject.getTracks().forEach((t) => t.stop()); } catch (e) {}
      localVideoref.current.srcObject = window.localStream;
      for (let id in connections) {
        window.localStream.getTracks().forEach((t) => connections[id].addTrack(t, window.localStream));
        connections[id].createOffer().then((desc) => {
          connections[id].setLocalDescription(desc).then(() => {
            socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
          }).catch((e) => console.log(e));
        });
      }
    }));
  };

  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess).then(() => {}).catch((e) => console.log(e));
    } else {
      try { localVideoref.current.srcObject.getTracks().forEach((t) => t.stop()); } catch (e) {}
    }
  };

  let getDislayMediaSuccess = (stream) => {
    try { window.localStream.getTracks().forEach((t) => t.stop()); } catch (e) {}
    window.localStream = stream;
    localVideoref.current.srcObject = stream;
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
      connections[id].addTrack(window.localStream);
      connections[id].createOffer().then((description) => {
        connections[id].setLocalDescription(description).then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
        }).catch((e) => console.log(e));
      });
    }
    stream.getTracks().forEach((track) => (track.onended = () => {
      setScreen(false);
      try { localVideoref.current.srcObject.getTracks().forEach((t) => t.stop()); } catch (e) {}
      let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
      window.localStream = blackSilence();
      localVideoref.current.srcObject = window.localStream;
      getUserMedia();
    }));
  };

  let gotMessageFromServer = (fromId, message) => {
    var signal = JSON.parse(message);
    if (fromId !== socketIdRef.current) {
      if (signal.sdp) {
        connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId].createAnswer().then((description) => {
              connections[fromId].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", fromId, JSON.stringify({ sdp: connections[fromId].localDescription }));
              }).catch((e) => console.log(e));
            }).catch((e) => console.log(e));
          }
        }).catch((e) => console.log(e));
      }
      if (signal.ice) {
        connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
      }
    }
  };

  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });
    socketRef.current.on("signal", gotMessageFromServer);
    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;
      socketRef.current.on("chat-message", addMessage);
      socketRef.current.on("user-left", (id) => {
        setVideos((videos) => videos.filter((v) => v.socketId !== id));
      });
      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
          connections[socketListId].onicecandidate = (event) => {
            if (event.candidate != null) {
              socketRef.current.emit("signal", socketListId, JSON.stringify({ ice: event.candidate }));
            }
          };
          connections[socketListId].ontrack = (event) => {
            let stream = event.streams[0];
            let videoExists = videoRef.current.find((v) => v.socketId === socketListId);
            if (videoExists) {
              setVideos((videos) => {
                const updated = videos.map((v) => v.socketId === socketListId ? { ...v, stream } : v);
                videoRef.current = updated;
                return updated;
              });
            } else {
              let newVideo = { socketId: socketListId, stream, autoplay: true, playsinline: true };
              setVideos((videos) => {
                const updated = [...videos, newVideo];
                videoRef.current = updated;
                return updated;
              });
            }
          };
          if (window.localStream !== undefined && window.localStream !== null) {
            connections[socketListId].addStream(window.localStream);
          } else {
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            connections[socketListId].addStream(window.localStream);
          }
        });
        if (id === socketIdRef.current) {
          for (let id2 in connections) {
            if (id2 === socketIdRef.current) continue;
            try { connections[id2].addStream(window.localStream); } catch (e) {}
            connections[id2].createOffer().then((description) => {
              connections[id2].setLocalDescription(description).then(() => {
                socketRef.current.emit("signal", id2, JSON.stringify({ sdp: connections[id2].localDescription }));
              }).catch((e) => console.log(e));
            });
          }
        }
      });
    });
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination());
    oscillator.start(); ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
  };

  let black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height });
    canvas.getContext("2d").fillRect(0, 0, width, height);
    return Object.assign(canvas.captureStream().getVideoTracks()[0], { enabled: false });
  };

  let handleVideo = async () => {
    const nv = !video;
    setVideo(nv);
    if (!nv) {
      // Turn OFF: stop tracks and replace with null in all peers
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((t) => t.stop());
      }
      for (let id in connections) {
        const sender = connections[id].getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(null);
      }
    } else {
      // Turn ON: get new camera stream and replace in all peers
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const newTrack = stream.getVideoTracks()[0];
        for (let id in connections) {
          const sender = connections[id].getSenders().find((s) => s.track?.kind === "video");
          if (sender) await sender.replaceTrack(newTrack);
        }
        const newStream = new MediaStream([newTrack, ...(window.localStream?.getAudioTracks() || [])]);
        window.localStream = newStream;
        if (localVideoref.current) localVideoref.current.srcObject = newStream;
      } catch (e) { console.log(e); }
    }
  };

  let handleAudio = () => {
    const na = !audio;
    setAudio(na);
    if (window.localStream) {
      window.localStream.getAudioTracks().forEach((t) => { t.enabled = na; });
    }
  };

  useEffect(() => {
    if (screen !== undefined) getDislayMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  let handleScreen = () => setScreen(!screen);

  let handleEndCall = () => {
    try { localVideoref.current.srcObject.getTracks().forEach((t) => t.stop()); } catch (e) {}
    window.location.href = "/";
  };

  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prev) => [...prev, { sender, data }]);
    if (socketIdSender !== socketIdRef.current) setNewMessages((prev) => prev + 1);
  };

  let sendMessage = () => {
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
  };

  let connect = () => { setAskForUsername(false); getMedia(); };

  return (
    <div>
      {askForUsername ? (
        /* ── Lobby ── */
        <div className="lobby-page">
          <div className="lobby-card">
            <div className="lobby-logo">
              <div className="lobby-logo-mark">M</div>
              <span>MeetMates</span>
            </div>
            <h2 className="lobby-title">Ready to join?</h2>
            <p className="lobby-subtitle">Set up your name before entering the meeting</p>
            <div className="lobby-preview">
              <video ref={localVideoref} autoPlay muted
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }} />
            </div>
            <div className="lobby-form">
              <input className="lobby-input" placeholder="Your display name"
                value={username} onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && username && connect()} autoFocus />
              <button className="lobby-connect-btn" onClick={connect} disabled={!username.trim()}>
                Join Meeting →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Meeting Room ── */
        <div className="meet-room">
          {/* Header */}
          <div className="meet-header">
            <div className="meet-header-logo">
              <div className="meet-logo-mark">M</div>
              <span>MeetMates</span>
            </div>
            <span className="meet-participants-count">👥 {videos.length + 1} participants</span>
          </div>

          {/* Body */}
          <div className="meet-body">
            {/* Remote participants grid — only remote videos here */}
            <div className="conference-area">
              {videos.length === 0 ? (
                /* Waiting state when alone */
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  justifyContent: "center", height: "100%", color: "rgba(255,255,255,0.3)", gap: "0.75rem" }}>
                  <span style={{ fontSize: "2.5rem" }}>👋</span>
                  <p style={{ fontSize: "0.9rem" }}>Waiting for others to join...</p>
                </div>
              ) : (
                videos.map((v) => {
                  const hasVideo = v.stream?.getVideoTracks().length > 0 &&
                    v.stream.getVideoTracks()[0].enabled;
                  return (
                    <div key={v.socketId} className="video-box">
                      {hasVideo ? (
                        <video ref={(ref) => { if (ref && v.stream) ref.srcObject = v.stream; }} autoPlay />
                      ) : (
                        <AvatarTile name="User" />
                      )}
                      <div className="tile-label">User</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat panel */}
            {showModal && (
              <div className="chat-panel">
                <div className="chat-panel-header">
                  <h3>Chat</h3>
                  <button className="chat-close-btn" onClick={() => setModal(false)}>✕</button>
                </div>
                <div className="chat-messages">
                  {messages.length === 0 ? (
                    <p className="chat-empty">No messages yet. Say hello! 👋</p>
                  ) : messages.map((item, index) => (
                    <div className="chat-message" key={index}>
                      <div className="sender">{item.sender}</div>
                      <div className="msg-text">{item.data}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input className="chat-input" placeholder="Type a message..."
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && message && sendMessage()} />
                  <button className="chat-send-btn" onClick={sendMessage}>Send</button>
                </div>
              </div>
            )}
          </div>

          {/* Self view — bottom-right PiP */}
          <div className="self-view">
            {video ? (
              <video ref={localVideoref} autoPlay muted />
            ) : (
              <div className="avatar-tile">
                <div className="avatar-circle">{username ? username[0].toUpperCase() : "U"}</div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="controls-bar">
            <button className={`ctrl-btn ${video ? "active" : "off"}`} onClick={handleVideo}
              title={video ? "Turn off camera" : "Turn on camera"}>
              {video ? <VideocamIcon style={{ fontSize: "1.3rem" }} /> : <VideocamOffIcon style={{ fontSize: "1.3rem" }} />}
            </button>

            <button className={`ctrl-btn ${audio ? "active" : "off"}`} onClick={handleAudio}
              title={audio ? "Mute" : "Unmute"}>
              {audio ? <MicIcon style={{ fontSize: "1.3rem" }} /> : <MicOffIcon style={{ fontSize: "1.3rem" }} />}
            </button>

            {screenAvailable && (
              <button className={`ctrl-btn ${screen ? "active" : ""}`} onClick={handleScreen}
                title={screen ? "Stop sharing" : "Share screen"}>
                {screen ? <ScreenShareIcon style={{ fontSize: "1.3rem" }} /> : <StopScreenShareIcon style={{ fontSize: "1.3rem" }} />}
              </button>
            )}

            <div className="ctrl-badge">
              <button className={`ctrl-btn ${showModal ? "active" : ""}`}
                onClick={() => { setModal(!showModal); setNewMessages(0); }} title="Chat">
                <ChatIcon style={{ fontSize: "1.3rem" }} />
              </button>
              {newMessages > 0 && !showModal && (
                <div className="ctrl-badge-count">{newMessages}</div>
              )}
            </div>

            <button className="ctrl-btn danger" onClick={handleEndCall} title="End call">
              <CallEndIcon style={{ fontSize: "1.3rem" }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}