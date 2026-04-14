import { Menu, HelpCircle, MessageSquare, Settings, Grid, User } from 'lucide-react';
import { format } from 'date-fns';

export default function MeetingHeader() {
  const currentTime = format(new Date(), 'HH:mm • EEE, d MMM');

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white text-gray-700 border-b border-gray-100 h-16 shadow-sm">
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-18 h-18 rounded flex items-center justify-center overflow-hidden">
  <img
    src="/logo.jpg"
    alt="Logo"
    className="w-full h-full object-contain"
  />
</div>
          <span className="text-xl font-medium text-gray-600 tracking-tight">
            Shnoor <span className="font-normal text-gray-500">International LLC Meetings</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="text-gray-500 mr-4 font-medium hidden md:block">
          {currentTime}
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600">
            <HelpCircle size={22} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600">
            <MessageSquare size={22} />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600">
            <Settings size={22} />
          </button>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button className="p-2.5 hover:bg-gray-100 rounded-full text-gray-600">
            <Grid size={22} />
          </button>
          <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center ml-2 border-2 border-white shadow-sm cursor-pointer">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
