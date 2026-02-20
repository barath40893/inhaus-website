import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Users, Award, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower homes worldwide with cutting-edge IoT solutions that transform everyday spaces into intelligent, connected experiences.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push the boundaries of technology to deliver innovative solutions that meet the evolving needs of modern living.',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Our customers are at the heart of everything we do. We build solutions that truly make a difference in their lives.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We are committed to delivering enterprise-grade solutions with uncompromising quality and reliability.',
    },
  ];

  const stats = [
    { value: '2019', label: 'Founded' },
    { value: '5000+', label: 'Happy Homes' },
    { value: '50+', label: 'Team Members' },
    { value: '30+', label: 'Products' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden" data-testid="about-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <div className="max-w-4xl">
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-sm font-medium mb-6"
            >
              About Us
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              Building the Future
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                of Smart Living
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-neutral-400 max-w-2xl leading-relaxed"
            >
              We're on a mission to make intelligent home automation accessible, 
              affordable, and beautifully designed for everyone.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-white/5">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-sm text-neutral-500 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 md:py-32" data-testid="story-section">
        <div className="container mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                From Vision to
                <br />
                <span className="text-neutral-500">Reality</span>
              </h2>
              <div className="space-y-6 text-neutral-400 leading-relaxed">
                <p>
                  InHaus was founded with a simple yet powerful vision: to make smart home 
                  technology accessible and affordable for everyone. We recognized that while 
                  the potential of smart devices was enormous, the complexity of setup and 
                  the high costs were significant barriers for many families.
                </p>
                <p>
                  Today, we're proud to serve thousands of homes across the country, transforming 
                  ordinary houses into extraordinary smart homes. Our products are designed with 
                  you in mind—easy to install, simple to use, and built to last.
                </p>
                <p>
                  What sets us apart is our commitment to quality and customer satisfaction. 
                  We don't just sell products; we create experiences. With InHaus, you're 
                  investing in a smarter way of living.
                </p>
              </div>
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
                  src="https://images.pexels.com/photos/7794060/pexels-photo-7794060.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="InHaus team"
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
              </div>
              
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 md:py-32 relative" data-testid="values-section">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm text-orange-500 uppercase tracking-widest font-medium mb-4 block">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              The Principles That
              <br />
              <span className="text-neutral-500">Guide Us</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group p-8 bg-neutral-900/40 border border-white/5 rounded-3xl hover:border-orange-500/30 transition-all duration-500"
                data-testid={`value-card-${index}`}
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 group-hover:bg-orange-500/20 transition-colors">
                  <value.icon size={24} className="text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{value.title}</h3>
                <p className="text-neutral-400 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10" />
        <div className="container mx-auto px-4 md:px-8 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Experience
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-400">
                Smart Living?
              </span>
            </h2>
            <p className="text-neutral-400 text-lg mb-10">
              Join thousands of homeowners who have already transformed their spaces with InHaus.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <button className="group flex items-center justify-center gap-3 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-medium transition-all duration-300 shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]">
                  Explore Products
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link to="/contact">
                <button className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full font-medium transition-all duration-300">
                  Get in Touch
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

export default AboutPage;
