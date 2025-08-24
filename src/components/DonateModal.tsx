import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiConfig from '../config/api';

interface DonateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface DonationResponse {
  message: string;
  data: {
    donation: {
      id: number;
      amount: number;
      type: string;
      currency: string;
      fullName: string;
      email: string;
      reference: string;
      status: string;
      paymentUrl: string | null;
      paymentData: any;
      createdAt: string;
      updatedAt: string;
    };
    paymentUrl: string;
  };
}

const DONATION_TYPES = [
    { id: 'general', icon: 'fas fa-hands-helping', title: 'General Donation', desc: 'Support our general programs and initiatives' },
    { id: 'education', icon: 'fas fa-book-open', title: 'Education Fund', desc: 'Help provide education for girls in conflict zones' },
    { id: 'livelihood', icon: 'fas fa-seedling', title: 'Livelihood Support', desc: 'Empower women with vocational training' },
    { id: 'peace', icon: 'fas fa-dove', title: 'Peace', desc: 'Fund community dialogues and mediation' },
];

const DONATION_AMOUNTS = [5000, 10000, 25000, 50000, 100000];

const DonateModal: React.FC<DonateModalProps> = ({ isOpen, onClose }) => {
    const [donationType, setDonationType] = useState('general');
    const [amount, setAmount] = useState(50000);
    const [customAmount, setCustomAmount] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const handleAmountClick = (value: number) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomAmount(e.target.value);
        if (e.target.value) {
            setAmount(Number(e.target.value));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        
        try {
            const response = await fetch(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MISC.DONATION}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount,
                    type: donationType,
                    fullName,
                    email,
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to initialize donation');
            }
            
            const data: DonationResponse = await response.json();
            
            // Check if we have a valid payment URL
            if (data.data && data.data.paymentUrl) {
                // Store donation reference for verification later
                localStorage.setItem('donationReference', data.data.donation.reference);
                
                // Redirect to payment URL
                window.location.href = data.data.paymentUrl;
            } else {
                throw new Error('No payment URL received from server');
            }
            
        } catch (error) {
            console.error('Donation error:', error);
            alert('There was an error processing your donation. Please try again.');
            setIsProcessing(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[2000] transition-opacity duration-300 ease-in-out"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl overflow-hidden w-11/12 max-w-3xl max-h-[90vh] shadow-2xl transition-transform duration-400 ease-in-out-cubic transform scale-95 animate-modal-pop-in"
                onClick={e => e.stopPropagation()}
            >
                <style>{`
                    @keyframes modal-pop-in {
                        0% { transform: scale(0.95) translateY(20px); opacity: 0; }
                        100% { transform: scale(1) translateY(0); opacity: 1; }
                    }
                    .animate-modal-pop-in { animation: modal-pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                `}</style>

                <div className="modal-header bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] p-8 text-center text-white relative">
                    <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/30 hover:rotate-90">
                        <i className="fas fa-times"></i>
                    </button>
                    <h2 className="font-playfair text-4xl mb-2.5">Support Our Cause</h2>
                    <p className="text-lg opacity-90">Your donation helps us empower women and build peaceful communities</p>
                </div>
                
                <div className="modal-body p-6 sm:p-10 overflow-y-auto max-h-[calc(90vh-160px)]">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                            {DONATION_TYPES.map(type => (
                                <div key={type.id} onClick={() => setDonationType(type.id)} className={`bg-white border-2 rounded-lg p-5 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative ${donationType === type.id ? 'border-[#880088] bg-[#880088]/5' : 'border-[#e6e6fa]'}`}>
                                    {donationType === type.id && (
                                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#880088] text-white rounded-full flex items-center justify-center text-xs">
                                            <i className="fas fa-check"></i>
                                        </div>
                                    )}
                                    <i className={`${type.icon} text-4xl text-[#880088] mb-4`}></i>
                                    <h3 className="text-lg font-semibold text-[#1a0a2e] mb-1">{type.title}</h3>
                                    <p className="text-gray-600 text-sm">{type.desc}</p>
                                </div>
                            ))}
                        </div>
                        
                        <h3 className="text-center mb-5 text-[#4b0082] font-semibold text-lg">Select Donation Amount</h3>
                        <div className="flex flex-wrap gap-4 justify-center mb-8">
                            {DONATION_AMOUNTS.map(value => (
                                <button 
                                    type="button" 
                                    key={value} 
                                    onClick={() => handleAmountClick(value)} 
                                    className={`border-2 rounded-lg px-6 py-3 font-semibold cursor-pointer transition-all duration-300 hover:bg-[#880088] hover:text-white hover:border-[#880088] ${
                                        amount === value && !customAmount 
                                            ? 'bg-[#880088] text-white border-[#880088]' 
                                            : 'bg-white text-[#1a0a2e] border-[#e6e6fa]'
                                    }`}
                                >
                                    ₦{value.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        
                        <div className="flex items-center gap-4 mb-8">
                            <span className="text-gray-700">Or enter custom amount:</span>
                            <input type="number" value={customAmount} onChange={handleCustomAmountChange} placeholder="Enter amount in Naira" className="flex-1 p-4 border-2 border-[#e6e6fa] rounded-lg text-lg transition-all duration-300 focus:border-[#880088] focus:outline-none"/>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                            <div className="form-group">
                                <label htmlFor="fullName" className="block mb-2 font-medium text-[#1a0a2e]">Full Name</label>
                                <input type="text" id="fullName" name="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 border-2 border-[#e6e6fa] rounded-lg text-base transition-all duration-300 focus:border-[#880088] focus:outline-none"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email" className="block mb-2 font-medium text-[#1a0a2e]">Email Address</label>
                                <input type="email" id="email" name="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border-2 border-[#e6e6fa] rounded-lg text-base transition-all duration-300 focus:border-[#880088] focus:outline-none"/>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isProcessing}
                            className={`w-full p-4 bg-[linear-gradient(135deg,_#880088_0%,_#4b0082_100%)] text-white border-none rounded-lg text-xl font-semibold cursor-pointer transition-all duration-300 mt-5 shadow-[0_5px_20px_rgba(106,13,173,0.3)] hover:transform hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(106,13,173,0.4)] ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isProcessing ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> Processing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-heart"></i> Donate Now
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DonateModal;