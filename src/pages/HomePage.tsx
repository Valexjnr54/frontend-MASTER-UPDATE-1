import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DonateModal from '../components/DonateModal';
import { useInView } from '../hooks/useInView';
import type { ThematicArea, TeamMember, FaqItem } from '../types';
import { Link } from 'react-router-dom';

const newsItems = [
    { icon: 'fas fa-bullhorn', text: 'New partnership with announced for peace initiatives' },
    { icon: 'fas fa-calendar', text: 'Community dialogue in Plateau State scheduled for June 30' },
    { icon: 'fas fa-award', text: 'LEGASI wins 2024 Peacebuilding Excellence Award' },
    { icon: 'fas fa-users', text: '120 women trained in conflict resolution last month' },
    { icon: 'fas fa-book', text: 'New research paper on interfaith mediation published' },
];

const impactStories = [
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812554/opa_eibm4z.jpg', title: 'Peace in Plateau State', description: 'After years of conflict, LEGASI facilitated dialogues between farming and herding communities in Plateau State. Today, joint economic initiatives have replaced violence with cooperation.' },
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812527/signing_peace_nx1yfu.jpg', title: 'Signing of the Peace Pact between Atyap', description: 'Atyap women leader expressed her gratitude, "we can now sleep peacefully without fear of being attacked in the night, and prays for everlasting peace."' },
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812504/mangu-community_kak3f9.jpg', title: 'LEGASI Emergency Grant for Mangu Community', description: "LEGASI's Emergency Grant to support Mangu community of Plateau state with relief materials and food to ......." },
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812509/peace_collabo_drntjr.jpg', title: 'Global Peace Chain (Pakistan) Collaboration', description: 'LEGASI in collaboration with Global Peace Chain (Pakistan) hosting ....' },
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812552/our_act_r7viq4.jpg', title: 'Healthcare Outreach', description: 'Our mobile clinics provided essential healthcare services to 5,000 residents in remote conflict zones where medical facilities were destroyed.' },
    { image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812499/gallary3_3_oi1goj.jpg', title: 'Water for Communities', description: 'We rehabilitated water systems serving 12 communities, ending conflicts over water resources and reducing waterborne diseases by 60%.' },
];

const thematicAreas: ThematicArea[] = [
    { id: 1, title: 'Collaborative Work/International Conference', image: ' https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812504/mangu-community_kak3f9.jpg', stories: [{ title: 'LEGASI in collaboration with Global Peace Chain (Pakistan) hosting the 2-day National Peace Conference', icon: 'fas fa-handshake', href: '#' }] },
    { id: 2, title: 'Women, Peace and Security (UNSCR 1325)', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812502/DSC_0057_h8kgrh.jpg', stories: [{ title: 'Bege Foundation - Session with Wives of Farmers and Pastoralist', icon: 'fas fa-users', href: '#' }] },
    { id: 3, title: 'In The Media', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812546/supporting_home_xjadub.jpg', stories: [{ title: '2023 Elections: CSOs Call For Women Youths Participation', icon: 'fas fa-tv', href: '#' }] },
    { id: 4, title: 'Women Empowerment', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812552/our_act_r7viq4.jpg', stories: [{ title: 'Women Empowerment for Equitable Development (Weed) Project', icon: 'fas fa-hands-helping', href: '#' }] },
    { id: 5, title: 'Youth, Peace and Security', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812506/our_act_lyrmn9.jpg', stories: [{ title: 'Coaching pupils in Igu and Kuchi Buyi Communities', icon: 'fas fa-chalkboard-teacher', href: '#' }] },
    { id: 6, title: 'Dialogue and Mediation', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812482/20230606_111801_ymmlfn.jpg', stories: [{ title: 'Signing of the Peace Pact between Atyap, Hausa and Fulani', icon: 'fas fa-handshake', href: '#' }] },
];

const teamMembers: TeamMember[] = [
    { name: 'Mrs. Kaltumi Abdulazeez', role: 'Executive Director', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1756189959/WhatsApp_Image_2025-08-10_at_6.06.20_PM_sadvzi.png' },
    // { name: 'Mr. Aiyelu Timothy', role: 'Programme Manager', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812548/team-member-placeholder_fxse6e.png' },
    // { name: 'Mrs. Hauwa Maaji', role: 'Finance Manager', image: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812548/team-member-placeholder_fxse6e.png' },
];

const partners = [
    { name: 'USAID', logo: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812506/partner1_zzvo1v.jpg' },
    { name: 'World Bank', logo: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812506/partner2_iydrha.jpg' },
    { name: 'United Nations', logo: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812506/partner4_iv7hon.jpg' },
    { name: 'Gates Foundation', logo: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812507/partner6_l7m667.jpg' },
    { name: 'UNDP', logo: 'https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812507/partner7_fjy0f9.jpg' },
];

const faqData: FaqItem[] = [
    { question: "What is LEGASI's main focus?", answer: "LEGASI focuses on empowering women and youth in conflict-affected communities through peacebuilding, dialogue, mediation, psychosocial support, and economic initiatives to create sustainable peace and development." },
    { question: "How can I get involved with LEGASI?", answer: "You can get involved by volunteering your time and skills, donating to support our programs, or partnering with us. Please visit our 'Volunteer' and 'Donate' sections for more information." },
    { question: "Where does LEGASI operate?", answer: "LEGASI was founded in Kaduna and has expanded its operations to multiple states across Nigeria, primarily focusing on areas affected by conflict where our interventions are most needed." },
    { question: "Are my donations tax-deductible?", answer: "As a registered non-governmental organization in Nigeria (RC: 99840 | SCUML: 095957), donations may be eligible for tax deductions depending on your local regulations. We recommend consulting with a financial advisor." },
];


const AnimatedSection: React.FC<{children: React.ReactNode; className?: string}> = ({ children, className }) => {
    const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
    return (
        <div ref={ref} className={`transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}>
            {children}
        </div>
    );
};

const SectionTitle: React.FC<{title: string, subtitle: string, dark?: boolean}> = ({title, subtitle, dark}) => (
    <div className="text-center mb-16">
        <h2 className={`font-playfair text-4xl md:text-5xl mb-5 relative inline-block ${dark ? 'text-white' : 'text-[#1a0a2e] bg-clip-text text-transparent bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-[#880088] to-[#4b0082]'}`}>
            {title}
             <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-24 h-1.5 rounded-full ${dark ? 'bg-white/50' : 'bg-[#e6e6fa]'}`}></span>
        </h2>
        <p className={`text-lg md:text-xl max-w-3xl mx-auto mt-8 ${dark ? 'text-white/80' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
);

const HeroSection: React.FC<{ onDonateClick: () => void }> = ({ onDonateClick }) => {
    return (
        <section className="h-screen relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                 <video autoPlay muted loop src="https://res.cloudinary.com/dnuyqw6o1/video/upload/v1754817618/LEGASI_HERO_CON_zrsajm.mp4" className="w-full h-full object-cover"></video>
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(26,10,46,0.8)_0%,_rgba(106,13,173,0.6)_100%)] flex flex-col justify-center items-center text-center p-5">
                <div className="max-w-4xl p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.2)]">
                    <h1 className="font-playfair text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-5 leading-tight shadow-text-md">Welcome to Ladies Empowerment Goals and Support initiative</h1>
                    <p className="text-lg text-white/90 mb-10 max-w-2xl mx-auto">LEGASI is a women-led, community-based NGO empowering conflict-affected communities. We advance Women's/Youth Peace & Security through dialogue, mediation, psychosocial support, and livelihood initiatives.</p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link to="/about" className="px-11 py-4 rounded-full font-semibold text-lg bg-transparent text-white border-2 border-white transition-all duration-400 ease-in-out-cubic hover:bg-white/10 hover:transform hover:-translate-y-1.5">Learn More</Link>
                    </div>
                </div>
            </div>
            <NewsTicker />
        </section>
    );
};

const NewsTicker: React.FC = () => {
    return (
        <div className="absolute bottom-0 left-0 w-full bg-black/80 py-4 overflow-hidden border-t-2 border-white/50 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
            <div className="flex items-center whitespace-nowrap">
                <div className="bg-white text-[#1a0a2e] px-5 py-2 font-bold rounded-r-full mr-5 shadow-lg text-lg">Latest Updates</div>
                <div className="inline-block animate-ticker pr-[100%]">
                    {newsItems.map((item, index) => (
                        <span key={index} className="inline-block mx-10 text-white text-lg">
                            <i className={`${item.icon} text-white/80 mr-2.5`}></i>{item.text}
                        </span>
                    ))}
                     {newsItems.map((item, index) => (
                        <span key={`dup-${index}`} className="inline-block mx-10 text-white text-lg">
                            <i className={`${item.icon} text-white/80 mr-2.5`}></i>{item.text}
                        </span>
                    ))}
                </div>
            </div>
            <style>{`
                @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-ticker { animation: ticker 40s linear infinite; }
            `}</style>
        </div>
    );
};

const AboutSection: React.FC = () => {
    return (
        <section className="py-28 px-5 bg-[linear-gradient(135deg,_#f8f0ff_0%,_#e6e6fa_100%)]">
            <div className="container mx-auto">
                <AnimatedSection>
                    <SectionTitle title="About LEGASI" subtitle="Inspired by a vision of a peaceful and empowered community free from violence and hate" />
                </AnimatedSection>

                <div className="flex flex-wrap gap-10 justify-center items-center mb-16">
                    <AnimatedSection className="flex-1 min-w-[300px] max-w-lg">
                        <div className="rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(106,13,173,0.15)]">
                            <img src="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812454/about_picture_ftiyl0.jpg" alt="LEGASI Team" className="w-full h-full object-cover" />
                        </div>
                    </AnimatedSection>
                    <AnimatedSection className="flex-1 min-w-[300px] max-w-xl">
                        <h3 className="text-4xl mb-6 text-[#4b0082] font-playfair">Our Journey Towards Empowerment</h3>
                        <p className="text-lg leading-relaxed mb-5 text-gray-700">LEGASI (Ladies Empowerment Goals and Support Initiative) was founded in 2010 with a mission to empower women and promote peace in conflict-affected communities across Nigeria. Our organization emerged as a response to the increasing violence and discrimination faced by women in northern Nigeria.</p>
                        <p className="text-lg leading-relaxed mb-8 text-gray-700">Over the past decade, we've grown from a small community initiative to a nationally recognized organization with programs in 12 states. Our approach combines grassroots engagement with evidence-based strategies to address the root causes of conflict and inequality.</p>
                        <div className="text-center md:text-left">
                             <Link to="/about" className="inline-block px-8 py-3.5 bg-[#880088] text-white rounded-full font-semibold text-base transition-all duration-400 ease-in-out-cubic shadow-[0_5px_15px_rgba(106,13,173,0.3)] hover:bg-[#4b0082] hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(106,13,173,0.4)]">Read More About Us</Link>
                        </div>
                    </AnimatedSection>
                </div>
            </div>
        </section>
    );
};

const ThematicAreaCard: React.FC<{ area: ThematicArea }> = ({ area }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

    return (
        <div ref={ref} className={`bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out-cubic hover:-translate-y-2.5 hover:shadow-2xl ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="h-48 bg-cover bg-center relative" style={{ backgroundImage: `url(${area.image})` }}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            <div className="p-5">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-xl font-bold text-[#4b0082]">{area.title}</h3>
                    <i className={`fas fa-chevron-down text-[#880088] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
                </button>
                <div className={`transition-[max-height] duration-700 ease-in-out-cubic overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pt-4 border-t mt-4">
                        {area.stories.map((story, index) => (
                            <Link key={index} to={story.href} className="flex items-center p-3 rounded-lg transition-colors hover:bg-purple-50">
                                <i className={`${story.icon} text-[#880088] text-lg w-8 text-center`}></i>
                                <span className="flex-1 text-gray-800">{story.title}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ImpactCarousel: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slideCount = impactStories.length;

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slideCount);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="py-28 bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] relative overflow-hidden">
            <div className="container mx-auto px-5">
                <AnimatedSection>
                    <SectionTitle title="Our Impact Stories" subtitle="Real stories of transformation from communities we serve" dark />
                </AnimatedSection>
                <div className="relative max-w-5xl mx-auto h-[500px] rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex h-full transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                        {impactStories.map((story, index) => (
                            <div key={index} className="min-w-full h-full bg-cover bg-center flex flex-col justify-end p-12 relative" style={{ backgroundImage: `url(${story.image})` }}>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="relative z-10 text-white max-w-2xl">
                                    <h3 className="font-playfair text-4xl mb-4">{story.title}</h3>
                                    <p className="text-lg mb-6 opacity-90">{story.description}</p>
                                    <a href="#" className="inline-block px-8 py-3.5 bg-white text-[#1a0a2e] rounded-full font-semibold text-base transition-all duration-400 ease-in-out-cubic shadow-lg hover:bg-gray-200 hover:-translate-y-1">Read Full Story</a>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button onClick={prevSlide} className="absolute top-1/2 -translate-y-1/2 left-5 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl z-10 transition-colors hover:bg-white/30"><i className="fas fa-chevron-left"></i></button>
                    <button onClick={nextSlide} className="absolute top-1/2 -translate-y-1/2 right-5 w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl z-10 transition-colors hover:bg-white/30"><i className="fas fa-chevron-right"></i></button>
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
                        {impactStories.map((_, index) => (
                            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'}`}></button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

const VideoSection: React.FC<{ onDonateClick: () => void }> = ({ onDonateClick }) => {
    return (
        <section className="relative py-24 px-5 bg-gray-800 overflow-hidden">
            <video autoPlay muted loop className="absolute z-0 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">
                <source src="https://res.cloudinary.com/dnuyqw6o1/video/upload/v1754817623/herosec_q6x7zb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-black/70"></div>
            <div className="relative z-10 container mx-auto text-center text-white">
                <AnimatedSection>
                    <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">Our Impact in Communities</h2>
                    <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
                        Witness how LEGASI is transforming lives and building bridges of understanding across Nigeria. This video showcases our community dialogues, empowerment workshops, and the real stories of women whose lives have been changed through our initiatives.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <button onClick={onDonateClick} className="px-11 py-4 rounded-full font-semibold text-lg bg-white text-[#1a0a2e] shadow-[0_5px_20px_rgba(255,215,0,0.4)] transition-all duration-400 ease-in-out-cubic hover:transform hover:-translate-y-1.5 hover:shadow-[0_8px_25px_rgba(255,215,0,0.6)]">Donate Now</button>
                        <Link to="/about" className="inline-block px-11 py-4 rounded-full font-semibold text-lg bg-white text-[#1a0a2e] shadow-[0_5px_20px_rgba(255,215,0,0.4)] transition-all duration-400 ease-in-out-cubic hover:transform hover:-translate-y-1.5 hover:shadow-[0_8px_25px_rgba(255,215,0,0.6)]">
                            Join Our Movement
                        </Link>
                    </div>
                </AnimatedSection>
            </div>
        </section>
    );
};

const FaqItemComponent: React.FC<{ faq: FaqItem; isOpen: boolean; onClick: () => void }> = ({ faq, isOpen, onClick }) => (
    <div className="bg-white rounded-2xl overflow-hidden mb-5 shadow-lg transition-all duration-300 hover:shadow-xl">
        <button onClick={onClick} className="w-full p-6 text-left flex justify-between items-center">
            <h3 className="text-lg font-semibold text-[#4b0082]">{faq.question}</h3>
            <i className={`fas fa-chevron-down text-[#880088] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
        <div className={`transition-[max-height,padding] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
            <div className="px-6 pb-6 text-gray-700">
                {faq.answer}
            </div>
        </div>
    </div>
);

const FaqSection = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    return (
        <section className="py-28 px-5 bg-[linear-gradient(135deg,_#f0e6ff_0%,_#e6d6ff_100%)]">
            <div className="container mx-auto">
                <SectionTitle title="Frequently Asked Questions" subtitle="Find answers to common questions about our work and how you can get involved." />
                <div className="max-w-4xl mx-auto">
                    {faqData.map((faq, index) => (
                        <AnimatedSection key={index}>
                           <FaqItemComponent 
                                faq={faq}
                                isOpen={openFaq === index}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            />
                        </AnimatedSection>
                    ))}
                </div>
            </div>
        </section>
    );
}

const HomePage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="bg-[#f8f0ff]">
            <Header />
            <main>
                <HeroSection onDonateClick={() => setIsModalOpen(true)} />
                <AboutSection />

                <section className="py-28 px-5 bg-[linear-gradient(135deg,_#f8f0ff_0%,_#e6d6ff_100%)]">
                    <div className="container mx-auto">
                        <SectionTitle title="Our Thematic Areas" subtitle="Explore our key focus areas and the impactful stories behind each initiative" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {thematicAreas.map((area) => <ThematicAreaCard key={area.id} area={area} />)}
                        </div>
                    </div>
                </section>

                <ImpactCarousel />

                <section className="py-28 px-5 bg-white">
                    <div className="container mx-auto">
                        <SectionTitle title="Our Key Personnel" subtitle="Meet the dedicated team driving LEGASI's mission forward" />
                        <div className="flex justify-center items-center min-h-[500px] py-8">
                            <AnimatedSection className="w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-500 ease-in-out-cubic hover:-translate-y-2 hover:shadow-2xl flex flex-col md:flex-row items-stretch">
                                <div className="min-h-[350px] md:min-h-[400px] md:w-1/2 w-full flex items-center justify-center bg-[#f8f0ff]">
                                    <div className="w-64 h-80 md:w-72 md:h-96 rounded-2xl overflow-hidden shadow-md bg-cover bg-center" style={{ backgroundImage: `url(${teamMembers[0].image})` }}></div>
                                </div>
                                <div className="flex-1 flex flex-col justify-center p-8 bg-[#880088] text-white">
                                    <h3 className="text-3xl font-bold mb-2 text-center md:text-left">{teamMembers[0].name}</h3>
                                    <p className="text-white/80 font-medium mb-4 text-center md:text-left">{teamMembers[0].role}</p>
                                    <p className="mb-6 text-base md:text-lg text-white/90 text-justify">
                                        Kaltumi Abdulazeez is a distinguished peacebuilder, advocate for women’s rights, and the Executive Director of LEGASI. With over 15 years of experience in conflict resolution, mediation, and community development, she has led numerous initiatives empowering women and youth in conflict-affected regions of Nigeria. Kaltumi’s leadership has been instrumental in advancing the Women, Peace, and Security agenda, fostering interfaith dialogue, and promoting psychosocial support for survivors of violence. Her dedication to sustainable peace and inclusive development has earned her national and international recognition. Kaltumi is committed to building resilient communities through dialogue, education, and economic empowerment, inspiring a new generation of leaders dedicated to peace and social justice.
                                    </p>
                                    <div className="flex gap-4 mt-auto justify-center md:justify-start">
                                        <a href="https://www.linkedin.com/in/kaltumi-abdulazeez-500124133/" target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-[#880088] hover:-translate-y-1"><i className="fab fa-linkedin"></i></a>
                                        <a href="https://x.com/kaltumia" target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-[#880088] hover:-translate-y-1"><i className="fab fa-twitter"></i></a>
                                        <a href="mailto:kaltumi@legasi.org" target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:bg-white hover:text-[#880088] hover:-translate-y-1"><i className="fas fa-envelope"></i></a>
                                    </div>
                                </div>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>
                
                <VideoSection onDonateClick={() => setIsModalOpen(true)} />
                <FaqSection />

                <section className="py-20 bg-[#f8f0ff] text-center">
                    <div className="container mx-auto px-5">
                         <h2 className="font-playfair text-3xl md:text-4xl text-[#4b0082] mb-8">Our Trusted Partners</h2>
                         <div className="flex justify-center items-center flex-wrap gap-x-10 gap-y-6">
                            {partners.map((partner, index) => (
                                <div key={index} className="w-44 h-24 bg-white rounded-xl flex items-center justify-center p-4 shadow-md transition-all duration-400 ease-in-out hover:-translate-y-2.5 hover:shadow-xl">
                                    <img src={partner.logo} alt={partner.name} className="max-w-full max-h-[70px] grayscale transition-all duration-400 ease-in-out hover:grayscale-0" />
                                </div>
                            ))}
                         </div>
                    </div>
                </section>

            </main>
            <Footer />
            <DonateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HomePage;
