import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoGrid from '../components/VideoGrid';
import MeetingControls from '../components/MeetingControls';
import { Send, Users, Info, Video } from 'lucide-react';

export default function MeetingRoom() {
  const { id: roomId } = useParams();

  // 🔥 USER (MOVED INSIDE COMPONENT)
  const user = JSON.parse(localStorage.getItem("user"));

  const {
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
  } = useWebRTC(roomId);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const hasHadParticipants = useRef(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChatMessage(chatInput.trim());
      setChatInput('');
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatOpen]);

  // 🔥 AUTO REDIRECT WHEN ALL LEAVE
  useEffect(() => {
    const remoteParticipantCount = Object.keys(remoteStreams).length;

    if (remoteParticipantCount > 0) {
      hasHadParticipants.current = true;
    } else if (hasHadParticipants.current && remoteParticipantCount === 0) {
      const timeout = setTimeout(() => {
        navigate(`/left-meeting/${roomId}`);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [remoteStreams, roomId, navigate]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    alert('Meeting code copied!');
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col overflow-hidden text-white">

      {/* HEADER */}
      <header className="w-full p-4 flex justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-semibold hidden sm:block">Shnoor Meetings</span>

          <span onClick={copyRoomCode} className="cursor-pointer text-sm bg-gray-800 px-2 py-1 rounded ml-4">
            Code: {roomId}
          </span>
        </div>

        {/* 👤 USER INFO */}
        <div className="flex items-center gap-3">
          {user && (
            <>
              <img src={user.picture} className="w-8 h-8 rounded-full" />
              <span>{user.name}</span>
            </>
          )}
          <Users />
          <span>{1 + Object.keys(remoteStreams).length}</span>
        </div>
      </header>

      {/* MAIN */}
      <div className="flex-1 flex gap-4 p-4">

        {/* VIDEO */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center">

            {!localStream ? (
              <div className="text-center">
                <Video size={40} />
                <p>{mediaError ? "Camera error" : "Waiting for camera..."}</p>
              </div>
            ) : (
              <VideoGrid
                localStream={localStream}
                remoteStreams={remoteStreams}
                participantsMetadata={participantsMetadata}
                localHandRaised={isHandRaised}
              />
            )}

          </div>

          <MeetingControls
            roomId={roomId}
            onToggleVideo={toggleVideo}
            onToggleAudio={toggleAudio}
            onToggleScreenShare={toggleScreenShare}
            onToggleRaiseHand={toggleRaiseHand}
            isSharingScreen={isSharingScreen}
            isHandRaised={isHandRaised}
            toggleChatVisibility={() => setIsChatOpen(!isChatOpen)}
          />
        </div>

        {/* 💬 CHAT */}
        {isChatOpen && (
          <div className="w-80 bg-gray-800 flex flex-col">

            <div className="p-3 border-b">Chat</div>

            <div className="flex-1 overflow-y-auto p-3">
              {messages.map((m, i) => (
                <div key={i}>
                  <b>{m.sender}</b>: {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-2 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 p-2 rounded bg-gray-700"
              />
              <button className="bg-blue-500 px-3 rounded">
                <Send size={16}/>
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}