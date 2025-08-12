import React, { useState, useEffect } from 'react';
import axios from 'axios';
import apiConfig from '../../config/api'
import { showErrorAlert, showSuccessAlert } from '@/src/utils/alerts';

interface Profile {
    fullname: string;
    email: string;
    phone_number: string;
    username?: string;
    profile_image?: string | null;
}

interface PasswordChangeData {
    current_password: string;
    new_password: string;
    confirm_password: string;
}

const ProfileView: React.FC = () => {
    const [profile, setProfile] = useState<Profile>({
        fullname: 'Loading...',
        email: 'Loading...',
        phone_number: 'Loading...'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Password change modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState<PasswordChangeData>({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordRequirements, setPasswordRequirements] = useState({
        hasMinLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('authToken');
                const response = await axios.get(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROJECT_MANAGER_PROFILE}`,{
                        headers: {
                          'Authorization': `Bearer ${token}`
                        },
                        timeout: apiConfig.TIMEOUT
                      });
                
                if (!response.data || !response.data.data) {
                    throw new Error('Invalid profile data format');
                }
                
                const profileData = response.data.data;
                setProfile({
                    fullname: profileData.fullname || '',
                    email: profileData.email || '',
                    phone_number: profileData.phone_number || '',
                    username: profileData.username || '',
                    profile_image: profileData.profile_image
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile data');
                setProfile({
                    fullname: 'Valentine James',
                    email: 'jimvalex54@gmail.com',
                    phone_number: '07015363296',
                    username: 'Valex'
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, []);

     // Update password requirements when new password changes
    useEffect(() => {
        const newPassword = passwordData.new_password;
        setPasswordRequirements({
            hasMinLength: newPassword.length >= 8,
            hasUpperCase: /[A-Z]/.test(newPassword),
            hasLowerCase: /[a-z]/.test(newPassword),
            hasNumber: /[0-9]/.test(newPassword),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
        });
    }, [passwordData.new_password]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({...profile, [e.target.name]: e.target.value});
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({...passwordData, [e.target.name]: e.target.value});
    };
    
    const handleSave = async () => {
        try {
            setIsSaving(true);
            setError(null);
            
            const updateData = {
                fullname: profile.fullname,
                email: profile.email,
                phone_number: profile.phone_number,
                username: profile.username
            };
            const token = localStorage.getItem('authToken');
            const response = await axios.put(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROFILE_MANAGER_UPDATE_PROFILE}`, updateData,{
                    headers: {
                      'Authorization': `Bearer ${token}`
                    },
                    timeout: apiConfig.TIMEOUT
                  });
            
            if (!response.data || !response.data.data) {
                throw new Error('No data returned from server');
            }
            
            setSuccess('Profile updated successfully!');
            const updatedProfile = response.data.data;
            setProfile({
                fullname: updatedProfile.fullname,
                email: updatedProfile.email,
                phone_number: updatedProfile.phone_number,
                username: updatedProfile.username,
                profile_image: updatedProfile.profile_image
            });

            showSuccessAlert('success', 'Profile has been updated')
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
            showErrorAlert('Error!', err.response?.data?.message)
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSubmit = async () => {
        try {
            // Validate passwords match
            if (passwordData.new_password !== passwordData.confirm_password) {
                setPasswordError("New passwords don't match");
                return;
            }
            
            // Validate password strength (optional)
            if (passwordData.new_password.length < 8) {
                setPasswordError("Password must be at least 8 characters");
                return;
            }

            // Validate all password requirements
            const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);
            if (!allRequirementsMet) {
                setPasswordError("Password doesn't meet all requirements");
                return;
            }
            
            setIsChangingPassword(true);
            setPasswordError(null);
            
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.AUTH.PROFILE_MANAGER_CHANGE_PASSWORD}`, // Make sure this endpoint is correct
                {
                    currentPassword: passwordData.current_password,
                    newPassword: passwordData.new_password,
                    confirmPassword: passwordData.confirm_password
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: apiConfig.TIMEOUT
                }
            );
            
            if (response.data.success) {
                showSuccessAlert('Success', 'Password changed successfully!');
                setShowPasswordModal(false);
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            } else {
                throw new Error(response.data.message || 'Failed to change password');
            }
        } catch (err) {
            console.error('Error changing password:', err);
            setPasswordError(err.response?.data?.message || 'Failed to change password. Please try again.');
            showErrorAlert('Error', err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold text-[#1a0a2e] mb-6">My Profile</h2>
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-[#1a0a2e] mb-6">My Profile</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    {success}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-purple-600 flex items-center justify-center text-white text-5xl font-bold">
                        {profile.fullname?.charAt(0)?.toUpperCase() || 'V'}
                    </div>
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-gray-700 text-white rounded-full border-2 border-white">
                        📷
                    </button>
                </div>
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input 
                            type="text" 
                            name="username" 
                            value={profile.username} 
                            onChange={handleChange} 
                            className="w-full p-3 border rounded-lg"
                            disabled
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input 
                            type="text" 
                            name="fullname" 
                            value={profile.fullname} 
                            onChange={handleChange} 
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={profile.email} 
                            onChange={handleChange} 
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone_number" 
                            value={profile.phone_number} 
                            onChange={handleChange} 
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>
                    <div className="flex justify-between">
                        <button 
                            onClick={() => setShowPasswordModal(true)}
                            className="px-4 py-2 text-purple-600 font-medium border border-purple-600 rounded-lg hover:bg-purple-50"
                        >
                            Change Password
                        </button>
                        <button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className={`px-6 py-2 bg-purple-600 text-white font-bold rounded-lg ${isSaving ? 'opacity-70' : 'hover:bg-purple-700'}`}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-[#1a0a2e] mb-4">Change Password</h3>
                        
                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                                {passwordError}
                            </div>
                        )}
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                                <input 
                                    type="password" 
                                    name="current_password" 
                                    value={passwordData.current_password} 
                                    onChange={handlePasswordChange} 
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    name="new_password" 
                                    value={passwordData.new_password} 
                                    onChange={handlePasswordChange} 
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Enter new password"
                                />
                                {/* Password requirements checklist */}
                                <div className="mt-2 text-sm text-gray-600">
                                    <div className={`flex items-center ${passwordRequirements.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordRequirements.hasMinLength ? (
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            </svg>
                                        )}
                                        At least 8 characters
                                    </div>
                                    <div className={`flex items-center ${passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordRequirements.hasUpperCase ? (
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            </svg>
                                        )}
                                        At least one uppercase letter
                                    </div>
                                    <div className={`flex items-center ${passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordRequirements.hasLowerCase ? (
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            </svg>
                                        )}
                                        At least one lowercase letter
                                    </div>
                                    <div className={`flex items-center ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordRequirements.hasNumber ? (
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            </svg>
                                        )}
                                        At least one number
                                    </div>
                                    <div className={`flex items-center ${passwordRequirements.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                                        {passwordRequirements.hasSpecialChar ? (
                                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                            </svg>
                                        )}
                                        At least one special character
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirm_password" 
                                    value={passwordData.confirm_password} 
                                    onChange={handlePasswordChange} 
                                    className="w-full p-3 border rounded-lg"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                onClick={() => {
                                    setShowPasswordModal(false);
                                    setPasswordError(null);
                                }}
                                className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={isChangingPassword}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handlePasswordSubmit}
                                disabled={isChangingPassword || !Object.values(passwordRequirements).every(Boolean)}
                                className={`px-6 py-2 bg-purple-600 text-white font-bold rounded-lg ${isChangingPassword ? 'opacity-70' : 'hover:bg-purple-700'} ${!Object.values(passwordRequirements).every(Boolean) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isChangingPassword ? 'Changing...' : 'Change Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileView;