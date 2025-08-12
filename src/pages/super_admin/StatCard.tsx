import { StatCardProps } from '@/src/types';
import React, { useState, useEffect } from 'react';

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
    <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-[#880088]/10 text-[#880088] text-2xl">
      <i className={icon}></i>
    </div>
    <div>
      <div className="text-3xl font-bold text-[#1a0a2e]">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  </div>
);
export default StatCard;
