import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Icons
import { 
  BsGear, 
  BsShieldLock, 
  BsBell, 
  BsEnvelope, 
  BsDownload, 
  BsTrash,
  BsCheck,
  BsX
} from 'react-icons/bs';

const Settings = () => {
  const { currentUser, updateProfile, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // Profile settings
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [dailyReminders, setDailyReminders] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(false);
  
  // Privacy settings
  const [shareDataForResearch, setShareDataForResearch] = useState(false);
  const [allowAnonymizedUsage, setAllowAnonymizedUsage] = useState(false);
  
  // Load user data
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
      
      // In a real app, these would be fetched from user preferences in the database
      setDailyReminders(currentUser.preferences?.dailyReminders || false);
      setEmailNotifications(currentUser.preferences?.emailNotifications || false);
      setWeeklyReport(currentUser.preferences?.weeklyReport || false);
      setShareDataForResearch(currentUser.preferences?.shareDataForResearch || false);
      setAllowAnonymizedUsage(currentUser.preferences?.allowAnonymizedUsage || false);
    }
  }, [currentUser]);
  
  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would call the updateProfile function from AuthContext
      // For now, we'll simulate a successful update
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // updateProfile({ name, email, bio });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would make an API call to update the password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to update password. Please check your current password and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle notification settings update
  const handleNotificationUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would make an API call to update notification settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Notification preferences updated successfully');
    } catch (err) {
      setError('Failed to update notification preferences. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle privacy settings update
  const handlePrivacyUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would make an API call to update privacy settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      setSuccess('Privacy preferences updated successfully');
    } catch (err) {
      setError('Failed to update privacy preferences. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle data export
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      // In a real app, this would make an API call to generate and download user data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Mock data export
      const userData = {
        profile: {
          name: currentUser?.name,
          email: currentUser?.email,
          bio: currentUser?.bio
        },
        moodEntries: JSON.parse(localStorage.getItem('moodEntries') || '[]'),
        chatHistory: JSON.parse(localStorage.getItem('chatHistory') || '[]')
      };
      
      // Create downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create and click a download link
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mindful-ai-data.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccess('Your data has been exported successfully');
    } catch (err) {
      setError('Failed to export data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        setError('');
        
        // In a real app, this would make an API call to delete the account
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        // Clear local storage
        localStorage.removeItem('moodEntries');
        localStorage.removeItem('chatHistory');
        
        // Log out the user
        logout();
        
        // Redirect to home page would happen automatically due to AuthContext
      } catch (err) {
        setError('Failed to delete account. Please try again.');
        console.error(err);
        setIsLoading(false);
      }
    }
  };

  // If user is not logged in, show a message
  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your settings.
          </p>
          <a 
            href="/login" 
            className="btn-primary"
          >
            Log In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings tabs */}
        <div className="md:w-1/4 space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center p-3 rounded-md text-left ${
              activeTab === 'profile'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BsGear className="w-5 h-5 mr-3" />
            Profile Settings
          </button>
          
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center p-3 rounded-md text-left ${
              activeTab === 'security'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BsShieldLock className="w-5 h-5 mr-3" />
            Security
          </button>
          
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center p-3 rounded-md text-left ${
              activeTab === 'notifications'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BsBell className="w-5 h-5 mr-3" />
            Notifications
          </button>
          
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center p-3 rounded-md text-left ${
              activeTab === 'privacy'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BsShieldLock className="w-5 h-5 mr-3" />
            Privacy
          </button>
          
          <button
            onClick={() => setActiveTab('data')}
            className={`w-full flex items-center p-3 rounded-md text-left ${
              activeTab === 'data'
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <BsDownload className="w-5 h-5 mr-3" />
            Data Management
          </button>
        </div>
        
        {/* Settings content */}
        <div className="md:w-3/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            {/* Success/Error messages */}
            {success && (
              <div className="bg-green-100 dark:bg-green-900/20 border-l-4 border-green-500 text-green-700 dark:text-green-300 p-4 mb-4 flex items-start">
                <BsCheck className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-4 flex items-start">
                <BsX className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Profile Settings */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Settings</h2>
                
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio (Optional)
                      </label>
                      <textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Tell us a little about yourself..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                
                <form onSubmit={handlePasswordUpdate}>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                        minLength="8"
                      />
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </form>
                
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Two-Factor Authentication</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Set Up Two-Factor Authentication
                  </button>
                </div>
              </div>
            )}
            
            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notification Settings</h2>
                
                <form onSubmit={handleNotificationUpdate}>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="daily-reminders"
                          type="checkbox"
                          checked={dailyReminders}
                          onChange={(e) => setDailyReminders(e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="daily-reminders" className="font-medium text-gray-700 dark:text-gray-300">
                          Daily Reminders
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Receive daily reminders to check in and track your mood.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="email-notifications"
                          type="checkbox"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="email-notifications" className="font-medium text-gray-700 dark:text-gray-300">
                          Email Notifications
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Receive notifications and updates via email.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="weekly-report"
                          type="checkbox"
                          checked={weeklyReport}
                          onChange={(e) => setWeeklyReport(e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="weekly-report" className="font-medium text-gray-700 dark:text-gray-300">
                          Weekly Report
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Receive a weekly summary of your mood and progress.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Privacy Settings</h2>
                
                <form onSubmit={handlePrivacyUpdate}>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="share-data"
                          type="checkbox"
                          checked={shareDataForResearch}
                          onChange={(e) => setShareDataForResearch(e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="share-data" className="font-medium text-gray-700 dark:text-gray-300">
                          Share Data for Research
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Allow your anonymized data to be used for mental health research to improve our services.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="anonymized-usage"
                          type="checkbox"
                          checked={allowAnonymizedUsage}
                          onChange={(e) => setAllowAnonymizedUsage(e.target.checked)}
                          className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="anonymized-usage" className="font-medium text-gray-700 dark:text-gray-300">
                          Allow Anonymized Usage Statistics
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                          Help us improve by allowing collection of anonymized usage statistics.
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </button>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Read our <a href="/privacy-policy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a> for more information on how we handle your data.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Data Management */}
            {activeTab === 'data' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Export Your Data</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Download a copy of your data, including your profile information, mood entries, and chat history.
                    </p>
                    <button
                      onClick={handleExportData}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      disabled={isLoading}
                    >
                      <BsDownload className="mr-2 h-5 w-5" />
                      {isLoading ? 'Exporting...' : 'Export Data'}
                    </button>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Delete Your Account</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={isLoading}
                    >
                      <BsTrash className="mr-2 h-5 w-5" />
                      {isLoading ? 'Deleting...' : 'Delete Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 