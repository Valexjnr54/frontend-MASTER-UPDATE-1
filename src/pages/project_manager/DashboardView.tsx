import React, { useState } from 'react';

interface SubmittedData {
  id: number;
  project_id: number;
  date: string;
  location: string;
  description: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: Array<{ name: string; value: string }>;
  createdAt: string;
  updatedAt: string;
  project: {
    id: number;
    project_name: string;
    // ... other project fields
  };
}

interface DashboardOverviewProps {
  submissions: SubmittedData[];
}

const DashboardOverview = ({ submissions }: DashboardOverviewProps) => {
  const [modalContent, setModalContent] = useState<{
    type: 'image' | 'video' | 'document' | null;
    url: string;
  }>({ type: null, url: '' });

  const openModal = (type: 'image' | 'video' | 'document', url: string) => {
    setModalContent({ type, url });
  };

  const closeModal = () => {
    setModalContent({ type: null, url: '' });
  };

  const renderModalContent = () => {
    if (!modalContent.type) return null;

    switch (modalContent.type) {
      case 'image':
        return (
          <img 
            src={modalContent.url} 
            alt="Submission" 
            className="max-h-[80vh] max-w-full object-contain"
          />
        );
      case 'video':
        return (
          <video 
            controls 
            className="max-h-[80vh] max-w-full"
          >
            <source src={modalContent.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'document':
        return (
          <iframe 
            src={modalContent.url} 
            className="w-full h-[80vh]"
            title="Document"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Recent Submissions</h3>
      
      {submissions.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No recent submissions found</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {submissions.map((submission) => (
            <li key={submission.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">
                    {submission.project?.project_name || 'Unnamed Project'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </p>
                  {submission.location && (
                    <p className="text-sm text-gray-500 mt-1">
                      Location: {submission.location}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {submission.image_url && (
                    <button
                      onClick={() => openModal('image', submission.image_url)}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-200 cursor-pointer"
                    >
                      Image
                    </button>
                  )}
                  {submission.video_url && (
                    <button
                      onClick={() => openModal('video', submission.video_url)}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded hover:bg-green-200 cursor-pointer"
                    >
                      Video
                    </button>
                  )}
                  {submission.document_url && (
                    <button
                      onClick={() => openModal('document', submission.document_url)}
                      className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded hover:bg-purple-200 cursor-pointer"
                    >
                      Document
                    </button>
                  )}
                </div>
              </div>
              {submission.description && (
                <p className="text-sm mt-2">{submission.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {modalContent.type && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeModal}>
          <div 
            className="bg-white rounded-lg max-w-4xl w-full p-4 relative"
            onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
          >
            <button 
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-center">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardOverview;