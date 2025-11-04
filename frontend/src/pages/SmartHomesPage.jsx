import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home, Lightbulb, Thermometer, Lock, Camera, Volume2, Zap, Smartphone } from 'lucide-react';

const SmartHomesPage = () => {
  const features = [
    {
      icon: Lightbulb,
      title: 'Smart Lighting',
      description: 'Control lights from anywhere, set schedules, and create the perfect ambiance.',
    },
    {
      icon: Thermometer,
      title: 'Climate Control',
      description: 'Manage temperature and comfort with intelligent thermostats.',
    },
    {
      icon: Lock,
      title: 'Smart Locks',
      description: 'Secure access with keyless entry and remote monitoring.',
    },
    {
      icon: Camera,
      title: 'Security Cameras',
      description: '24/7 monitoring with HD video and motion detection alerts.',
    },
    {
      icon: Volume2,
      title: 'Voice Control',
      description: 'Compatible with Alexa, Google Assistant, and Apple HomeKit.',
    },
    {
      icon: Zap,
      title: 'Energy Management',
      description: 'Monitor and optimize energy usage to reduce costs.',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1751945965597-71171ec7a458')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Home size={64} className="text-blue-400 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Smart <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Homes</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Seamless Smart Home Control, Anytime, Anywhere
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto">
              Transform your living space into an intelligent home that anticipates your needs, enhances comfort, and provides peace of mind through seamless automation and control.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Smart Home Features</h2>
            <p className="text-xl text-gray-400">Everything you need for a connected home</p>
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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1751945965597-71171ec7a458"
                alt="Smart Home"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Why Choose InHaus for Your Home?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Easy Installation</h3>
                    <p className="text-gray-400">Replace existing switches and devices without rewiring or renovation.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">User-Friendly App</h3>
                    <p className="text-gray-400">Control everything from a single, intuitive mobile application.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Cost Effective</h3>
                    <p className="text-gray-400">Reduce energy bills with intelligent automation and monitoring.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                    <p className="text-gray-400">Enterprise-grade security to protect your home and data.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Smartphone size={64} className="text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make Your Home Smart?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Get started today and experience the convenience of a truly connected home.
          </p>
          <Link to="/contact">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartHomesPage;
