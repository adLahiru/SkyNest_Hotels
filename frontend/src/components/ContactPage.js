import React, { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import contactService from '../services/contactService';
import userService from '../services/userService';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiry_type: 'general'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch user data if logged in
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUserData(true);
        const token = localStorage.getItem('accessToken'); // Fixed: use 'accessToken' not 'token'
        
        if (token) {
          setIsLoggedIn(true);
          
          // Always fetch from API to get latest data (including phone)
          const response = await userService.getCurrentUserProfile();
          
          if (response.success && response.user) {
            // Use fresh API data
            setContactForm(prev => ({
              ...prev,
              name: response.user.name || '',
              email: response.user.email || '',
              phone: response.user.phone || ''
            }));
          } else {
            // Fallback to localStorage only if API fails
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              setContactForm(prev => ({
                ...prev,
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || ''
              }));
            }
          }
        } else {
          // No token - user is guest
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to localStorage on error
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setIsLoggedIn(true);
            setContactForm(prev => ({
              ...prev,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || ''
            }));
          } else {
            setIsLoggedIn(false);
          }
        } catch (parseError) {
          setIsLoggedIn(false);
        }
      } finally {
        setLoadingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  const contactReasons = [
    { id: 'general', name: 'General Inquiry' },
    { id: 'booking', name: 'Booking Assistance' },
    { id: 'complaint', name: 'Complaint/Feedback' },
    { id: 'event', name: 'Events & Conferences' },
    { id: 'media', name: 'Media Inquiry' },
    { id: 'career', name: 'Career Opportunities' }
  ];

  const validateForm = () => {
    const errors = {};
    
    if (!contactForm.name.trim()) errors.name = 'Name is required';
    if (!contactForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(contactForm.email)) errors.email = 'Email is invalid';
    if (!contactForm.subject.trim()) errors.subject = 'Subject is required';
    if (!contactForm.message.trim()) errors.message = 'Message is required';
    else if (contactForm.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError('');
    
    // Submit to backend API
    const result = await contactService.submitContactForm(contactForm);
    
    if (result.success) {
      setShowSuccess(true);
      setIsSubmitting(false);
      
      // If user is logged in, preserve their auto-filled data
      // Only reset subject, message, and inquiry_type
      if (isLoggedIn) {
        setContactForm(prev => ({
          ...prev,
          subject: '',
          message: '',
          inquiry_type: 'general'
        }));
      } else {
        // For non-logged-in users, reset everything
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiry_type: 'general'
        });
      }
      
      setFormErrors({});
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } else {
      setIsSubmitting(false);
      setSubmitError(result.message || 'Failed to send message. Please try again.');
      setTimeout(() => setSubmitError(''), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 pt-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light text-gray-800 mb-4">Get in Touch</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're here to help with any questions, bookings, or special requests. 
            Reach out to us and experience our legendary hospitality.
          </p>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="alert-success flex items-center">
              <CheckCircle className="w-5 h-5 mr-3" />
              <span>Thank you! Your message has been sent successfully. We'll respond within 24 hours.</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {submitError && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center text-red-600">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span>{submitError}</span>
            </div>
          </div>
        )}

        {/* Loading User Data */}
        {loadingUserData && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center text-blue-600">
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              <span>Loading your information...</span>
            </div>
          </div>
        )}

        {/* Contact Form Row */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-semibold text-gray-800 mb-8 flex items-center justify-center">
              <Send className="w-7 h-7 mr-3 text-amber-600" />
              Send us a Message
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    disabled={isLoggedIn}
                    className={`form-input ${formErrors.name ? 'border-red-500' : ''} ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="SkyNest"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                  {isLoggedIn && (
                    <p className="text-sm text-gray-500 mt-1">Auto-filled from your profile</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    disabled={isLoggedIn}
                    className={`form-input ${formErrors.email ? 'border-red-500' : ''} ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="abc@gmail.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                  {isLoggedIn && (
                    <p className="text-sm text-gray-500 mt-1">Auto-filled from your profile</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  disabled={isLoggedIn}
                  className={`form-input ${isLoggedIn ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  placeholder="+94 123 456721"
                />
                {isLoggedIn && (
                  <p className="text-sm text-gray-500 mt-1">Auto-filled from your profile</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  value={contactForm.inquiry_type}
                  onChange={(e) => setContactForm({...contactForm, inquiry_type: e.target.value})}
                  className="form-input"
                >
                  {contactReasons.map(reason => (
                    <option key={reason.id} value={reason.id}>
                      {reason.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                  className={`form-input ${formErrors.subject ? 'border-red-500' : ''}`}
                  placeholder="How can we help you?"
                />
                {formErrors.subject && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.subject}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  rows="6"
                  className={`form-input ${formErrors.message ? 'border-red-500' : ''}`}
                  placeholder="Tell us more about your inquiry..."
                />
                {formErrors.message && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formErrors.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  {contactForm.message.length}/500 characters
                </p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full py-4 text-lg rounded-xl font-semibold transition-all duration-300 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'btn-primary'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-3"></div>
                    Sending Message...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>


      </div>
    </div>
  );
};

export default ContactPage;