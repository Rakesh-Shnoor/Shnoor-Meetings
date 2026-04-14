import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard, Plus, Link, Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import MeetingHeader from '../components/MeetingHeader';
import MeetingSidebar from '../components/MeetingSidebar';
import InviteModal from '../components/InviteModal';
import illustration from '../assets/illustration.png';

export default function LandingPage() {
  const [meetingCode, setMeetingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [laterRoomId, setLaterRoomId] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartInstantMeeting = async () => {
    setIsLoading(true);
    setShowDropdown(false);
    try {
      const response = await fetch('http://localhost:8000/api/meetings/create', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.room_id) {
        navigate(`/room/${data.room_id}`);
      }
    } catch (err) {
      console.error('Failed to create instant meeting:', err);
      navigate(`/room/${Math.random().toString(36).substring(7)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeetingLater = async () => {
    setIsLoading(true);
    setShowDropdown(false);
    try {
      const response = await fetch('http://localhost:8000/api/meetings/create', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.room_id) {
        setLaterRoomId(data.room_id);
        setShowInviteModal(true);
      }
    } catch (err) {
      console.error('Failed to create meeting for later:', err);
      setLaterRoomId(Math.random().toString(36).substring(7));
      setShowInviteModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleCalendar = () => {
    setShowDropdown(false);
    navigate('/calendar');
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/room/${meetingCode.trim()}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <MeetingHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <MeetingSidebar />
        
        <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 gap-12 overflow-y-auto">
          {/* Left Column: Call to Action */}
          <div className="flex-1 max-w-xl text-left">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-800 leading-tight mb-6">
              Video calls and meetings for everyone
            </h1>
            <p className="text-gray-500 text-xl mb-12 font-light">
              Connect, collaborate and celebrate from anywhere with Shnoor International LLC
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* New Meeting Dropdown */}
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  <Video size={18} />
                  {isLoading ? 'Loading...' : 'New meeting'}
                </button>

                {showDropdown && (
                  <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                    <button
                      onClick={handleCreateMeetingLater}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <Link size={18} className="text-gray-500 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Create a meeting for later</span>
                    </button>
                    <button
                      onClick={handleStartInstantMeeting}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 transition-colors group"
                    >
                      <Plus size={18} className="text-gray-500 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Start an instant meeting</span>
                    </button>
                    <button
                      onClick={handleScheduleCalendar}
                      className="w-full flex items-center gap-4 px-6 py-3 text-left hover:bg-gray-50 border-t border-gray-100 transition-colors group"
                    >
                      <Calendar size={18} className="text-gray-500 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Schedule in Shnoor Calendar</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Join Meeting Input */}
              <form onSubmit={handleJoinMeeting} className="flex flex-1 items-center gap-2">
                <div className="flex-1 flex items-center gap-3 border border-gray-300 rounded-md px-3 py-2.5 focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
                  <Keyboard size={20} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Enter a code or link"
                    className="bg-transparent border-none outline-none text-gray-800 w-full placeholder-gray-500 text-sm"
                    value={meetingCode}
                    onChange={(e) => setMeetingCode(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!meetingCode.trim()}
                  className={`font-semibold px-4 transition-colors ${
                    meetingCode.trim() 
                      ? 'text-blue-600 hover:text-blue-700' 
                      : 'text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Join
                </button>
              </form>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <p className="text-gray-500 text-sm">
                <a href="#" className="text-blue-600 hover:underline">Learn more</a> about Shnoor Meetings
              </p>
            </div>
          </div>

          {/* Right Column: Carousel/Illustration */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative group max-w-lg">
              <div className="bg-blue-50/50 rounded-full p-12 mb-6">
                <img 
                  src={illustration} 
                  alt="Meeting Illustration" 
                  className="w-full h-auto drop-shadow-xl transform group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl font-medium text-gray-800">Get a link you can share</h3>
                <p className="text-gray-500 text-center text-sm max-w-sm">
                  Click <strong>New meeting</strong> to get a link you can send to people you want to meet with
                </p>
                
                <div className="flex items-center gap-4 mt-8">
                  <button className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 shadow-sm transition-colors">
                    <ChevronLeft size={20} className="text-gray-500" />
                  </button>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-full border border-gray-200 shadow-sm transition-colors">
                    <ChevronRight size={20} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <InviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
        roomId={laterRoomId} 
      />
    </div>
  );
}
