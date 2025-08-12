import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const RelatedStoryCard: React.FC<{img: string, title: string, desc: string, link: string}> = ({img, title, desc, link}) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <img src={img} alt={title} className="w-full h-48 object-cover"/>
        <div className="p-5">
            <h4 className="text-xl font-bold text-[#4b0082] mb-2">{title}</h4>
            <p className="text-gray-600 mb-4 text-sm line-clamp-3">{desc}</p>
            <Link to={link} className="font-semibold text-[#880088] hover:text-[#4b0082] inline-flex items-center gap-2 group">
                Read Story <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
        </div>
    </div>
);

const UromiBlogPostPage: React.FC = () => {
    return (
        <div className="bg-gray-50">
            <Header variant="dark" />
            <main>
                <section className="relative h-[70vh] overflow-hidden">
                    <div className="absolute inset-0 bg-black">
                        <video autoPlay muted loop className="w-full h-full object-cover opacity-50">
                            <source src="https://res.cloudinary.com/dnuyqw6o1/video/upload/v1754817618/LEGASI_HERO_CON_zrsajm.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative h-full flex items-end pb-20 text-white">
                        <div className="container mx-auto px-5">
                            <h1 className="font-playfair text-4xl md:text-6xl font-bold max-w-4xl leading-tight">Women Leading Peace Dialogues</h1>
                            <p className="text-xl mt-4 max-w-2xl">How LEGASI's Women Peace Councils are transforming conflict resolution in Northern Nigeria</p>
                        </div>
                    </div>
                </section>

                <div className="container mx-auto px-5 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <article className="lg:col-span-2">
                             <div className="flex items-center gap-6 mb-8 text-gray-500">
                                <span><i className="far fa-calendar-alt text-[#880088] mr-2"></i>April 6, 2025</span>
                                <span><i className="far fa-user text-[#880088] mr-2"></i>By Kaltumi Abdulazeez</span>
                            </div>

                            <div className="prose max-w-none text-lg text-gray-800 leading-relaxed">
                                <style>{`
                                    .prose h2 { font-family: 'Playfair Display', serif; color: #4b0082; margin-top: 2em; margin-bottom: 1em; }
                                    .prose p { margin-bottom: 1.25em; }
                                    .prose blockquote { border-left-color: #880088; background-color: #f8f0ff; padding: 1rem 1.5rem; }
                                `}</style>

                                <p className="lead text-xl font-semibold text-gray-900">Ladies Empowerment Goals and Support Initiative (LEGASI) strongly condemns the horrific mob lynching of 16 travelers in Uromi, Edo State, on March 27, 2025. This act of extreme violence is a gross violation of human rights and a deep assault on the rule of law.</p>
                                
                                <img src="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812549/Utomi_Killings_2_mxwhua.jpg" alt="Protest against Uromi killings" className="rounded-xl my-8 shadow-lg w-full"/>
                                
                                <p>According to reports, the victims, who were traveling from Rivers State to Kano, were intercepted by local vigilantes who allegedly found weapons in their vehicle. Rather than handing them over to law enforcement, the situation escalated into a mob attack that ended in the gruesome killing and burning of the victims.</p>
                                <p>Such disturbing acts of extrajudicial punishment are not only unlawful but threaten to plunge communities into cycles of retaliatory violence. LEGASI is particularly concerned about rising tensions and the risk of reprisal attacks, especially along ethnic and regional lines. These dangers must not be ignored.</p>
                                
                                <blockquote>
                                    <p>This is a critical moment to counter any rhetoric of vengeance and emphasize that justice must be pursued through legal and peaceful means.</p>
                                </blockquote>

                                <h2>A Call for Restraint and Justice</h2>
                                <p>In the light of this, LEGASI calls on all peacebuilders, religious leaders, traditional rulers, civil society, and the media to use their platforms to promote messages of restraint, unity, and peace. Amnesty International has also reiterated the danger of unchecked vigilante actions and the responsibility of the Nigerian government to uphold human rights, even in the face of security challenges.</p>
                                <p>While key suspects have reportedly been arrested and transferred to Abuja for further investigation and prosecution, LEGASI stresses that only transparent and impartial legal processes can deliver true justice and prevent future incidents.</p>

                                <h2>Our Demands</h2>
                                <p>We therefore call on Edo State and Federal Governments to:</p>
                                <ul className="list-disc list-inside space-y-2 pl-4">
                                    <li><strong>Ensure Transparent Investigation and Prosecution:</strong> Conduct a full, impartial investigation and bring all those responsible to justice without delay or bias.</li>
                                    <li><strong>Strengthen the Rule of Law:</strong> Build the capacity of law enforcement and judicial institutions to address such crimes.</li>
                                    <li><strong>Promote Dialogue and Peacebuilding:</strong> Proactively engage all stakeholders in peace dialogues that heal divides and prevent the spread of hate.</li>
                                </ul>
                                <p>LEGASI urges the general public to remain calm and law-abiding, and to resist calls for retaliation. We must all work together to uphold our shared humanity and ensure that Nigeria remains a country governed by justice, compassion, and the rule of law.</p>
                            </div>
                        </article>
                        
                        <aside>
                            <div className="sticky top-28">
                                <h3 className="font-playfair text-3xl font-bold text-[#4b0082] mb-6 pb-3 border-b-2 border-[#e6e6fa]">More Stories</h3>
                                <div className="space-y-8">
                                    <RelatedStoryCard 
                                        img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812551/youth_handbook_cover_ukabrk.jpg"
                                        title="THE YOUNG HUMANITARIANS HANDBOOK"
                                        desc="Empowering young people to organize and tackle the many different crises in front of them."
                                        link="#"
                                    />
                                    <RelatedStoryCard 
                                        img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812450/climat_change_traning6_b0fudh.jpg"
                                        title="LEGASI Trains Women on Climate Change"
                                        desc="As part of the International Women's Days activities, LEGASI organized an advocacy training for women in Plateau State."
                                        link="#"
                                    />
                                     <RelatedStoryCard 
                                        img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812449/every1_0_mints_rmq0cz.jpg"
                                        title="Every 10 minutes, a woman is killed"
                                        desc="Civil society organizations team to campaign re-introducing the challenges faced by women and girls globally during the 16 Days of Activism."
                                        link="#"
                                    />
                                    <RelatedStoryCard 
                                        img="https://res.cloudinary.com/dnuyqw6o1/image/upload/v1754812546/supporting_home_xjadub.jpg"
                                        title="Supporting Home Grown Peace Initiatives"
                                        desc="A stakeholders dissemination session with the EnGAGE community partners and other stakeholder organizations."
                                        link="#"
                                    />
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default UromiBlogPostPage;
