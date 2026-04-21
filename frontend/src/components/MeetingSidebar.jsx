import { Video, Phone } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function MeetingSidebar({ isOpen }) {

  const activeClass =
    "w-full flex items-center gap-4 px-4 py-3 bg-blue-50 text-blue-700 rounded-full font-medium shadow-sm transition-all group";

  const inactiveClass =
    "w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 text-gray-500 rounded-full font-medium transition-all group";

  return (
    <aside
      className={`bg-white h-screen border-r border-gray-100 flex flex-col py-6 transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <nav className="space-y-2 px-2">

        {/* 🔵 MEETINGS */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? activeClass : inactiveClass
          }
        >
          <Video
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          {isOpen && <span>Meetings</span>}
        </NavLink>

        {/* 🟢 CALLS */}
        <NavLink
          to="/calls"
          className={({ isActive }) =>
            isActive ? activeClass : inactiveClass
          }
        >
          <Phone
            size={20}
            className="group-hover:scale-110 transition-transform"
          />
          {isOpen && <span>Calls</span>}
        </NavLink>

      </nav>
    </aside>
  );
}