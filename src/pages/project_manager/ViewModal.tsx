import React from 'react';
import { DataEntry } from '@/src/types';

interface EntryModalProps {
  entry: DataEntry | null;
  onClose: () => void;
}

const ViewModal: React.FC<EntryModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Data Entry Details</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">Project</h4>
            <p>{entry.project.project_name}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Date</h4>
            <p>{formatDate(entry.date)}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Location</h4>
            <p>{entry.location}</p>
          </div>
          
          <div>
            <h4 className="font-semibold">Description</h4>
            <p className="whitespace-pre-line">{entry.description}</p>
          </div>
          
          {entry.image_url && (
            <div>
              <h4 className="font-semibold">Image</h4>
              <img 
                src={entry.image_url} 
                alt="Entry" 
                className="max-w-full h-auto rounded max-h-64 object-contain" 
              />
            </div>
          )}
          
          {entry.video_url && (
            <div>
              <h4 className="font-semibold">Video</h4>
              <video controls className="max-w-full rounded">
                <source src={entry.video_url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
          
          {entry.document_url && (
            <div>
              <h4 className="font-semibold">Document</h4>
              <a 
                href={entry.document_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-600 hover:underline inline-flex items-center gap-1"
              >
                <i className="fas fa-file-alt"></i>
                View Document
              </a>
            </div>
          )}
          
          {entry.metadata && entry.metadata.length > 0 && (
            <div>
              <h4 className="font-semibold">Custom Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entry.metadata.map((field, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{field.name}</p>
                    <p>{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;