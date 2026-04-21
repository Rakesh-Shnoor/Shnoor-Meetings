import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Keyboard, Plus, Link, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // 🔐 USER DATA
  const user = JSON.parse(localStorage.getItem("user"));

  // 🔐 LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  // Close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🎥 CREATE MEETING
  const handleStartInstantMeeting = async () => {
    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/meetings/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (data.room_id) {
        navigate(`/room/${data.room_id}`);
      }

    } catch (err) {
      console.error('Failed:', err);
      navigate(`/room/${Math.random().toString(36).substring(7)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeetingLater = async () => {
    setIsLoading(true);
    setShowDropdown(false);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/meetings/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      if (data.room_id) {
        setLaterRoomId(data.room_id);
        setShowInviteModal(true);
      }

    } catch (err) {
      console.error(err);
      setLaterRoomId(Math.random().toString(36).substring(7));
      setShowInviteModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/room/${meetingCode}`);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* HEADER */}
      <MeetingHeader />

      {/* 🔥 USER + LOGOUT (TOP RIGHT) */}
      <div className="absolute top-4 right-6 flex items-center gap-3 z-50">
        {user && (
          <>
            <img src={user.picture} className="w-8 h-8 rounded-full" />
            <span className="text-sm font-medium">{user.name}</span>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <MeetingSidebar />

        <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 py-12 gap-12">

          {/* LEFT */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl text-gray-800 mb-6">
              Video calls and meetings for everyone
            </h1>

            <p className="text-gray-500 mb-8">
              Connect, collaborate and celebrate from anywhere
            </p>

            {/* BUTTONS */}
            <div className="flex gap-4" ref={dropdownRef}>

              <button
                onClick={handleStartInstantMeeting}
                className="bg-blue-600 text-white px-6 py-3 rounded"
              >
                <Video size={18}/> New meeting
              </button>

              <form onSubmit={handleJoinMeeting} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  className="border px-3 py-2 rounded"
                />
                <button className="text-blue-600">Join</button>
              </form>

            </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1">
            <img src={illustration} alt="img" />
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