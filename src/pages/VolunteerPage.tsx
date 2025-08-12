
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VolunteerPage: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // In a real application, you would handle form data submission here.
        console.log('Form submitted');
        setSubmitted(true);
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <main className="pt-24">
                <div className="container mx-auto px-5 py-12">
                    <header className="text-center py-10 bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] text-white rounded-2xl mb-8 shadow-lg">
                        <h1 className="text-5xl font-bold font-playfair mb-4">Become a LEGASI Volunteer</h1>
                        <p className="text-xl max-w-3xl mx-auto">Join our team of dedicated volunteers working to empower women and build peace in Nigerian communities</p>
                    </header>
                    
                    {submitted ? (
                        <div className="bg-white rounded-2xl shadow-xl p-10 text-center animate-fade-in">
                            <div className="text-green-500 text-7xl mb-6">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h2 className="text-4xl font-bold text-[#2E7D32] mb-4">Thank You for Your Application!</h2>
                            <p className="text-lg text-gray-700 mb-2">We've received your volunteer application and will review it shortly.</p>
                            <p className="text-lg text-gray-700">Our team will contact you within 5-7 business days.</p>
                            <p className="mt-6">For any questions, please email <a href="mailto:volunteer@legasi.org" className="text-[#880088] font-semibold hover:underline">volunteer@legasi.org</a></p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
                            <div className="text-center mb-8">
                                <h2 className="text-4xl font-bold text-[#4b0082] font-playfair mb-2">Volunteer Application Form</h2>
                                <p className="text-gray-600">Please fill out all required fields (*) to submit your application</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="form-group">
                                        <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700">First Name <span className="text-[#880088]">*</span></label>
                                        <input type="text" id="firstName" required className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"/>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700">Last Name <span className="text-[#880088]">*</span></label>
                                        <input type="text" id="lastName" required className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"/>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email" className="block mb-2 font-medium text-gray-700">Email Address <span className="text-[#880088]">*</span></label>
                                    <input type="email" id="email" required className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">Phone Number <span className="text-[#880088]">*</span></label>
                                    <input type="tel" id="phone" required className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"/>
                                </div>
                                 <div className="form-group">
                                    <label className="block mb-2 font-medium text-gray-700">Volunteer Interest <span className="text-[#880088]">*</span></label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer"><input type="checkbox" name="interest" value="Field Volunteer" className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"/><span>Field Volunteer</span></label>
                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer"><input type="checkbox" name="interest" value="Remote Volunteer" className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"/><span>Remote Volunteer</span></label>
                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer"><input type="checkbox" name="interest" value="Expert Volunteer" className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"/><span>Expert Volunteer</span></label>
                                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer"><input type="checkbox" name="interest" value="Internship" className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"/><span>Internship Program</span></label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="motivation" className="block mb-2 font-medium text-gray-700">Why do you want to volunteer with LEGASI? <span className="text-[#880088]">*</span></label>
                                    <textarea id="motivation" required rows={5} className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none" placeholder="Please share your motivation for volunteering with us"></textarea>
                                </div>
                                <button type="submit" className="w-full p-4 bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1">Submit Application</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default VolunteerPage;
