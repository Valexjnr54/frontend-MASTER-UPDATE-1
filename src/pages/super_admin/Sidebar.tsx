import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar: React.FC<{ activeTab: string; onTabClick: (tab: string) => void }> = ({ activeTab, onTabClick }) => (
  <div className="h-full w-full bg-[#1a0a2e] text-white flex flex-col">
    <div className="p-5 border-b border-white/10 text-center">
      <Link to="/" className="flex items-center justify-center gap-2 mb-3">
        <div className="w-12 h-12 rounded-full bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] flex items-center justify-center">
          <i className="fas fa-crown text-2xl"></i>
        </div>
        <div className="text-2xl font-bold">LEGASI</div>
      </Link>
      <div className="flex items-center gap-2.5 p-2.5 bg-white/10 rounded-lg mt-2.5">
        <div className="w-10 h-10 rounded-full bg-[#880088] flex items-center justify-center font-bold text-xl">S</div>
        <div className="text-left">
          <div className="font-semibold text-sm">Super Admin</div>
          <div className="text-xs text-white/70">Administrator</div>
        </div>
      </div>
    </div>
    <nav className="flex-1 p-2.5">
      <ul>
        {[
          { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
          { id: 'projects', icon: 'fas fa-project-diagram', label: 'Projects' },
          { id: 'managers', icon: 'fas fa-users', label: 'Project Managers' },
          { id: 'data', icon: 'fas fa-database', label: 'Collected Data' },
          { id: 'donations', icon: 'fas fa-hand-holding-heart', label: 'Donations' },
          { id: 'categories', icon: 'fas fa-layer-group', label: 'Categories' },
          { id: 'tags', icon: 'fas fa-tags', label: 'Tags' },
          { id: 'blogs', icon: 'fas fa-newspaper', label: 'Blog' },
          { id: 'comments', icon: 'fas fa-comments', label: 'Comments' },
        ].map(item => (
          <li key={item.id} className="mb-1">
            <button
              onClick={() => onTabClick(item.id)}
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

export default Sidebar