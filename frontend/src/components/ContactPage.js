import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    location: 'general'
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const locations = [
    {
      id: 'colombo',
      name: 'Colombo',
      address: '123 Galle Road, Colombo 03, Sri Lanka',
      phone: '+94 11 234 5678',
      email: 'colombo@skynesthotels.com',
      hours: '24/7 Reception',
      coordinates: { lat: 6.9271, lng: 79.8612 }
    },
    {
      id: 'kandy',
      name: 'Kandy',
      address: '456 Peradeniya Road, Kandy, Sri Lanka',
      phone: '+94 81 234 5678',
      email: 'kandy@skynesthotels.com',
      hours: '24/7 Reception',
      coordinates: { lat: 7.2906, lng: 80.6337 }
    },
    {
      id: 'galle',
      name: 'Galle',
      address: '789 Beach Road, Galle Fort, Sri Lanka',
      phone: '+94 91 234 5678',
      email: 'galle@skynesthotels.com',
      hours: '24/7 Reception',
      coordinates: { lat: 6.0535, lng: 80.2210 }
    }
  ];

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
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccess(true);
      setIsSubmitting(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        location: 'general'
      });
      setFormErrors({});
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
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

        {/* Location Cards Row */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light text-gray-800 mb-4">Our Locations</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div key={location.id} className="bg-white rounded-2xl shadow-xl p-6 card-hover transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-semibold text-gray-800 text-center mb-4">{location.name}</h3>
                
                <div className="space-y-3 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{location.address}</span>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`tel:${location.phone}`} className="text-amber-600 hover:text-amber-700 text-sm">
                      {location.phone}
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <a href={`mailto:${location.email}`} className="text-blue-600 hover:text-blue-700 text-sm">
                      {location.email}
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 text-sm">{location.hours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
                    className={`form-input ${formErrors.name ? 'border-red-500' : ''}`}
                    placeholder="SkyNest"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.name}
                    </p>
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
                    className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                    placeholder="abc@gmail.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formErrors.email}
                    </p>
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
                  className="form-input"
                  placeholder="+94 123 456721"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inquiry Type
                </label>
                <select
                  value={contactForm.location}
                  onChange={(e) => setContactForm({...contactForm, location: e.target.value})}
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