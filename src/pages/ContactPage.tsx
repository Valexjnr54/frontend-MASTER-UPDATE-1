import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link } from 'react-router-dom';
import { useInView } from '../hooks/useInView';
import axios from 'axios';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';
import apiConfig from '../config/api';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Update your handleSubmit function in the ContactPage component
const handleSubmit = async (e) => {
  e.preventDefault();
  
    // Simple client-side validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showErrorAlert('Error!','Please fill in all fields');
        return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
        showErrorAlert('Error!','Please enter a valid email address');
        return;
    }

    try {
        const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.SUBMIT_CONTACT_FORM}`, formData, {
            headers: {
            'Content-Type': 'application/json',
            },
        });

        const result = response.data;

        if (response.status === 200) {
            showSuccessAlert('Success!','Thank you for your message. We will get back to you soon!');
            setFormData({
            name: '',
            email: '',
            subject: '',
            message: ''
            });
        } else {
            showErrorAlert('Error!',`Submission failed: ${result.message}`);
            if (result.errors) {
            console.error('Validation errors:', result.errors);
            }
        }
    } catch (error) {
        console.error('Submission error:', error);
        
        if (error.response) {
            // Server responded with error status
            const result = error.response.data;
            showErrorAlert('Error!',`Submission failed: ${result.message || 'Server error'}`);
            if (result.errors) {
            console.error('Validation errors:', result.errors);
            }
        } else if (error.request) {
            // Request was made but no response received
            showErrorAlert('Error!','Network error: Please check your connection and try again.');
        } else {
            // Something else happened
            showErrorAlert('Error!','There was an error submitting your form. Please try again.');
        }
    }
};

  // Default coordinates (example: New York City)
  const position = [10.5167, 7.4333];

 const AnimatedSection: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
     const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });
     return (
         <div ref={ref} className={`transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}>
             {children}
         </div>
     );
 };

const Breadcrumb: React.FC = () => (
    <div className="bg-white/90 shadow-md">
        <div className="container mx-auto px-5 py-4">
            <ul className="flex items-center text-sm">
                <li><Link to="/" className="text-[#880088] hover:text-[#4b0082] hover:underline">Home</Link></li>
                <li className="mx-2 text-gray-500">/</li>
                <li><span className="text-gray-700">Contact Us</span></li>
            </ul>
        </div>
    </div>
);

  return (
    <div className="bg-[#f8f0ff]">
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
                        <h1 className="font-playfair text-4xl md:text-6xl font-bold max-w-4xl leading-tight">Get in Touch</h1>
                        <p className="text-xl mt-4 max-w-2xl">We'd love to hear from you. Reach out to us with any questions or inquiries.</p>
                    </div>
                </div>
            </section>
            <Breadcrumb />
            <div className="contact-page">

                <div className="contact-container">
                    <AnimatedSection className="flex-1 min-w-[300px] max-w-lg bg-white p-8 rounded-2xl shadow-xl">
                        <h3 className="text-3xl text-[#4b0082] font-playfair mb-6 relative pb-3 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-[#880088] after:rounded-full">Our Offices</h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-map-marker-alt text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Headquarters</h4><p className="text-gray-600">Almara Centre - 22B, Kanta Road,<br/>off Independence Way, Kaduna North, NIGERIA</p></div></div>
                            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-phone-alt text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Phone</h4><a href="tel:+2348151421551" className="text-gray-600 hover:text-[#880088]">+234 815 142 1551</a></div></div>
                            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 flex items-center justify-center"><i className="fas fa-envelope text-[#880088] text-xl"></i></div><div><h4 className="font-bold text-[#4b0082]">Email</h4><a href="mailto:info@legasi.org" className="text-gray-600 hover:text-[#880088]">info@legasi.org</a></div></div>
                        </div>
                    </AnimatedSection>

                    
                    <div className="contact-form-container">
                        <h3 className="text-3xl text-[#4b0082] font-playfair mb-6">Send Us a Message</h3>
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                />
                            </div>
                            </div>
                            
                            <div className="form-group">
                            <label htmlFor="subject">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                            />
                            </div>
                            
                            <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                rows="5"
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                            </div>
                            
                            
                                        <button type="submit" className="w-full px-8 py-4 bg-[#880088] text-white rounded-full font-semibold text-lg transition-all duration-300 hover:bg-[#4b0082] hover:-translate-y-1 shadow-lg">Send Message</button>
                        </form>
                    </div>
                </div>

                <div className="map-container">
                    <h2 className="text-3xl text-[#4b0082] font-playfair mb-6">Find Us Here</h2>
                    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position}>
                        <Popup>
                        Legasi.org Headquarters<br />123 Legacy Way
                        </Popup>
                    </Marker>
                    </MapContainer>
                </div>
            </div>
        </main>
        <Footer />
    </div>
  );
};

export default ContactPage;