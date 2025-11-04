import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Hotel, Star, Smartphone, Zap, ThermometerSun, Volume2 } from 'lucide-react';

const SmartHospitalityPage = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Guest Control App',
      description: 'Guests can control room settings through their smartphones for personalized comfort.',
    },
    {
      icon: ThermometerSun,
      title: 'Climate Automation',
      description: 'Automatic temperature adjustment based on occupancy and guest preferences.',
    },
    {
      icon: Volume2,
      title: 'Voice Control',
      description: 'Seamless integration with voice assistants for hands-free control.',
    },
    {
      icon: Zap,
      title: 'Energy Savings',
      description: 'Significant reduction in energy costs through intelligent automation.',
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'Elevate guest satisfaction with cutting-edge technology and comfort.',
    },
    {
      icon: Hotel,
      title: 'Centralized Management',
      description: 'Manage all rooms and properties from a single administrative dashboard.',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578683010236-d716f9a3f461')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Hotel size={64} className="text-blue-400 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Hospitality</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Elevating Guest Experiences with Intelligent Luxury
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Transform your hotel or resort into a smart hospitality destination that delights guests with personalized comfort while optimizing operational efficiency.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Hospitality Features</h2>
            <p className="text-xl text-gray-400">Designed for exceptional guest experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <div className="mb-4 p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Experience */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461"
                alt="Luxury Hotel Room"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Unforgettable Guest Experiences</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Personalized Comfort</h3>
                    <p className="text-gray-400">Guests can set their preferred lighting, temperature, and ambiance instantly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Contactless Control</h3>
                    <p className="text-gray-400">Modern, hygienic solutions with mobile and voice control options.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Seamless Integration</h3>
                    <p className="text-gray-400">Works with existing property management systems and hotel infrastructure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Premium Brand Image</h3>
                    <p className="text-gray-400">Elevate your property's reputation with cutting-edge technology.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Benefits for Hoteliers</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4">30%</div>
              <p className="text-gray-400">Energy Cost Reduction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4">95%</div>
              <p className="text-gray-400">Guest Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4">24/7</div>
              <p className="text-gray-400">Support & Monitoring</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4">ROI</div>
              <p className="text-gray-400">Within 2 Years</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Star size={64} className="text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transform Your Property Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join leading hotels and resorts worldwide in delivering exceptional guest experiences.
          </p>
          <Link to="/contact">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
              Request a Consultation
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartHospitalityPage;
