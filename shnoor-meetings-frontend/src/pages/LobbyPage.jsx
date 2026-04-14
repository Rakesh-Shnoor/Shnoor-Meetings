import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Settings, MoreVertical, Shield, User, Monitor, Sparkles } from 'lucide-react';
import MeetingHeader from '../components/MeetingHeader';
import { motion } from 'framer-motion';

export default function LobbyPage() {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [stream, setStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    async function startPreview() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices for preview:", err);
      }
    }
    startPreview();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const joinMeeting = () => {
    // Stop preview tracks before entering the real room to avoid hardware collision
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(`/meeting/${roomId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans overflow-hidden transition-all">
      <MeetingHeader />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-8 md:gap-16 max-w-7xl mx-auto w-full">
        {/* Left Side: Video Preview & Settings */}
        <div className="flex-[1.4] w-full flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <div 
              className="relative aspect-video bg-gray-900 rounded-lg shadow-xl overflow-hidden group"
            >
              {isVideoOn ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover mirror"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                    <h3 className="text-white text-xl md:text-2xl font-normal max-w-md leading-relaxed">
                      Do you want people to see and hear you in the meeting?
                    </h3>
                    <button 
                      onClick={() => { setIsMicOn(true); setIsVideoOn(true); }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md font-medium transition-all"
                    >
                      Allow microphone and camera
                    </button>
                  </div>
                </div>
              )}
              
              {/* Name Overlay */}
              <div className="absolute top-4 left-4 text-white text-sm font-medium drop-shadow-md">
                Prabhas Palle
              </div>

              {/* Three Dots Menu */}
              <button className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                <MoreVertical size={20} />
              </button>

              {/* Round Controls at Bottom */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <button 
                  onClick={toggleMic}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-red-500 text-white border border-red-400 shadow-lg'}`}
                >
                  {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
                  {!isMicOn && <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">!</span>}
                </button>
                <button 
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOn ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-red-500 text-white border border-red-400 shadow-lg'}`}
                >
                  {isVideoOn ? <Video size={22} /> : <VideoOff size={22} />}
                  {!isVideoOn && <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-black font-bold">!</span>}
                </button>
                <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all">
                  <Grid size={22} />
                </button>
              </div>
            </div>

            {/* Permission Pills at bottom of video box */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 overflow-x-auto pb-2">
              <PermissionPill icon={<Mic size={14}/>} label="Permission n..." />
              <PermissionPill icon={<Monitor size={14}/>} label="Permission n..." />
              <PermissionPill icon={<Video size={14}/>} label="Permission n..." />
              <PermissionPill icon={<Sparkles size={14}/>} label="Permission n..." />
            </div>
          </div>
        </div>

        {/* Right Side: Join Panel */}
        <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center space-y-6">
          <h2 className="text-3xl font-normal text-gray-800">Ready to join?</h2>
          
          {/* Mock Gemini Section */}
          <div className="w-full bg-blue-50/50 border border-blue-100/50 rounded-2xl p-4 flex items-start gap-4">
            <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
              <Sparkles size={18} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">Shnoor International LLC AI</p>
                <button className="text-xs text-blue-600 font-bold hover:bg-blue-50 px-3 py-1 rounded-md transition-all">Start</button>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">Share notes and transcript with participants</p>
            </div>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button 
              onClick={joinMeeting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-full shadow-lg shadow-blue-100 transition-all transform active:scale-95 text-md"
            >
              Ask to join
            </button>
            
            <button className="w-full flex items-center justify-center gap-2 text-gray-700 hover:bg-gray-100 font-medium py-3 rounded-md border border-gray-200 transition-all text-sm group">
              Other ways to join
              <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
}

function PermissionPill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 border border-gray-100 rounded-full hover:bg-gray-50 cursor-pointer transition-colors group">
      <span className="text-gray-400 group-hover:text-blue-500">{icon}</span>
      <span className="text-[11px] text-gray-500 font-medium truncate max-w-[80px]">{label}</span>
      <ChevronDown size={14} className="text-gray-300" />
    </div>
  );
}

import { ChevronDown, Grid } from 'lucide-react';
