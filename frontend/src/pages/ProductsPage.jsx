import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Card, CardContent } from '../components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Lightbulb, Lock, Smartphone, Utensils, Fan, QrCode, Building, Home } from 'lucide-react';

const ProductsPage = () => {
  const productCategories = [
    {
      icon: Home,
      title: 'Smart Switch - 2 Gang',
      description: 'Smart switches with voice control, scheduling, and energy monitoring capabilities.',
      features: ['Voice Control', 'Energy Monitoring', 'Remote Access', 'Touch Panel'],
      price: 2999,
      link: '/product/smart-switch-2',
    },
    {
      icon: Lightbulb,
      title: 'RGB Smart Bulb',
      description: 'Intelligent lighting systems with customizable colors, brightness, and automation.',
      features: ['RGB Colors', 'Dimming', 'Scenes', 'Automation'],
      price: 1499,
      link: '/product/smart-bulb',
    },
    {
      icon: Lock,
      title: 'Security Systems',
      description: 'Advanced security solutions including smart locks, cameras, and sensors.',
      features: ['HD Video', 'Motion Detection', 'Alerts', 'Cloud Storage'],
    },
    {
      icon: Smartphone,
      title: 'Consumer Appliances',
      description: 'Smart home appliances that bring convenience and efficiency to daily life.',
      features: ['Remote Control', 'Scheduling', 'Energy Saving', 'Voice Commands'],
    },
    {
      icon: Utensils,
      title: 'Kitchen Appliances',
      description: 'Connected kitchen devices for a smarter cooking experience.',
      features: ['Recipe Integration', 'Timer Control', 'Temperature Control', 'Notifications'],
    },
    {
      icon: Fan,
      title: 'Motorised Products',
      description: 'Smart motorized curtains, blinds, and other automated mechanical devices.',
      features: ['Auto Scheduling', 'Light Sensors', 'Quiet Operation', 'Remote Control'],
    },
    {
      icon: Building,
      title: 'Commercial Devices',
      description: 'Enterprise-grade IoT solutions for commercial and industrial applications.',
      features: ['Scalable', 'API Integration', 'Analytics', 'Multi-user'],
    },
    {
      icon: QrCode,
      title: 'QR Products',
      description: 'Innovative QR-based smart products for contactless control and interaction.',
      features: ['Contactless', 'Easy Setup', 'Secure', 'No App Required'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Our <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text">Products</span>
            </h1>
            <p className="text-xl text-gray-600">
              Discover our comprehensive range of smart IoT products designed to transform any space into an intelligent environment
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productCategories.map((product, index) => (
              <Card
                key={index}
                className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 group hover:shadow-xl"
              >
                <CardContent className="p-6">
                  <div className="mb-4 p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <product.icon size={32} className="text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{product.title}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Contact us today to learn more about our products and how we can help you build your smart ecosystem.
          </p>
          <Link to="/contact">
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg rounded-full">
              Contact Sales
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductsPage;
