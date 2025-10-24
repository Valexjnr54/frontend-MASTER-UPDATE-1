import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const svgDataUrl = "data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffd700' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E";
    return (
        <footer className={`bg-[#1a0a2e] text-white py-16 px-5 relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-[url("${svgDataUrl}")] before:opacity-10`}>
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12 relative z-10">
                <div className="footer-col">
                    <h3 className="text-2xl mb-6 pb-2.5 relative text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#880088]">LEGASI</h3>
                    <p className="text-gray-400">Promoting peaceful co-existence through community dialogue, advocacy, and socio-economic empowerment in Nigeria.</p>
                    <div className="flex gap-4 mt-5">
                        <a href="https://www.facebook.com/legasiNG" target="_blank" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-white hover:text-[#1a0a2e] hover:-translate-y-1"><i className="fab fa-facebook-f"></i></a>
                        <a href="https://x.com/legasiNG" target="_blank" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-white hover:text-[#1a0a2e] hover:-translate-y-1"><i className="fab fa-twitter"></i></a>
                        <a href="https://www.instagram.com/legasi_ng" target="_blank" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-white hover:text-[#1a0a2e] hover:-translate-y-1"><i className="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/company/legasi-org" target="_blank" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-lg transition-all duration-300 hover:bg-white hover:text-[#1a0a2e] hover:-translate-y-1"><i className="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <div className="footer-col">
                    <h3 className="text-2xl mb-6 pb-2.5 relative text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#880088]">Quick Links</h3>
                    <ul className="list-none">
                        <li className="mb-4"><Link to="/" className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Home</Link></li>
                        <li className="mb-4"><Link to="/about" className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> About Us</Link></li>
                        <li className="mb-4"><Link to="/activities" className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Our Activities</Link></li>
                        <li className="mb-4"><Link to="/blogs" className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Blog</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h3 className="text-2xl mb-6 pb-2.5 relative text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#880088]">What We Do</h3>
                    <ul className="list-none">
                        <li className="mb-4"><a className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Community Dialogue</a></li>
                        <li className="mb-4"><a className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Trauma Counseling</a></li>
                        <li className="mb-4"><a className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Economic Empowerment</a></li>
                        <li className="mb-4"><a className="text-gray-400 hover:text-white hover:pl-1.5 transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-chevron-right text-white text-xs"></i> Advocacy</a></li>
                    </ul>
                </div>
                
                <div className="footer-col">
                    <h3 className="text-2xl mb-6 pb-2.5 relative text-white after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#880088]">Contact</h3>
                    <ul className="list-none">
                        <li className="mb-4"><a href="#" className="text-gray-400 hover:text-white transition-all duration-300 flex items-start gap-2.5"><i className="fas fa-map-marker-alt text-white mt-1"></i> Almara Centre - 22B, Kanta Road, off Independence Way, Kaduna North, NIGERIA</a></li>
                        <li className="mb-4"><a href="tel:+2348151421551" className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-phone-alt text-white"></i> +234 815 142 1551</a></li>
                        <li className="mb-4"><a href="mailto:info@legasi.org" className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-envelope text-white"></i> info@legasi.org</a></li>
                        <li className="mb-4"><a href="https://legasi.org" className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2.5"><i className="fas fa-globe text-white"></i> www.legasi.org</a></li>
                    </ul>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-white/10 text-gray-500 relative z-10">
                <p>&copy; {new Date().getFullYear()} LEGASI - Ladies Empowerment Goals and Support Initiative. All Rights Reserved.</p>
                <p>RC: 99840 | SCUML: 095957</p>
            </div>
        </footer>
    );
};

export default Footer;
