import React, { useState } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { showSuccessAlert } from '../utils/alerts';
import apiConfig from '../config/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interests: string[];
  motivation: string;
}

const VolunteerPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interests: [],
    motivation: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return {
          ...prev,
          interests: [...prev.interests, value]
        };
      } else {
        return {
          ...prev,
          interests: prev.interests.filter(interest => interest !== value)
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.ADD_VOLUNTEER}`, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Form submitted successfully:', response.data);
      showSuccessAlert('Success!','Form submitted successfully');
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error submitting form:', err);
      
      if (axios.isAxiosError(err)) {
        // Handle Axios error
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          setError(`Server error: ${err.response.status} - ${err.response.data.message || 'Please try again later.'}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError('Network error: Please check your connection and try again.');
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${err.message}`);
        }
      } else {
        // Handle non-Axios error
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
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
              <p className="mt-6">For any questions, please email <a href="mailto:info@legasi.org" className="text-[#880088] font-semibold hover:underline">info@legasi.org</a></p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-[#4b0082] font-playfair mb-2">Volunteer Application Form</h2>
                <p className="text-gray-600">Please fill out all required fields (*) to submit your application</p>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700">First Name <span className="text-[#880088]">*</span></label>
                    <input 
                      type="text" 
                      id="firstName" 
                      required 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700">Last Name <span className="text-[#880088]">*</span></label>
                    <input 
                      type="text" 
                      id="lastName" 
                      required 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="block mb-2 font-medium text-gray-700">Email Address <span className="text-[#880088]">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone" className="block mb-2 font-medium text-gray-700">Phone Number <span className="text-[#880088]">*</span></label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none"
                  />
                </div>
                <div className="form-group">
                  <label className="block mb-2 font-medium text-gray-700">Volunteer Interest <span className="text-[#880088]">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="interest" 
                        value="Field Volunteer" 
                        checked={formData.interests.includes("Field Volunteer")}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"
                      />
                      <span>Field Volunteer</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="interest" 
                        value="Remote Volunteer" 
                        checked={formData.interests.includes("Remote Volunteer")}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"
                      />
                      <span>Remote Volunteer</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="interest" 
                        value="Expert Volunteer" 
                        checked={formData.interests.includes("Expert Volunteer")}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"
                      />
                      <span>Expert Volunteer</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="interest" 
                        value="Internship" 
                        checked={formData.interests.includes("Internship")}
                        onChange={handleCheckboxChange}
                        className="h-5 w-5 text-[#880088] focus:ring-[#880088]/50 border-gray-300 rounded"
                      />
                      <span>Internship Program</span>
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="motivation" className="block mb-2 font-medium text-gray-700">Why do you want to volunteer with LEGASI? <span className="text-[#880088]">*</span></label>
                  <textarea 
                    id="motivation" 
                    required 
                    rows={5} 
                    value={formData.motivation}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg transition-all duration-300 focus:border-[#880088] focus:ring-2 focus:ring-[#880088]/50 outline-none" 
                    placeholder="Please share your motivation for volunteering with us"
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full p-4 bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
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