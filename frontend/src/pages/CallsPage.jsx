import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Phone } from "lucide-react";
import MeetingHeader from "../components/MeetingHeader";
import MeetingSidebar from "../components/MeetingSidebar";

export default function CallsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState(""); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [callHistory, setCallHistory] = useState([]);
  const [time, setTime] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);

  const contacts = [
    { name: "Rakesh", email: "rakesh@gmail.com" },
    { name: "Rahul", email: "rahul@gmail.com" },
    { name: "Anitha", email: "anitha@gmail.com" },
    { name: "Kiran", email: "kiran@gmail.com" },
  ];

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/calls/history")
      .then((res) => res.json())
      .then((data) => setCallHistory(Array.isArray(data) ? data : []))
      .catch(() => setCallHistory([]));
  }, []);

  const startCall = async (contact) => {
    const roomId = Math.random().toString(36).substring(2, 8);

    try {
      await fetch("http://127.0.0.1:8000/api/calls/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...contact, room_id: roomId }),
      });
    } catch {}

    navigate(`/room/${roomId}`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#f8f9fa] relative">

      <MeetingHeader toggleSidebar={() => setSidebarOpen(prev => !prev)} />

      {/* ✅ CLOCK */}
      

      {/* ✅ PROFILE */}
      <div className="absolute top-3 right-6">
        

        {profileOpen && (
          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md w-40">
            <button
              className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Switch Account
            </button>
            <button
              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/login");
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">

        <MeetingSidebar isOpen={sidebarOpen} />

        <div className="flex-1 flex flex-col items-center overflow-y-auto px-6 py-10">

          <div className="w-full max-w-2xl flex items-center bg-white shadow-md rounded-full px-6 py-3">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts or dial a number"
              className="ml-3 w-full outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="w-full max-w-xl mt-10 space-y-4">
            {filteredContacts.map((contact, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-white p-4 rounded-xl shadow hover:shadow-md transition"
              >
                <div>
                  <h2 className="font-semibold">{contact.name}</h2>
                  <p className="text-gray-500 text-sm">{contact.email}</p>
                </div>

                <button
                  onClick={() => startCall(contact)}
                  className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
                >
                  <Phone size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="w-full max-w-xl mt-12">
            <h2 className="font-semibold mb-4 text-gray-700">
              Recent Calls
            </h2>

            {callHistory.length > 0 ? (
              callHistory.map((call, index) => (
                <div
                  key={index}
                  className="bg-white p-3 rounded-lg shadow mb-2 flex justify-between items-center"
                >
                  <span>{call.name}</span>

                  <button
                    onClick={() => navigate(`/room/${call.room_id}`)}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Join
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No call history</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}