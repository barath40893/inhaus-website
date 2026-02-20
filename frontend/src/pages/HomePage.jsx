import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Zap, Shield, Smartphone, Mic, Clock, TrendingUp, ChevronRight, Play, CheckCircle } from 'lucide-react';

const HomePage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Zap,
      title: 'Instant Control',
      description: 'Command your entire home with a single tap. Lights, climate, security—all at your fingertips.',
    },
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Enterprise-grade protection with real-time monitoring, smart locks, and instant alerts.',
    },
    {
      icon: TrendingUp,
      title: 'Energy Intelligence',
      description: 'AI-powered optimization that learns your habits and reduces energy costs by up to 30%.',
    },
    {
      icon: Mic,
      title: 'Voice Activated',
      description: 'Seamless integration with Alexa, Google Home, and Siri for hands-free living.',
    },
    {
      icon: Smartphone,
      title: 'Remote Access',
      description: 'Monitor and control your home from anywhere in the world through our intuitive app.',
    },
    {
      icon: Clock,
      title: 'Smart Automation',
      description: 'Set intelligent schedules and scenes that adapt to your lifestyle automatically.',
    },
  ];

  const stats = [
    { value: '5000+', label: 'Smart Homes' },
    { value: '50K+', label: 'Devices Active' },
    { value: '30%', label: 'Energy Saved' },
    { value: '24/7', label: 'Support' },
  ];

  const partners = [
    { name: 'Amazon Alexa', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png' },
    { name: 'Google Home', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Assistant_logo.png' },
    { name: 'Apple HomeKit', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Apple-logo.png' },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20" data-testid="hero-section">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/30441226/pexels-photo-30441226.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Modern smart home interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/70 via-[#0A0A0A]/80 to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-transparent to-[#0A0A0A]/50" />
        </div>

        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                The Future of Smart Living
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold leading-none mb-8"
              data-testid="hero-title"
            >
              Your Home,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Reimagined.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-8 leading-relaxed"
            >
              Experience the next generation of home automation. Seamless control, 
              intelligent energy management, and uncompromising security—all unified 
              in one elegant ecosystem.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link to="/products" data-testid="hero-cta-primary">
                <button className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] hover:scale-105">
                  Explore Products
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/contact" data-testid="hero-cta-secondary">
                <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 backdrop-blur-sm">
                  <Play size={18} className="text-orange-500" />
                  Get a Free Quote
                </button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 text-sm text-neutral-400"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>Free Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>2-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-500" size={18} />
                <span>24/7 Support</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-neutral-500 uppercase tracking-widest">Scroll</span>
          <div className="w-6 h-10 rounded-full border-2 border-neutral-600 flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-1 bg-orange-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5" data-testid="stats-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Works With Section */}
      <section className="py-16" data-testid="partners-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">Works Seamlessly With</p>
          </motion.div>
          
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-16">
            {/* Amazon Alexa */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png" 
                alt="Amazon Alexa" 
                className="w-10 h-10 object-contain opacity-60"
              />
              <span className="font-medium">Amazon Alexa</span>
            </motion.div>
            
            {/* Google Home */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Assistant_logo.png" 
                alt="Google Home" 
                className="w-10 h-10 object-contain opacity-60"
              />
              <span className="font-medium">Google Home</span>
            </motion.div>
            
            {/* Apple HomeKit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <svg className="w-10 h-10 opacity-60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="font-medium">Apple HomeKit</span>
            </motion.div>

            {/* Matter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-3 text-neutral-400 hover:text-white transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-lg font-bold text-orange-500">M</span>
              </div>
              <span className="font-medium">Matter</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32" data-testid="features-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
              Why InHaus
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Intelligence Meets
              <br />
              <span className="text-neutral-500">Elegance</span>
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Every feature designed to simplify your life while elevating your home experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setActiveFeature(index)}
                className={`group relative p-8 rounded-3xl border transition-all duration-500 cursor-pointer ${
                  activeFeature === index
                    ? 'bg-neutral-900/60 border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)]'
                    : 'bg-neutral-900/20 border-white/5 hover:bg-neutral-900/40 hover:border-white/10'
                }`}
                data-testid={`feature-card-${index}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 ${
                  activeFeature === index
                    ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                  <feature.icon size={24} className={activeFeature === index ? 'text-white' : 'text-orange-500'} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{feature.description}</p>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 pointer-events-none ${
                  activeFeature === index ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute -inset-px bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 rounded-3xl blur-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section className="py-24 md:py-32 relative overflow-hidden" data-testid="showcase-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
                Our Products
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Premium Smart Devices
                <br />
                <span className="text-neutral-500">Built for Modern Living</span>
              </h2>
              <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
                From intelligent lighting to advanced security systems, our curated collection 
                transforms ordinary spaces into extraordinary smart environments.
              </p>
              
              <div className="space-y-4 mb-10">
                {['Smart Switches & Dimmers', 'Security Cameras & Locks', 'Climate Control Systems', 'Voice-Activated Hubs'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-neutral-300">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <ChevronRight size={16} className="text-orange-500" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <Link to="/products">
                <button className="group flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/30 text-white px-8 py-4 rounded-full font-medium transition-all duration-300">
                  Browse All Products
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1642610956697-99ead57cec7b?w=800&q=80"
                  alt="Smart home devices showcase"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-neutral-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Zap className="text-orange-500" size={24} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">30%</div>
                    <div className="text-sm text-neutral-400">Energy Savings</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative" data-testid="cta-section">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10" />
        
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Your Living Space?
              </span>
            </h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of homeowners who have already made the switch to intelligent living. 
              Get a free consultation and personalized quote today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-full font-medium text-lg transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)] hover:scale-105">
                  Get Free Consultation
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/products">
                <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-10 py-5 rounded-full font-medium text-lg transition-all duration-300">
                  View Products
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
