import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';

// New component for Email Verification Modal
const EmailVerificationModal: React.FC<{ 
  email: string;
  onVerify: (pin: string) => Promise<boolean>;
  onClose: () => void;
}> = ({ email, onVerify, onClose }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 6) {
            setError('PIN must be 6 digits');
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            const success = await onVerify(pin);
            if (success) {
                // The modal will be closed by the parent component
                showSuccessAlert('success', 'Email Successfully Verified')
            }
        } catch (error) {
            setError('Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendPin = async () => {
        setIsResending(true);
        setError('');
        try {
            await authService.resendVerificationPin(email);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 3000);
        } catch (error) {
            setError('Failed to resend PIN. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
            <div className="bg-[linear-gradient(135deg,_#1a0a2e_0%,_#4b0082_100%)] rounded-2xl w-11/12 max-w-md p-8 sm:p-10 shadow-2xl relative border border-white/10">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-2xl text-white/70 hover:text-white transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
                    <p className="text-white/80 mb-4">
                        We've sent a 6-digit verification code to <span className="font-semibold">{email}</span>
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={pin}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                setPin(value);
                            }}
                            className="w-full px-4 py-4 bg-white/10 border-2 border-white/10 rounded-lg text-white text-center text-2xl tracking-widest placeholder:text-white/50 focus:border-[#8a4dcc] focus:bg-white/15 outline-none transition-all" 
                            placeholder="000000" 
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-[#ff6b6b] text-center font-medium">{error}</p>
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={`w-full py-4 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] text-white font-semibold rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8a4dcc]/30 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i> Verifying...
                            </>
                        ) : (
                            'Verify Email'
                        )}
                    </button>
                </form>
                <div className="text-center mt-4 text-white/70 text-sm">
                    <p>
                        Didn't receive the code?{' '}
                        <button 
                            type="button" 
                            onClick={handleResendPin}
                            className="text-[#e0c3ff] font-medium hover:underline"
                            disabled={isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend PIN'}
                        </button>
                    </p>
                    {resendSuccess && (
                        <p className="text-green-400 mt-2">Verification code resent successfully!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// New component for Password Reset Modal
const PasswordResetModal: React.FC<{ 
  email: string;
  initialPassword: string; // Add this prop
  onChangePassword: (newPassword: string) => Promise<boolean>;
  onClose: () => void;
}> = ({ email, initialPassword, onChangePassword, onClose }) => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Password requirements state
    const [requirements, setRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Check password requirements when password changes
        if (name === 'password') {
            setRequirements({
                length: value.length >= 8,
                uppercase: /[A-Z]/.test(value),
                lowercase: /[a-z]/.test(value),
                number: /[0-9]/.test(value),
                specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
            });
        }
    };

    const validatePassword = () => {
        const { password, confirmPassword } = formData;
        const errors = [];
        
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        if (!requirements.length) {
            errors.push('Password must be at least 8 characters');
        }
        
        if (!requirements.uppercase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (!requirements.lowercase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (!requirements.number) {
            errors.push('Password must contain at least one number');
        }
        
        if (!requirements.specialChar) {
            errors.push('Password must contain at least one special character');
        }
        
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validatePassword();
        if (errors.length > 0) {
            setError(errors.join('. '));
            return;
        }
        
        setIsLoading(true);
        setError('');
        try {
            const success = await onChangePassword(formData.password);
            if (success) {
                setSuccess(true);
                setTimeout(() => onClose(), 2000);
            } else {
                setError('Failed to update password. Please try again.');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Requirement checklist component
    const RequirementChecklist = () => (
        <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-white/80">Password Requirements:</p>
            <ul className="space-y-1 text-sm">
                <li className={`flex items-center ${requirements.length ? 'text-green-400' : 'text-white/60'}`}>
                    <i className={`fas ${requirements.length ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
                    At least 8 characters
                </li>
                <li className={`flex items-center ${requirements.uppercase ? 'text-green-400' : 'text-white/60'}`}>
                    <i className={`fas ${requirements.uppercase ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
                    At least one uppercase letter (A-Z)
                </li>
                <li className={`flex items-center ${requirements.lowercase ? 'text-green-400' : 'text-white/60'}`}>
                    <i className={`fas ${requirements.lowercase ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
                    At least one lowercase letter (a-z)
                </li>
                <li className={`flex items-center ${requirements.number ? 'text-green-400' : 'text-white/60'}`}>
                    <i className={`fas ${requirements.number ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
                    At least one number (0-9)
                </li>
                <li className={`flex items-center ${requirements.specialChar ? 'text-green-400' : 'text-white/60'}`}>
                    <i className={`fas ${requirements.specialChar ? 'fa-check-circle' : 'fa-circle'} mr-2`}></i>
                    At least one special character (!@#$%^&*)
                </li>
            </ul>
        </div>
    );

    if (success) {
        return (
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
                <div className="bg-[linear-gradient(135deg,_#1a0a2e_0%,_#4b0082_100%)] rounded-2xl w-11/12 max-w-md p-8 sm:p-10 shadow-2xl relative border border-white/10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fas fa-check text-4xl text-green-400"></i>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">Password Updated!</h2>
                        <p className="text-white/80">
                            Your password has been updated successfully. Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
            <div className="bg-[linear-gradient(135deg,_#1a0a2e_0%,_#4b0082_100%)] rounded-2xl w-11/12 max-w-md p-8 sm:p-10 shadow-2xl relative border border-white/10">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-2xl text-white/70 hover:text-white transition-colors"
                >
                    <i className="fas fa-times"></i>
                </button>
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Change Password</h2>
                    <p className="text-white/80">
                        Your account requires a password update for security reasons.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
                        <input 
                            type="password" 
                            name="password" 
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/10 rounded-lg text-white placeholder:text-white/50 focus:border-[#8a4dcc] focus:bg-white/15 outline-none transition-all" 
                            placeholder="New Password" 
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="relative">
                        <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/10 rounded-lg text-white placeholder:text-white/50 focus:border-[#8a4dcc] focus:bg-white/15 outline-none transition-all" 
                            placeholder="Confirm New Password" 
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    {/* Password requirements checklist */}
                    <RequirementChecklist />
                    
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                            <p className="text-[#ff6b6b] text-center font-medium">{error}</p>
                        </div>
                    )}
                    <button 
                        type="submit" 
                        className={`w-full py-4 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] text-white font-semibold rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8a4dcc]/30 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        disabled={isLoading || !Object.values(requirements).every(Boolean) || formData.password !== formData.confirmPassword}
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i> Updating...
                            </>
                        ) : (
                            'Update Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

const LoginModal: React.FC<{ 
  role: 'Super Admin' | 'Project Manager'; 
  onClose: () => void 
}> = ({ role, onClose }) => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showEmailVerification, setShowEmailVerification] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            let response;
            if (role === 'Super Admin') {
                response = await authService.adminLogin(formData);
            } else {
                response = await authService.projectManagerLogin(formData);
            }

            if (role === 'Super Admin') {
                if (response.success && response.token && response.admin) {
                    const currentUser = response.admin;
                    setCurrentUser(currentUser);

                    // Store auth data including verification status
                    authService.storeAuthData(response.token, currentUser);

                    // If all checks pass, proceed to dashboard
                    window.location.href = role === 'Super Admin' ? '/superadmin' : '/project-manager';

                } else {
                    setError(response.message || 'Authentication failed. Please try again.');
                }
            }else{
                if (response.success && response.token && response.user) {
                    const currentUser = response.user;
                    setCurrentUser(currentUser);

                    // Store auth data including verification status
                    authService.storeAuthData(response.token, currentUser);

                    // For Project Manager: Check verification and password status
                    if (role === 'Project Manager') {
                        if (!currentUser.email_verified) {
                            setShowEmailVerification(true);
                            return;
                        }
                        
                        if (currentUser.temporal_password) {
                            setShowPasswordReset(true);
                            return;
                        }
                    }

                    // If all checks pass, proceed to dashboard
                    window.location.href = role === 'Super Admin' ? '/superadmin' : '/project-manager';

                } else {
                    setError(response.message || 'Authentication failed. Please try again.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (pin: string) => {
    try {
        const response = await authService.verifyEmail({
            email: formData.email,
            pin: pin
        });

        if (response.status = "success") {
            // Update the current user state with verified status
            const updatedUser = {
                ...currentUser,
                email_verified: response.user.email_verified,
                temporal_password: response.user.temporal_password
            };
            setCurrentUser(updatedUser);

            // Update stored auth data
            const authData = authService.getAuthData();
            if (authData) {
                authService.storeAuthData(authData.token, updatedUser);
            }

            showSuccessAlert('success', response.message || 'Email verified successfully');
            
            // Check if temporary password needs to be changed
            if (response.user.temporal_password) {
                setShowEmailVerification(false);
                setShowPasswordReset(true);
                return true;
            } else {
                window.location.href = '/project-manager';
                return true;
            }
        } else {
            showErrorAlert('error', response.message || 'Invalid verification code');
            return false;
        }
    } catch (error) {
        console.error('Email verification error:', error);
        showErrorAlert('error', 'An error occurred during verification');
        return false;
    }
};

    // const handleChangePassword = async (newPassword: string) => {
    //     try {
    //         const response = await authService.changeTemporaryPassword({
    //             email: formData.email,
    //             current_password: formData.password, // Include the initial password
    //             new_password: newPassword
    //         });

    //         if (response.success) {
    //             // Update user state and auth data
    //             const updatedUser = {
    //                 ...currentUser,
    //                 temporal_password: false
    //             };
    //             setCurrentUser(updatedUser);
    //             authService.storeAuthData(response.token, updatedUser);
                
    //             return true;
    //         }
    //         return false;
    //     } catch (error) {
    //         console.error('Password change error:', error);
    //         return false;
    //     }
    // };

    const handleChangePassword = async (newPassword: string) => {
        try {
            const response = await authService.changeTemporaryPassword({
                email: formData.email,
                current_password: formData.password,
                new_password: newPassword
            });

            // Check for both response formats (success flag or status field)
            if (response.success || response.status === "success") {
                // Update user state and auth data
                const updatedUser = {
                    ...currentUser,
                    temporal_password: false,
                    ...response.user // Include any updated user data from the response
                };
                setCurrentUser(updatedUser);
                
                // Store the new token if provided, otherwise keep the existing one
                const authData = authService.getAuthData();
                const token = response.token || (authData ? authData.token : null);
                
                if (token) {
                    authService.storeAuthData(token, updatedUser);
                }
                showSuccessAlert('success', response.message || 'Email verified successfully');
                
                window.location.href = '/project-manager';
            } else {
                showErrorAlert('error', response.message || 'Unable to change password');
                return false;
            }
        } catch (error) {
            console.error('Password change error:', error);
            return false;
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] transition-opacity duration-300" onClick={onClose}>
                <div className="bg-[linear-gradient(135deg,_#1a0a2e_0%,_#4b0082_100%)] rounded-2xl w-11/12 max-w-md p-8 sm:p-10 shadow-2xl relative border border-white/10" onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-2xl text-white/70 hover:text-white transition-colors"
                        disabled={isLoading}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">{role} Login</h2>
                        <span className="bg-white/10 text-[#e0c3ff] px-4 py-1.5 rounded-full text-sm">
                            Please enter your credentials
                        </span>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <i className="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
                            <input 
                                type="text" 
                                name="email" 
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/10 rounded-lg text-white placeholder:text-white/50 focus:border-[#8a4dcc] focus:bg-white/15 outline-none transition-all" 
                                placeholder="email" 
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="relative">
                            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/70"></i>
                            <input 
                                type="password" 
                                name="password" 
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-4 bg-white/10 border-2 border-white/10 rounded-lg text-white placeholder:text-white/50 focus:border-[#8a4dcc] focus:bg-white/15 outline-none transition-all" 
                                placeholder="Password" 
                                required
                                disabled={isLoading}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                                <p className="text-[#ff6b6b] text-center font-medium">{error}</p>
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className={`w-full py-4 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] text-white font-semibold rounded-lg transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#8a4dcc]/30 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2"></i> Authenticating...
                                </>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </button>
                    </form>
                    <div className="text-center mt-6 text-white/70 text-sm">
                        <p>Having trouble? <a href="#" className="text-[#e0c3ff] font-medium hover:underline">Contact Support</a></p>
                    </div>
                </div>
            </div>

            {showEmailVerification && (
                <EmailVerificationModal 
                    email={formData.email}
                    onVerify={handleVerifyEmail}
                    onClose={() => {
                        setShowEmailVerification(false);
                        onClose();
                    }}
                />
            )}

            {showPasswordReset && (
                <PasswordResetModal 
                    email={formData.email}
                    initialPassword={formData.password} // Pass the initial password
                    onChangePassword={handleChangePassword}
                    onClose={() => {
                        setShowPasswordReset(false);
                        window.location.href = '/project-manager';
                    }}
                />
            )}
        </>
    );
};

const LoginPage: React.FC = () => {
    const [modalRole, setModalRole] = useState<'Super Admin' | 'Project Manager' | null>(null);

    return (
        <div className="bg-[linear-gradient(135deg,_#1a0a2e_0%,_#4b0082_100%)] min-h-screen flex justify-center items-center p-5 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-white/5"
                        style={{
                            width: `${Math.random() * 300 + 100}px`,
                            height: `${Math.random() * 300 + 100}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            filter: 'blur(40px)',
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    />
                ))}
            </div>

            <Link 
                to="/" 
                className="absolute top-5 left-5 z-10 bg-white/10 backdrop-blur-md border border-white/15 text-white px-5 py-3 rounded-full text-sm font-medium flex items-center gap-2 transition-all hover:bg-white/20 hover:-translate-y-0.5"
            >
                <i className="fas fa-arrow-left"></i> Return to Website
            </Link>

            <div className="container max-w-5xl flex flex-col items-center relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-block p-2 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] rounded-full shadow-[0_8px_25px_rgba(138,77,204,0.5)] mb-6 animate-pulse-slow">
                        <div className="w-36 h-36 bg-[#1a0a2e] rounded-full flex items-center justify-center">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-24 h-24">
                            <path fill="#ffffff" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                            <path fill="#ffffff" d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7zm1 9.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3zM12 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
                           </svg>
                        </div>
                    </div>
                    <h1 className="font-playfair text-6xl font-bold bg-clip-text text-transparent bg-[linear-gradient(to_right,_#ffffff,_#e0c3ff)] mb-4 shadow-text-sm">
                        LEGASI DMS
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        Database Management System for Ladies Empowerment Goals and Support Initiative
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center gap-8 w-full mt-5">
                    <div 
                        onClick={() => setModalRole('Super Admin')} 
                        className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex-1 max-w-md p-10 text-center shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/15 hover:border-white/20 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="w-20 h-20 bg-[linear-gradient(135deg,_#6a0dad_0%,_#4b0082_100%)] rounded-full flex justify-center items-center mx-auto mb-6 text-4xl text-white">
                            <i className="fas fa-crown"></i>
                        </div>
                        <h2 className="text-3xl font-semibold mb-4 text-white">Super Admin</h2>
                        <p className="text-white/80 mb-6 leading-relaxed">
                            Full access to all system features, user management, and configuration settings. For platform administrators.
                        </p>
                        <button className="bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] text-white px-8 py-3.5 font-semibold rounded-full shadow-[0_5px_20px_rgba(138,77,204,0.4)] transition-all hover:-translate-y-1 hover:shadow-lg">
                            Login as Super Admin
                        </button>
                    </div>
                    
                    <div 
                        onClick={() => setModalRole('Project Manager')} 
                        className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl flex-1 max-w-md p-10 text-center shadow-[0_15px_35px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:bg-white/15 hover:border-white/20 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="w-20 h-20 bg-[linear-gradient(135deg,_#6a0dad_0%,_#4b0082_100%)] rounded-full flex justify-center items-center mx-auto mb-6 text-4xl text-white">
                            <i className="fas fa-tasks"></i>
                        </div>
                        <h2 className="text-3xl font-semibold mb-4 text-white">Project Manager</h2>
                        <p className="text-white/80 mb-6 leading-relaxed">
                            Access to project management tools, team coordination, and reporting features. For project leaders.
                        </p>
                        <button className="bg-[linear-gradient(135deg,_#8a4dcc_0%,_#6a0dad_100%)] text-white px-8 py-3.5 font-semibold rounded-full shadow-[0_5px_20px_rgba(138,77,204,0.4)] transition-all hover:-translate-y-1 hover:shadow-lg">
                            Login as Project Manager
                        </button>
                    </div>
                </div>
            </div>

            {modalRole && <LoginModal role={modalRole} onClose={() => setModalRole(null)} />}
        </div>
    );
};

export default LoginPage;