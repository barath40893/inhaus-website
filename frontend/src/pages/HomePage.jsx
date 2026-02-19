import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    customers: 0,
    products: 0,
    experience: 0
  });

  useEffect(() => {
    // Animate counters
    const targetStats = { projects: 500, customers: 1000, products: 50, experience: 10 };
    const duration = 2000;
    const steps = 50;
    const stepDuration = duration / steps;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setStats({
        projects: Math.floor((targetStats.projects / steps) * currentStep),
        customers: Math.floor((targetStats.customers / steps) * currentStep),
        products: Math.floor((targetStats.products / steps) * currentStep),
        experience: Math.floor((targetStats.experience / steps) * currentStep)
      });
      
      if (currentStep >= steps) clearInterval(interval);
    }, stepDuration);
    
    return () => clearInterval(interval);
  }, []);

  const solutions = [
    {
      title: 'Smart Homes',
      description: 'Transform your living space with intelligent automation for comfort, security, and energy efficiency.',
      icon: '🏠',
      link: '/smart-homes',
      features: ['Voice Control', 'Energy Savings', 'Security', 'Comfort']
    },
    {
      title: 'Smart Commercial',
      description: 'Boost productivity and efficiency with enterprise-grade automation solutions for offices and businesses.',
      icon: '🏢',
      link: '/smart-commercial',
      features: ['Access Control', 'Climate', 'Lighting', 'Analytics']
    },
    {
      title: 'Smart Hospitality',
      description: 'Elevate guest experience with seamless automation for hotels, resorts, and hospitality venues.',
      icon: '🏨',
      link: '/smart-hospitality',
      features: ['Guest Control', 'Energy Mgmt', 'Ambience', 'Service']
    }
  ];

  const features = [
    { icon: '⚡', title: 'Easy Installation', desc: 'Quick setup with minimal disruption' },
    { icon: '📱', title: 'App Control', desc: 'Control from anywhere, anytime' },
    { icon: '🔒', title: 'Secure', desc: 'Bank-grade encryption & security' },
    { icon: '🎨', title: 'Customizable', desc: 'Tailored to your exact needs' },
    { icon: '💡', title: 'Energy Efficient', desc: 'Reduce bills by up to 40%' },
    { icon: '🛠️', title: '24/7 Support', desc: 'Always here to help you' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Modern Tech-Focused */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 107, 53, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 107, 53, 0.3) 0%, transparent 50%)'
          }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Transform Your Space with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Smart Automation
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
              Experience the future of living with InHaus - India's leading smart automation solution for homes, offices, and hotels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-lg font-semibold rounded-lg hover:from-orange-600 hover:to-orange-700 transform hover:scale-105 transition-all shadow-lg"
              >
                Explore Products
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/30"
              >
                Get Consultation
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.projects}+</div>
              <div className="text-gray-300">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.customers}+</div>
              <div className="text-gray-300">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.products}+</div>
              <div className="text-gray-300">Smart Products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stats.experience}+</div>
              <div className="text-gray-300">Years Experience</div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Solutions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Comprehensive automation solutions tailored for every need</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                onClick={() => navigate(solution.link)}
                className="group cursor-pointer bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100"
              >
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform">{solution.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{solution.title}</h3>
                <p className="text-gray-600 mb-6">{solution.description}</p>
                <div className="space-y-2 mb-6">
                  {solution.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center text-sm text-gray-700">
                      <svg className="w-4 h-4 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                <button className="text-orange-600 font-semibold group-hover:text-orange-700 flex items-center">
                  Learn More
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose InHaus?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the difference with our cutting-edge technology</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">Transform your space into a smart, efficient, and comfortable environment today.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/contact')}
                className="px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Request Quote
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="px-8 py-4 bg-orange-800 text-white text-lg font-semibold rounded-lg hover:bg-orange-900 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
