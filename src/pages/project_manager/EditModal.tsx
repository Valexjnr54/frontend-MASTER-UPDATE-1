import React, { useState, useEffect } from 'react';
import { DataEntry, Project } from '@/src/types';

interface EditModalProps {
  entry: DataEntry | null;
  onClose: () => void;
  onUpdate: (updatedEntry: DataEntry) => void;
  projects: Project[];
}

const EditModal: React.FC<EditModalProps> = ({ entry, onClose, onUpdate, projects }) => {
  const [formData, setFormData] = useState<Partial<DataEntry>>(entry || {});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (entry) {
      setFormData(entry);
    }
  }, [entry]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onUpdate(formData as DataEntry);
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!entry) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Data Entry</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Project</label>
            <select
              name="project_id"
              value={formData.project_id || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              disabled
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date ? formData.date.split('T')[0] : ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          {entry.metadata && entry.metadata.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Custom Fields</h4>
              <div className="space-y-2">
                {entry.metadata.map((field, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={field.name}
                      readOnly
                      className="w-1/3 p-2 border rounded bg-gray-100"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => {
                        const newMetadata = [...entry.metadata];
                        newMetadata[index].value = e.target.value;
                        setFormData(prev => ({ ...prev, metadata: newMetadata }));
                      }}
                      className="flex-1 p-2 border rounded"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {isUpdating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Updating...
                </>
              ) : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;