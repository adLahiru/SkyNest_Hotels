import React from 'react';
import { Bed, MapPin, Phone, Mail, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const locations = [
    { name: 'Colombo', address: '123 Galle Road, Colombo 03' },
    { name: 'Kandy', address: '456 Peradeniya Road, Kandy' },
    { name: 'Galle', address: '789 Beach Road, Galle Fort' }
  ];



  const policies = [
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cancellation Policy', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: '#', color: 'hover:text-blue-500' },
    { name: 'Twitter', icon: Twitter, href: '#', color: 'hover:text-blue-400' },
    { name: 'Instagram', icon: Instagram, href: '#', color: 'hover:text-pink-500' },
    { name: 'YouTube', icon: Youtube, href: '#', color: 'hover:text-red-500' }
  ];

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-12">
          {/* Brand & Description */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Bed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-light tracking-wider">SKY NEST HOTELS</span>
            </div>
            
            <p className="text-blue-200 leading-relaxed mb-6">
              Experience unparalleled luxury and comfort at Sri Lanka's premier hotel chain. 
              Where every stay becomes an unforgettable memory.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-blue-200">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">+94 11 234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-200">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">info@skynesthotels.com</span>
              </div>
            </div>
          </div>

          {/* Locations - Centered */}
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-6">Our Locations</h3>
            <div className="space-y-4">
              {locations.map((location, index) => (
                <div key={index} className="text-blue-200">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <div className="text-center">
                      <h4 className="font-medium text-white text-sm">{location.name}</h4>
                      <p className="text-xs">{location.address}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Media Links - Aligned Right */}
          <div className="flex flex-col items-end">
            <h3 className="text-lg font-semibold mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-200 ${social.color} transition-all duration-300 hover:bg-white/20 hover:scale-110`}
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-blue-700"></div>

      {/* Bottom Footer */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Copyright */}
          <div className="text-blue-200 text-sm">
            <p>© {currentYear} Sky Nest Hotels. All rights reserved.</p>
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap justify-center space-x-6">
            {policies.map((policy, index) => (
              <a
                key={index}
                href={policy.href}
                className="text-blue-200 hover:text-white transition-colors duration-300 text-sm"
              >
                {policy.name}
              </a>
            ))}
          </div>

          {/* Certifications/Awards */}
          <div className="flex items-center space-x-4">
            <div className="text-blue-200 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">★</span>
                </div>
                <span>5-Star Luxury</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-2xl hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-110 flex items-center justify-center z-40"
        aria-label="Back to top"
      >
        <span className="text-lg font-bold">↑</span>
      </button>

      <style>{`
        @media (max-width: 768px) {
          .fixed.bottom-8.right-8 {
            bottom: 1rem;
            right: 1rem;
            width: 3rem;
            height: 3rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;