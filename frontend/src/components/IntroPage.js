import React from 'react';
import { Bed } from 'lucide-react';

const IntroPage = ({ onEnter }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center overflow-hidden">
      {/* Animated background overlay */}
      <div className="absolute inset-0 opacity-20">
        <img 
          src="/Images/park-hyatt-sydney.png" 
          alt="Hotel Background" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/assets/images/external/intro/hotel-background.jpg';
          }}
        />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-400 rounded-full opacity-60 float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6">
        {/* Animated logo */}
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl mb-8 relative overflow-hidden group pulse-slow">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <Bed className="w-16 h-16 text-white relative z-10" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-300 animate-ping opacity-75"></div>
          </div>
          
          {/* Brand name */}
          <div className="mb-6 overflow-hidden">
            <h1 className="text-7xl md:text-9xl font-extralight text-white tracking-[0.25em] typing-animation">
              SKY NEST
            </h1>
          </div>
          
          {/* Divider line */}
          <div className="relative w-64 h-px mx-auto mb-6 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0"
                 style={{ 
                   animation: 'fadeIn 1.5s ease-out 0.8s forwards' 
                 }}></div>
          </div>
          
          {/* Subtitle */}
          <p className="text-3xl md:text-5xl font-light text-amber-100 tracking-[0.3em] mb-4 gradient-text">
            HOTELS
          </p>
        </div>

        {/* Tagline */}
        <div className="mb-16 opacity-0" style={{ animation: 'fadeInUp 0.8s ease-out 1.3s forwards' }}>
          <p className="text-xl md:text-2xl text-gray-300 font-light tracking-wide mb-2">
            Where Luxury Meets Tranquility
          </p>
          <p className="text-md text-gray-400">Experience Elegance in Colombo, Kandy & Galle</p>
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="group relative px-16 py-6 overflow-hidden rounded-full opacity-0 btn-primary"
          style={{ animation: 'fadeInUp 0.8s ease-out 1.6s forwards', marginTop: '30px' }}
        >
          <span className="relative z-10 text-white text-lg font-semibold tracking-[0.2em] flex items-center gap-3">
            ENTER
            <span className="transform group-hover:translate-x-2 transition-transform duration-300">→</span>
          </span>
        </button>

        {/* Scroll indicator */}
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 opacity-0" 
             style={{ animation: 'fadeIn 1s ease-out 2s forwards' }}>
          <div className="relative">
            <div className="w-6 h-10 border-2 border-amber-400/50 rounded-full flex items-start justify-center p-2" style={{ marginBottom: '18px' }}>
              <div className="w-1.5 h-3 bg-amber-400 rounded-full" 
                   style={{ animation: 'scrollBounce 2s ease-in-out infinite' }}></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scrollBounce {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(8px);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default IntroPage;