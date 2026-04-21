import { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  PhoneOff,
  Monitor,
  Hand
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MeetingControls({
  roomId,
  onToggleVideo,
  onToggleAudio,
  onToggleScreenShare,
  onToggleRaiseHand,
  isSharingScreen,
  isHandRaised,
  toggleChatVisibility,
  hasUnreadMessages
}) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const navigate = useNavigate();

  // 🎥 VIDEO
  const handleVideo = () => {
    setIsVideoOn(prev => !prev);
    onToggleVideo();
  };

  // 🎤 AUDIO
  const handleAudio = () => {
    setIsAudioOn(prev => !prev);
    onToggleAudio();
  };

  // 📞 LEAVE CALL
  const leaveCall = () => {
    navigate(`/left-meeting/${roomId}`);
  };

  // 🎨 COMMON BUTTON STYLE
  const btnBase =
    "p-4 rounded-full transition-all flex items-center justify-center transform hover:scale-110 shadow-lg";

  return (
    <div className="flex items-center justify-center gap-4 py-6 px-4 bg-gray-900">

      {/* 🎤 MIC */}
      <button
        onClick={handleAudio}
        title={isAudioOn ? "Mute" : "Unmute"}
        className={`${btnBase} ${
          isAudioOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {isAudioOn ? <Mic size={22} /> : <MicOff size={22} />}
      </button>

      {/* 🎥 CAMERA */}
      <button
        onClick={handleVideo}
        title={isVideoOn ? "Stop Video" : "Start Video"}
        className={`${btnBase} ${
          isVideoOn
            ? "bg-gray-700 hover:bg-gray-600 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
      </button>

      {/* 📺 SCREEN SHARE */}
      <button
        onClick={onToggleScreenShare}
        title={isSharingScreen ? "Stop Presenting" : "Present Screen"}
        className={`${btnBase} ${
          isSharingScreen
            ? "bg-blue-600 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
      >
        <Monitor size={22} />
      </button>

      {/* ✋ RAISE HAND */}
      <button
        onClick={onToggleRaiseHand}
        title={isHandRaised ? "Lower Hand" : "Raise Hand"}
        className={`${btnBase} ${
          isHandRaised
            ? "bg-yellow-500 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-white"
        }`}
      >
        <Hand size={22} />
      </button>

      {/* 💬 CHAT */}
      <button
        onClick={toggleChatVisibility}
        title="Toggle Chat"
        className={`${btnBase} bg-gray-700 hover:bg-gray-600 text-white hidden md:flex relative`}
      >
        <MessageSquare size={22} />

        {/* 🔴 UNREAD DOT */}
        {hasUnreadMessages && (
          <span className="absolute top-1 right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* 🔴 LEAVE BUTTON */}
      <button
        onClick={leaveCall}
        className={`${btnBase} bg-red-600 hover:bg-red-700 text-white px-8 ml-4 rounded-full font-bold uppercase tracking-wider text-sm flex items-center gap-2`}
      >
        <PhoneOff size={22} />
        <span className="hidden sm:inline">Leave</span>
      </button>
    </div>
  );
}