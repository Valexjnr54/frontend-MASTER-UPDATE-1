import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const thematicAreas = [
  {
    title: 'Women’s Empowerment & Leadership',
    details: `
      - Capacity building workshops for women and girls
      - Mentorship programs for aspiring female leaders
      - Advocacy for women’s rights and gender equality
      - Community dialogues on gender-based violence
    `
  },
  {
    title: 'Peacebuilding & Conflict Resolution',
    details: `
      - Mediation and dialogue sessions in conflict-prone communities
      - Training youth and women as peace ambassadors
      - Early warning and response systems for violence prevention
      - Interfaith and intercultural peace forums
    `
  },
  {
    title: 'Education & Skills Development',
    details: `
      - Scholarship and school support for vulnerable children
      - Digital literacy and vocational training
      - Adult education and literacy classes
      - Career guidance and entrepreneurship bootcamps
    `
  },
  {
    title: 'Health & Wellbeing',
    details: `
      - Maternal and child health outreach
      - Mental health awareness campaigns
      - Sexual and reproductive health education
      - Access to clean water and sanitation projects
    `
  },
  {
    title: 'Climate Action & Environmental Sustainability',
    details: `
      - Tree planting and community clean-up drives
      - Climate change education for youth
      - Advocacy for sustainable agricultural practices
      - Waste management and recycling initiatives
    `
  },
  {
    title: 'Youth Engagement & Development',
    details: `
      - Youth leadership and civic engagement programs
      - Sports for development and peace
      - Volunteerism and community service
      - Digital skills and innovation labs
    `
  },
  {
    title: 'Community Development & Social Inclusion',
    details: `
      - Support for persons with disabilities
      - Economic empowerment for marginalized groups
      - Social protection and welfare advocacy
      - Community-driven infrastructure projects
    `
  }
];

const ActivitiesThematicPage: React.FC = () => (
  <>
    <Header />
    <main className="min-h-screen bg-white pt-32 pb-16 px-4 md:px-16">
      <h1 className="text-3xl md:text-4xl font-bold text-[#880088] mb-8 text-center">Our Thematic Areas</h1>
      <div className="max-w-4xl mx-auto space-y-8">
        {thematicAreas.map((area, idx) => (
          <section key={idx} className="bg-[#f8f0fa] rounded-lg shadow p-6 md:p-10">
            <h2 className="text-2xl font-semibold text-[#4b0082] mb-3">{area.title}</h2>
            <ul className="list-disc pl-6 text-gray-700 whitespace-pre-line">
              {area.details.trim().split('\n').map((item, i) => item.trim() && <li key={i}>{item.trim()}</li>)}
            </ul>
          </section>
        ))}
      </div>
    </main>
    <Footer />
  </>
);

export default ActivitiesThematicPage;
