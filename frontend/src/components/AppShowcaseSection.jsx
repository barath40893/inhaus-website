import React from 'react';
import { Smartphone, Download } from 'lucide-react';
import { Button } from './ui/button';

const AppShowcaseSection = () => {
  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-20 animate-float"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* App Preview */}
          <div className="relative animate-slideInLeft">
            <div className="relative z-10">
              <img
                src="https://images.unsplash.com/photo-1761305135267-892b33c19c61?w=600"
                alt="InHaus Mobile App"
                className="w-full max-w-md mx-auto drop-shadow-2xl animate-float"
              />
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-30"></div>
          </div>

          {/* Content */}
          <div className="animate-slideInRight">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 glass rounded-full border border-orange-500/30">
              <Smartphone className="text-orange-500" size={20} />
              <span className="text-sm font-semibold gradient-text">Mobile App</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Control from <span className="gradient-text">Anywhere</span>
            </h2>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Experience seamless control of your entire smart home ecosystem through our intuitive mobile application. Monitor, manage, and automate from anywhere in the world.
            </p>

            <div className="space-y-4 mb-10">
              {[
                'Real-time device control',
                'Energy consumption analytics',
                'Smart automation & scenes',
                'Voice assistant integration',
                'Family sharing & access control',
                'Instant alerts & notifications'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-lg">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://play.google.com/store" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-black hover:bg-gray-900 text-white px-8 py-6 rounded-2xl flex items-center gap-3 border border-gray-700 hover:border-orange-500 transition-all duration-300">
                  <Download size={24} />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-bold">Play Store</div>
                  </div>
                </Button>
              </a>
              <a 
                href="https://apps.apple.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button className="bg-black hover:bg-gray-900 text-white px-8 py-6 rounded-2xl flex items-center gap-3 border border-gray-700 hover:border-orange-500 transition-all duration-300">
                  <Download size={24} />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-bold">App Store</div>
                  </div>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppShowcaseSection;
