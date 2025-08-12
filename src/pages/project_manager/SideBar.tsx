import { Link } from "react-router-dom";
import React from 'react';

const Sidebar: React.FC<{
  activeTab: string;
  onTabClick: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}> = ({ activeTab, onTabClick, isOpen, onClose }) => {
  // Get user data from localStorage
  const userDataString = localStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  
  // Extract user information with fallbacks
  const userName = userData?.fullname || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole =  'Project Manager';

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-[#1a0a2e] text-white flex flex-col transition-transform duration-300 z-40
      ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      lg:translate-x-0 lg:flex`}
    >
      <div className="p-5 border-b border-white/10 text-center">
        <Link to="/" className="flex items-center justify-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-full bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] flex items-center justify-center">
            <i className="fas fa-project-diagram text-2xl"></i>
          </div>
          <div className="text-2xl font-bold">LEGASI</div>
        </Link>
        <div className="flex items-center gap-2.5 p-2.5 bg-white/10 rounded-lg mt-2.5">
          <div className="w-10 h-10 rounded-full bg-[#880088] flex items-center justify-center font-bold text-xl">
            {userInitial}
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">{userName}</div>
            <div className="text-xs text-white/70">{userRole}</div>
          </div>
        </div>
      </div>
    <nav className="flex-1 p-2.5">
      <ul>
        {[
          { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
          { id: 'projects', icon: 'fas fa-project-diagram', label: 'My Projects' },
          { id: 'data-entry', icon: 'fas fa-file-upload', label: 'Data Entry' },
          { id: 'profile', icon: 'fas fa-user', label: 'Profile' }
        ].map(item => (
          <li key={item.id} className="mb-1">
            <button
              onClick={() => {
                onTabClick(item.id);
                onClose(); // Close on mobile
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id ? 'bg-[#880088] text-white' : 'text-white/80 hover:bg-[#880088]/50'
              }`}
            >
              <i className={`${item.icon} w-6 text-center`}></i>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
    <div className="p-4 border-t border-white/10 text-center text-xs text-white/60">
      <p>LEGASI &copy; {new Date().getFullYear()}</p>
    </div>
  </div>
);
};

export default Sidebar