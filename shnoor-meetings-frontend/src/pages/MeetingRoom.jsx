import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWebRTC } from '../hooks/useWebRTC';
import VideoGrid from '../components/VideoGrid';
import MeetingControls from '../components/MeetingControls';
import { Send, Users, Info, Video } from 'lucide-react';

export default function MeetingRoom() {
  const { id: roomId } = useParams();
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

  // Handle auto-redirect when everyone else leaves
  useEffect(() => {
    const remoteParticipantCount = Object.keys(remoteStreams).length;
    
    if (remoteParticipantCount > 0) {
      hasHadParticipants.current = true;
    } else if (hasHadParticipants.current && remoteParticipantCount === 0) {
      // Small delay to ensure state has settled and it's not a transient state
      const timeout = setTimeout(() => {
        navigate(`/left-meeting/${roomId}`);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [remoteStreams, roomId, navigate]);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    alert('Meeting code copied to clipboard!');
  };

  return (
    <div className="h-screen w-full bg-gray-900 flex flex-col overflow-hidden text-white font-sans">
      {/* Top Header */}
      <header className="w-full p-4 flex items-center justify-between border-b border-gray-800 bg-gray-900/90 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse border border-red-400"></div>
          <span className="font-semibold text-lg tracking-wide hidden sm:block">Shnoor Meetings</span>
          <span className="text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded border border-gray-700 ml-4 hidden md:inline-flex items-center cursor-pointer hover:bg-gray-700" onClick={copyRoomCode}>
            Code: {roomId} <Info size={14} className="ml-2" />
          </span>
        </div>
        <div className="flex items-center text-gray-400">
          <Users size={20} className="mr-2" /> 
          <span className="font-medium">{1 + Object.keys(remoteStreams).length}</span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden p-4 relative w-full h-full gap-4">
        
        {/* Main Video Grid */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isChatOpen ? 'pr-0 md:pr-4 md:w-3/4' : 'w-full'}`}>
          <div className="flex-1 rounded-2xl overflow-hidden flex items-center justify-center p-2">
            {!localStream ? (
              <div className="flex flex-col items-center gap-6 text-center animate-in fade-in duration-700">
                <div className={`p-8 rounded-full bg-gray-800 ${!mediaError ? 'animate-pulse' : ''} border border-gray-700 transition-all`}>
                  <Video size={48} className={mediaError ? 'text-red-500' : 'text-blue-500'} />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-2">
                    {mediaError ? 'Camera/Mic Access Failed' : 'Ready to join?'}
                  </h3>
                  <p className="text-gray-400 max-w-sm">
                    {mediaError 
                      ? `We couldn't access your hardware: ${mediaError}. Please check your browser permissions.`
                      : 'We are requesting access to your camera and microphone. Please click "Allow" in the browser prompt.'}
                  </p>
                  {mediaError && (
                    <button 
                      onClick={() => window.location.reload()}
                      className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg transition-all transform active:scale-95"
                    >
                      Retry Access
                    </button>
                  )}
                </div>
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
          
          {/* Floating Action Menu aligned bottom center */}
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

        {/* Sliding Chat Sidebar */}
        {isChatOpen && (
          <aside className="fixed inset-y-0 right-0 z-20 w-80 bg-gray-800 border-l border-gray-700 flex flex-col shadow-2xl md:relative md:rounded-xl md:my-2 md:mr-2">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800 rounded-t-xl">
              <h2 className="font-semibold text-lg">In-call messages</h2>
              <button className="text-gray-400 hover:text-white md:hidden" onClick={() => setIsChatOpen(false)}>✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm text-center px-4">
                  Messages can only be seen by people in the call and are deleted when the call ends.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div key={idx} className={`flex flex-col ${m.sender === 'Me' ? 'items-end' : 'items-start'}`}>
                    <span className="text-xs text-gray-400 mb-1">{m.sender === 'Me' ? 'You' : m.sender}</span>
                    <div className={`px-4 py-2 rounded-2xl md:max-w-[85%] break-words ${m.sender === 'Me' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-700 text-white rounded-tl-none'}`}>
                      {m.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800 rounded-b-xl">
              <div className="flex items-center bg-gray-700 rounded-full pr-1 shadow-inner focus-within:ring-2 focus-within:ring-blue-500">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-transparent border-none outline-none text-white py-3 px-4 placeholder-gray-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full disabled:opacity-50 transition-colors m-1"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>
    </div>
  );
}
