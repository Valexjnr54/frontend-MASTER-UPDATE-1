import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useInView } from '../hooks/useInView';
import { Link } from 'react-router-dom';

const AnimatedSection: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
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
        <p className={`text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mt-8 ${dark ? 'text-white/80' : 'text-gray-600'}`}>{subtitle}</p>
    </div>
);

const AboutHero: React.FC = () => (
    <section 
        className="h-[60vh] bg-cover bg-center flex flex-col justify-center items-center text-center p-5 mt-20"
        style={{backgroundImage: `linear-gradient(135deg, rgba(26, 10, 46, 0.8) 0%, rgba(106, 13, 173, 0.6) 100%), url('https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812500/DSC_0055_qqwe2y.jpg')`}}
    >
        <h1 className="font-playfair text-5xl lg:text-7xl font-extrabold text-white mb-5 leading-tight shadow-text-md">About LEGASI</h1>
        <p className="text-xl text-white/90 max-w-3xl mx-auto">Empowering women and youth to build peaceful, prosperous communities across Nigeria</p>
    </section>
);

const Breadcrumb: React.FC = () => (
    <div className="bg-white/90 shadow-md">
        <div className="container mx-auto px-5 py-4">
            <ul className="flex items-center text-sm">
                <li><Link to="/" className="text-[#880088] hover:text-[#4b0082] hover:underline">Home</Link></li>
                <li className="mx-2 text-gray-500">/</li>
                <li><span className="text-gray-700">About Us</span></li>
            </ul>
        </div>
    </div>
);

const TimelineItem: React.FC<{ date: string; title: string; children: React.ReactNode; align: 'left' | 'right' }> = ({ date, title, children, align }) => {
    const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true });
    
    return (
        <div ref={ref} className={`mb-8 flex justify-between ${align === 'left' ? 'flex-row-reverse' : 'flex-row'} items-center w-full`}>
            <div className="order-1 w-5/12"></div>
            <div className={`z-20 flex items-center order-1 bg-[#880088] shadow-xl w-8 h-8 rounded-full transition-transform duration-500 ${inView ? 'scale-100' : 'scale-0'}`}>
                <i className="fas fa-calendar-alt text-white mx-auto"></i>
            </div>
            <div className={`order-1 bg-white rounded-lg shadow-xl w-5/12 px-6 py-4 transition-all duration-700 ${inView ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                <div className={`text-lg font-bold text-[#880088] mb-1`}>{date}</div>
                <h3 className={`mb-3 font-bold text-gray-800 text-xl`}>{title}</h3>
                <p className={`text-sm leading-snug tracking-wide text-gray-900 text-opacity-100`}>{children}</p>
            </div>
        </div>
    );
}

const VolunteerCard: React.FC<{ icon: string, title: string, description: string }> = ({ icon, title, description }) => (
    <AnimatedSection className="bg-[#f8f0ff] rounded-2xl p-10 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
        <div className="w-20 h-20 bg-[#880088] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl">
            <i className={icon}></i>
        </div>
        <h3 className="text-2xl font-bold text-[#4b0082] mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <Link to="/volunteer" className="inline-block px-8 py-3 bg-[#880088] text-white rounded-full font-semibold transition-colors hover:bg-[#4b0082]">Apply Now</Link>
    </AnimatedSection>
);

const AboutPage: React.FC = () => {
    return (
        <div className="bg-[#f8f0ff]">
            <Header/>
            <main>
                <AboutHero />
                <Breadcrumb />
                <section className="py-24 px-5">
                    <div className="container mx-auto">
                        <AnimatedSection>
                            <SectionTitle title="Who We Are" subtitle="LEGASI is a women-led, community-based NGO empowering conflict-affected communities in Nigeria" />
                        </AnimatedSection>
                        <div className="flex flex-wrap gap-10 justify-center items-center">
                            <AnimatedSection className="flex-1 min-w-[300px] max-w-lg">
                                <div className="rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(106,13,173,0.15)]">
                                    <img src="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812500/DSC_0055_qqwe2y.jpg" alt="LEGASI Team" className="w-full h-full object-cover"/>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection className="flex-1 min-w-[300px] max-w-xl">
                                <h3 className="text-4xl mb-6 text-[#4b0082] font-playfair">Our Story</h3>
                                <p className="text-lg leading-relaxed mb-5 text-gray-700">LEGASI established in 2017 has focused its works in 2 states of Nigeria (Kaduna and Plateau States) working in 7 LGAs and 6 LGAs in both Kaduna and Plateau States respectively with a total of 15 intervening communities.</p>
                                <p className="text-lg leading-relaxed mb-5 text-gray-700">The rationale behind taking few states at a time is to focus on depth rather than the breadth to fast-track actualizing of LEBASI’s vision and mission under a resource-constrained environment.</p>
                                <p className="text-lg leading-relaxed text-gray-700">The coverage areas by LEGASI are informed and will always be guided by community entry to establish the felt needs of the women and youths on issues related to peace development, the glaring absence of government’s interventions, and lowly progress in LEBASI’s result areas defined by the performance indicators in the results framework.</p>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-5 bg-[linear-gradient(135deg,_#f0e6ff_0%,_#e6d6ff_100%)]">
                    <div className="container mx-auto">
                         <SectionTitle title="Our Foundation" subtitle="The principles that guide our work and decision-making" />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            <AnimatedSection className="space-y-8">
                                <div>
                                    <h3 className="text-3xl text-[#4b0082] font-playfair mb-3">Our Vision</h3>
                                    <p className="text-lg text-gray-700 leading-relaxed">"A peaceful and empowered community free from violence and hate"</p>
                                </div>
                                <div>
                                    <h3 className="text-3xl text-[#4b0082] font-playfair mb-3">Our Mission</h3>
                                    <p className="text-lg text-gray-700 leading-relaxed">"To promote peaceful co-existence in communities through effective community dialogue and mediation, evidence-based advocacy, political and socio-economic empowerment"</p>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection>
                                <h3 className="text-3xl text-[#4b0082] font-playfair mb-3">Our Core Values</h3>
                                <ul className="space-y-4 text-lg text-gray-700">
                                    <li><strong>Integrity:</strong> We maintain the highest ethical standards in all our operations, ensuring transparency and accountability.</li>
                                    <li><strong>Empathy:</strong> We approach every individual and community with compassion, recognizing their unique challenges and strengths.</li>
                                    <li><strong>Inclusivity:</strong> We believe in the equal worth of all people and actively work to include marginalized voices.</li>
                                    <li><strong>Innovation:</strong> We continuously seek creative solutions to complex problems, adapting our approaches to meet evolving needs.</li>
                                    <li><strong>Sustainability:</strong> We design programs with long-term impact in mind, building local capacity for generations to come.</li>
                                </ul>
                            </AnimatedSection>
                         </div>
                    </div>
                </section>

                <section className="py-24 px-5 bg-white">
                    <div className="container mx-auto">
                        <SectionTitle title="Our Journey" subtitle="Key milestones in LEGASI's history of impact" />
                        <div className="relative wrap overflow-hidden p-10 h-full max-w-5xl mx-auto">
                            <div className="border-2-2 absolute border-opacity-20 border-purple-300 h-full border left-1/2"></div>
                            <TimelineItem date="2010" title="Foundation Established" align="left">LEGASI was founded in Kaduna by Mrs. Kaltumi Abdulazeez with a small team of 5 volunteers, initially focusing on women's education and health.</TimelineItem>
                            <TimelineItem date="2013" title="First Peace Dialogue" align="right">We facilitated our first interfaith community dialogue in Kaduna, bringing together 50 women from Christian and Muslim communities.</TimelineItem>
                            <TimelineItem date="2015" title="Expansion to Plateau State" align="left">With funding from our first major grant, we expanded operations to Plateau State, establishing our signature Women's Peace Councils program.</TimelineItem>
                            <TimelineItem date="2018" title="National Recognition" align="right">Our work was recognized with the National Peacebuilding Award, leading to partnerships with 5 additional states.</TimelineItem>
                            <TimelineItem date="2021" title="Youth Program Launch" align="left">We launched our Youth Peace Ambassadors program, training young leaders in conflict resolution and mediation skills.</TimelineItem>
                            <TimelineItem date="2024" title="Current Reach" align="right">Today, LEGASI operates in 12 states, has directly impacted over 50,000 lives, and continues to expand its innovative programs.</TimelineItem>
                        </div>
                    </div>
                </section>

                <section className="py-24 px-5 bg-white">
                     <div className="container mx-auto">
                        <SectionTitle title="Join Our Team" subtitle="Become part of our mission to empower women and build peace" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <VolunteerCard icon="fas fa-hands-helping" title="Field Volunteer" description="Work directly with communities implementing our programs. Ideal for those with experience in community development." />
                            <VolunteerCard icon="fas fa-laptop-code" title="Remote Volunteer" description="Support our work from anywhere with skills in research, writing, graphic design, web development, or social media." />
                            <VolunteerCard icon="fas fa-user-graduate" title="Internship Program" description="Gain practical experience in NGO management, program implementation, and peacebuilding through our structured internship." />
                            <VolunteerCard icon="fas fa-chalkboard-teacher" title="Expert Volunteer" description="Share your professional expertise (legal, medical, business, etc.) through short-term consulting or training programs." />
                        </div>
                    </div>
                </section>
                
                <section id="contact" className="py-24 px-5 bg-[linear-gradient(135deg,_#f0e6ff_0%,_#e6d6ff_100%)]">
                    <div className="container mx-auto">
                        <SectionTitle title="Contact Us" subtitle="Get in touch with our team for inquiries, partnerships, or support" />
                        <div className="flex flex-wrap gap-8 justify-center">
                            <AnimatedSection className="flex-1 min-w-[300px] max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="text-3xl text-[#4b0082] font-playfair mb-6 relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#880088] after:rounded-full">Our Offices</h3>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-map-marker-alt text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Headquarters</h4><p className="text-gray-600">Almara Centre - 22B, Kanta Road,<br/>off Independence Way, Kaduna North, NIGERIA</p></div></div>
                                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-phone-alt text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Phone</h4><a href="tel:+2348151421551" className="text-gray-600 hover:text-[#880088]">+234 815 142 1551</a></div></div>
                                    <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-envelope text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Email</h4><a href="mailto:info@legasi.org" className="text-gray-600 hover:text-[#880088]">info@legasi.org</a></div></div>
                                </div>
                            </AnimatedSection>
                            <AnimatedSection className="flex-1 min-w-[300px] max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                                <h3 className="text-3xl text-[#4b0082] font-playfair mb-6">Send Us a Message</h3>
                                <form className="space-y-4">
                                    <input type="text" placeholder="Full Name" required className="w-full p-4 border border-gray-300 rounded-lg focus:border-[#880088] focus:ring-1 focus:ring-[#880088] outline-none"/>
                                    <input type="email" placeholder="Email Address" required className="w-full p-4 border border-gray-300 rounded-lg focus:border-[#880088] focus:ring-1 focus:ring-[#880088] outline-none"/>
                                    <textarea placeholder="Your Message" required rows={5} className="w-full p-4 border border-gray-300 rounded-lg focus:border-[#880088] focus:ring-1 focus:ring-[#880088] outline-none"></textarea>
                                    <button type="submit" className="w-full px-8 py-4 bg-[#880088] text-white rounded-full font-semibold text-lg transition-all duration-300 hover:bg-[#4b0082] hover:-translate-y-1 shadow-lg">Send Message</button>
                                </form>
                            </AnimatedSection>
                        </div>
                    </div>
                </section>
            </main>
            <Footer/>
        </div>
    );
};

export default AboutPage;
