import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ChevronLeft, ChevronRight } from 'lucide-react';
import MeetingHeader from '../components/MeetingHeader';
import MeetingSidebar from '../components/MeetingSidebar';
import InviteModal from '../components/InviteModal';

import img1 from '../assets/illustration.png';
import img2 from '../assets/hero.png';

export default function LandingPage() {
  const [meetingCode, setMeetingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [laterRoomId, setLaterRoomId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const images = [img1, img2];

  const dropdownRef = useRef(null);

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, [user, navigate]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStartInstantMeeting = async () => {
    setIsLoading(true);
    setShowDropdown(false);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/meetings/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      navigate(`/room/${data.room_id || Math.random().toString(36).substring(7)}`);
    } catch {
      navigate(`/room/${Math.random().toString(36).substring(7)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMeetingLater = async () => {
    setIsLoading(true);
    setShowDropdown(false);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/meetings/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      setLaterRoomId(data.room_id || Math.random().toString(36).substring(7));
      setShowInviteModal(true);
    } catch {
      setLaterRoomId(Math.random().toString(36).substring(7));
      setShowInviteModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingCode.trim()) {
      navigate(`/room/${meetingCode.trim()}`);
    }
  };

  const handleSwitchAccount = () => {
    localStorage.removeItem("user");

    if (window.google && window.google.accounts) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.cancel();
    }

    window.location.href = "/login";
  };

  const handleManageAccount = () => {
    window.open("https://myaccount.google.com/", "_blank");
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] relative">

      <MeetingHeader
        toggleSidebar={() => setSidebarOpen(prev => !prev)}
        onSwitchAccount={handleSwitchAccount}
        onManageAccount={handleManageAccount}
      />

      <div className="flex flex-1 overflow-hidden">

        <MeetingSidebar isOpen={sidebarOpen} />

        <main className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 gap-12 overflow-y-auto">

          <div className="flex-1 max-w-xl">
            <h1 className="text-5xl text-gray-800 mb-6">
              Video calls and meetings for everyone
            </h1>

            <p className="text-gray-500 text-xl mb-10">
              Connect, collaborate and celebrate from anywhere
            </p>

            <div className="flex flex-col sm:flex-row gap-4">

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-md"
                >
                  <Video size={18} />
                  {isLoading ? "Loading..." : "New meeting"}
                </button>

                {showDropdown && (
                  <div className="absolute mt-2 bg-blue-100 text-black shadow-lg rounded-lg w-64">
                    <button onClick={handleCreateMeetingLater} className="block px-4 py-3 hover:bg-gray-100 w-full text-left">
                      Create for later
                    </button>
                    <button onClick={handleStartInstantMeeting} className="block px-4 py-3 hover:bg-gray-100 w-full text-left">
                      Start instant
                    </button>
                    <button onClick={() => navigate("/calendar")} className="block px-4 py-3 hover:bg-gray-100 w-full text-left">
                      Schedule
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleJoinMeeting} className="flex gap-2 w-full">
                <input
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 border px-3 py-2 rounded-md text-black"
                />
                <button className="text-blue-600 font-semibold">Join</button>
              </form>

            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <img src={images[currentImage]} className="w-full max-w-md" />

            <div className="flex gap-4 mt-6">
              <button onClick={() => setCurrentImage(prev => prev === 0 ? images.length - 1 : prev - 1)}>
                <ChevronLeft />
              </button>

              <button onClick={() => setCurrentImage(prev => (prev + 1) % images.length)}>
                <ChevronRight />
              </button>
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