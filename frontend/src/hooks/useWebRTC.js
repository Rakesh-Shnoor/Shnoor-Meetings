import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebRTC(roomId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [messages, setMessages] = useState([]);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [participantsMetadata, setParticipantsMetadata] = useState({});
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [mediaError, setMediaError] = useState(null);

  const clientId = useRef(Math.random().toString(36).substring(7));
  const ws = useRef(null);
  const peerConnections = useRef({});
  const originalStream = useRef(null);
  const activeStreamsRef = useRef([]);

  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startConnection = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        originalStream.current = stream;
        activeStreamsRef.current.push(stream);
        setLocalStream(stream);

        const socket = new WebSocket(
          `ws://127.0.0.1:8000/ws/${roomId}/${clientId.current}`
        );
        ws.current = socket;

        // ✅ CONNECT
        socket.onopen = () => {
          console.log("✅ WebSocket connected");

          socket.send(JSON.stringify({
            type: "user-joined",
            sender: clientId.current
          }));
        };

        // ✅ RECEIVE SIGNALS
        socket.onmessage = async (event) => {
          if (cancelled) return;
          const msg = JSON.parse(event.data);
          handleSignalingData(msg, stream);
        };

        socket.onerror = (err) => {
          console.error("❌ WebSocket error:", err);
        };

        socket.onclose = () => {
          console.log("WebSocket closed");
        };

      } catch (err) {
        if (cancelled) return;
        console.error("Media error:", err);
        setMediaError(
          err.name === 'NotAllowedError'
            ? 'Permission Denied'
            : 'Media Device Error'
        );
      }
    };

    startConnection();

    return () => {
      cancelled = true;
      console.log("Cleaning up WebRTC...");

      activeStreamsRef.current.forEach(stream => {
        stream?.getTracks().forEach(track => track.stop());
      });

      // ✅ IMPORTANT FIX (user leaves)
      if (ws.current) {
        ws.current.send(JSON.stringify({
          type: "user-left",
          sender: clientId.current
        }));
        ws.current.close();
      }

      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
    };
  }, [roomId]);

  // 🚀 CREATE PEER CONNECTION
  const createPeerConnection = (senderId, stream) => {

    // ✅ prevent duplicate
    if (peerConnections.current[senderId]) {
      return peerConnections.current[senderId];
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ],
      iceCandidatePoolSize: 10
    });

    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignalingMessage({
          type: "ice-candidate",
          target: senderId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];

      setRemoteStreams(prev => {
        if (prev[senderId]) return prev;
        return { ...prev, [senderId]: remoteStream };
      });
    };

    pc.onconnectionstatechange = () => {
      console.log("Connection:", pc.connectionState);
    };

    peerConnections.current[senderId] = pc;
    return pc;
  };

  // 🧠 SIGNAL HANDLER
  const handleSignalingData = async (data, stream) => {
    const { type, sender, target } = data;

    if (sender === clientId.current) return;
    if (target && target !== clientId.current) return;

    switch (type) {
      case "user-joined":
        const pc = createPeerConnection(sender, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sendSignalingMessage({ type: "offer", target: sender, offer });
        break;

      case "offer":
        const pcOffer = createPeerConnection(sender, stream);
        await pcOffer.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pcOffer.createAnswer();
        await pcOffer.setLocalDescription(answer);
        sendSignalingMessage({ type: "answer", target: sender, answer });
        break;

      case "answer":
        const pcAnswer = peerConnections.current[sender];
        if (pcAnswer) {
          await pcAnswer.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
        break;

      case "ice-candidate":
        const pcIce = peerConnections.current[sender];
        if (pcIce) {
          await pcIce.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;

      case "user-left":
        if (peerConnections.current[sender]) {
          peerConnections.current[sender].close();
          delete peerConnections.current[sender];

          setRemoteStreams(prev => {
            const updated = { ...prev };
            delete updated[sender];
            return updated;
          });
        }
        break;

      case "chat":
        addMessage({ sender: data.sender, text: data.text });
        break;

      case "raise-hand":
        setParticipantsMetadata(prev => ({
          ...prev,
          [sender]: { isHandRaised: true }
        }));
        break;

      case "lower-hand":
        setParticipantsMetadata(prev => ({
          ...prev,
          [sender]: { isHandRaised: false }
        }));
        break;

      default:
        break;
    }
  };

  const sendSignalingMessage = (msg) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        ...msg,
        sender: clientId.current
      }));
    }
  };

  // 🎥 CONTROLS
  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  };

  const toggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isSharingScreen) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        Object.values(peerConnections.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          sender?.replaceTrack(screenTrack);
        });

        screenTrack.onended = () => stopScreenShare();

        setLocalStream(screenStream);
        setIsSharingScreen(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error("Screen share error:", err);
    }
  };

  const stopScreenShare = () => {
    const camTrack = originalStream.current.getVideoTracks()[0];

    Object.values(peerConnections.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === "video");
      sender?.replaceTrack(camTrack);
    });

    setLocalStream(originalStream.current);
    setIsSharingScreen(false);
  };

  const toggleRaiseHand = () => {
    const state = !isHandRaised;
    setIsHandRaised(state);
    sendSignalingMessage({ type: state ? "raise-hand" : "lower-hand" });
  };

  const sendChatMessage = (text) => {
    sendSignalingMessage({ type: "chat", text });
    addMessage({ sender: "Me", text });
  };

  return {
    localStream,
    remoteStreams,
    messages,
    participantsMetadata,
    isSharingScreen,
    isHandRaised,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    toggleRaiseHand,
    sendChatMessage,
    mediaError
  };
}