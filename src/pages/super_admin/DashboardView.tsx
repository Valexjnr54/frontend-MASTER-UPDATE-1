import React, { useState, useEffect } from 'react';

const DashboardView: React.FC = () => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
    <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Project Progress Across All Categories</h2>
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Global project progress chart</p>
      </div>
    </div>
    {/* <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">System-Wide Activity</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-user-plus text-blue-600"></i>
          </div>
          <div>
            <p className="font-semibold">New project manager added</p>
            <p className="text-sm text-gray-500">2 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <i className="fas fa-project-diagram text-purple-600"></i>
          </div>
          <div>
            <p className="font-semibold">Project "Peace Initiative" assigned</p>
            <p className="text-sm text-gray-500">5 hours ago</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <i className="fas fa-database text-green-600"></i>
          </div>
          <div>
            <p className="font-semibold">42 new data entries submitted</p>
            <p className="text-sm text-gray-500">Yesterday</p>
          </div>
        </div>
      </div>
    </div> */}
  </div>
);

export default DashboardView;