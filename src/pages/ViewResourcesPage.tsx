import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Dummy data for downloadable resources
const resources = [
  {
    type: 'pdf',
    title: 'Women Empowerment Handbook',
    description: 'A comprehensive guide on women empowerment strategies.',
    url: '/assets/handbook.pdf',
  },
  {
    type: 'pdf',
    title: 'Peacebuilding Toolkit',
    description: 'Toolkit for community peacebuilding and conflict resolution.',
    url: '/assets/peacebuilding-toolkit.pdf',
  },
  {
    type: 'video',
    title: 'Climate Action Training',
    description: 'Video training on climate action and sustainability.',
    url: '/assets/videos/climate-action-training.mp4',
  },
  {
    type: 'video',
    title: 'Youth Leadership Webinar',
    description: 'Webinar recording on youth leadership and engagement.',
    url: '/assets/videos/youth-leadership-webinar.mp4',
  },
];

const iconForType = (type: string) => {
  if (type === 'pdf') return <i className="fas fa-file-pdf text-red-600 text-2xl mr-3"></i>;
  if (type === 'video') return <i className="fas fa-video text-blue-600 text-2xl mr-3"></i>;
  return null;
};

const ViewResourcesPage: React.FC = () => (
  <>
    <Header />
    <main className="min-h-screen bg-white pt-32 pb-16 px-4 md:px-16">
      <h1 className="text-3xl md:text-4xl font-bold text-[#880088] mb-8 text-center">View Resources</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        {resources.map((res, idx) => (
          <div key={idx} className="flex items-center bg-[#f8f0fa] rounded-lg shadow p-5 md:p-7">
            {iconForType(res.type)}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#4b0082]">{res.title}</h2>
              <p className="text-gray-700 mb-2">{res.description}</p>
              {res.type === 'pdf' ? (
                <a href={res.url} download className="inline-block bg-[#880088] text-white px-4 py-2 rounded hover:bg-[#4b0082] transition">Download PDF</a>
              ) : (
                <video controls className="w-full max-w-xs mt-2 rounded shadow">
                  <source src={res.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </>
);

export default ViewResourcesPage;
