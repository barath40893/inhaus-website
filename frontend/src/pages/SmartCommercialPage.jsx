import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Building, Users, TrendingUp, Shield, BarChart3, Clock } from 'lucide-react';

const SmartCommercialPage = () => {
  const features = [
    {
      icon: Users,
      title: 'Multi-User Access',
      description: 'Role-based access control for different team members and departments.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Real-time insights into energy usage, occupancy, and operational efficiency.',
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Advanced security protocols with encryption and compliance standards.',
    },
    {
      icon: Clock,
      title: 'Automated Scheduling',
      description: 'Smart scheduling based on occupancy and business hours.',
    },
    {
      icon: TrendingUp,
      title: 'Cost Optimization',
      description: 'Reduce operational costs through intelligent automation.',
    },
    {
      icon: Building,
      title: 'Scalable Solution',
      description: 'Easily scale from single office to multi-location enterprise.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1750768145651-86374acaff4e')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Building size={64} className="text-orange-500 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">Commercial Spaces</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Enterprise-Grade Intelligence for Optimized Operations
            </p>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Transform your commercial spaces with intelligent automation that enhances productivity, reduces costs, and creates a better work environment for your team.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Commercial Features</h2>
            <p className="text-xl text-gray-600">Built for business efficiency and growth</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 group hover:shadow-xl"
              >
                <div className="mb-4 p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={32} className="text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Perfect For</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Office Buildings</h3>
              <p className="text-gray-600">Optimize lighting, HVAC, and security for modern workspaces.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Co-working Spaces</h3>
              <p className="text-gray-600">Flexible control for shared workspaces and meeting rooms.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Retail Stores</h3>
              <p className="text-gray-600">Create the perfect shopping environment while saving energy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Businesses Choose InHaus</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduce Operating Costs</h3>
                  <p className="text-gray-600">Save up to 30% on energy bills through intelligent automation and monitoring.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Improve Productivity</h3>
                  <p className="text-gray-600">Create optimal working conditions that boost employee satisfaction and output.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Centralized Control</h3>
                  <p className="text-gray-600">Manage all locations from a single dashboard with detailed insights.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Future-Proof Investment</h3>
                  <p className="text-gray-600">Scalable platform that grows with your business needs.</p>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1750768145651-86374acaff4e"
                alt="Smart Commercial Space"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Optimize Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how InHaus can help transform your commercial space into an intelligent, efficient environment.
          </p>
          <Link to="/contact">
            <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full">
              Schedule a Demo
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SmartCommercialPage;
