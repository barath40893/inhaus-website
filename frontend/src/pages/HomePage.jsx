import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, Zap, Shield, TrendingUp, Code, Server } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const features = [
    {
      title: 'Easy to Use',
      description: 'Control your entire home with a simple, intuitive app. No technical knowledge required—just tap and go.',
      icon: Zap,
      image: 'https://images.unsplash.com/photo-1681164315430-6159b2361615',
    },
    {
      title: 'Secure & Private',
      description: 'Your data stays safe with enterprise-grade encryption and privacy protection. Your home, your control.',
      icon: Shield,
      image: 'https://images.unsplash.com/photo-1646724333918-374d81688c2d',
    },
    {
      title: 'Save Energy & Money',
      description: 'Reduce your electricity bills by up to 30% with intelligent automation and energy monitoring.',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1730382624709-81e52dd294d4',
    },
    {
      title: 'Works with Everything',
      description: 'Compatible with Alexa, Google Home, and Apple HomeKit. Control with your voice or smartphone.',
      icon: Code,
      image: 'https://images.unsplash.com/photo-1757165792338-b4e8a88ae1c7',
    },
    {
      title: 'Reliable & Always On',
      description: 'Count on 99.9% uptime and instant response times. Your smart home works when you need it.',
      icon: Server,
      image: 'https://images.pexels.com/photos/34583511/pexels-photo-34583511.jpeg',
    },
  ];

  const stats = [
    { label: 'Happy Homes', value: '5000+' },
    { label: 'Devices Installed', value: '50K+' },
    { label: 'Active Users', value: '15K+' },
    { label: 'Smart Products', value: '30+' },
  ];

  const intelligentLiving = [
    {
      id: 'home',
      title: 'For Home',
      subtitle: 'Seamless Smart Home control,',
      subtitle2: 'anytime, anywhere',
      image: 'https://images.unsplash.com/photo-1751945965597-71171ec7a458',
      link: '/smart-homes',
    },
    {
      id: 'commercial',
      title: 'For Commercial Space',
      subtitle: 'Enterprise-Grade Intelligence',
      subtitle2: 'for Optimized Operations',
      image: 'https://images.unsplash.com/photo-1750768145651-86374acaff4e',
      link: '/smart-commercial',
    },
    {
      id: 'hospitality',
      title: 'For Hospitality',
      subtitle: 'Elevating Guest Experiences',
      subtitle2: 'with Intelligent Luxury',
      image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461',
      link: '/smart-hospitality',
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1679356505858-bf4129177392')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in leading-tight">
              Transform Your Home with
              <span className="block mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text pb-2">
                Smart Living
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              The Future of Home Automation is Here
            </p>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Experience the ultimate convenience with InHaus smart home solutions. Control your lights, temperature, security, and more—all from your smartphone. Make your home smarter, safer, and more comfortable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-orange-500/50">
                  Get Started <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg rounded-full transition-all duration-300">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started with your smart home in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 h-full hover:shadow-xl">
                <div className="text-6xl font-bold text-orange-500 mb-4">1</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose Your Devices</h3>
                <p className="text-gray-600">Select from our range of smart lights, switches, sensors, and appliances that fit your needs.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-orange-500">
                <ArrowRight size={32} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 h-full hover:shadow-xl">
                <div className="text-6xl font-bold text-red-500 mb-4">2</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Installation</h3>
                <p className="text-gray-600">Simple DIY setup or professional installation. Connect devices to your Wi-Fi in minutes.</p>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-red-500">
                <ArrowRight size={32} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 h-full hover:shadow-xl">
                <div className="text-6xl font-bold text-orange-600 mb-4">3</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Control Everything</h3>
                <p className="text-gray-600">Use your smartphone or voice commands to control your entire home from anywhere.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why InHaus */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why InHaus?</h2>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}
              >
                <div className="lg:w-1/2">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-96 object-cover rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="lg:w-1/2">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-4 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl">
                      <feature.icon size={32} className="text-orange-600" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-lg text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Trusted by Thousands of Happy Homes
            </h2>
            <p className="text-xl text-white/90">Join the Smart Home Revolution</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligent Living */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Intelligent Living, Tailored for any space
            </h2>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-100">
              {intelligentLiving.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
                  {item.title}
                </TabsTrigger>
              ))}
            </TabsList>

            {intelligentLiving.map((item) => (
              <TabsContent key={item.id} value={item.id}>
                <Card className="bg-white border-gray-200 overflow-hidden shadow-xl">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-2 gap-0">
                      <div className="p-12 flex flex-col justify-center bg-gradient-to-br from-orange-50 to-red-50">
                        <h3 className="text-3xl font-bold text-gray-900 mb-4">{item.subtitle}</h3>
                        <p className="text-2xl text-gray-700 mb-8">{item.subtitle2}</p>
                        <Link to={item.link}>
                          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-fit">
                            Explore More <ArrowRight className="ml-2" />
                          </Button>
                        </Link>
                      </div>
                      <div className="h-96 md:h-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Seamlessly Connect to Your Smart Devices
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Control all your smart home devices from one intuitive mobile application. Experience seamless integration with endless possibilities.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-orange-500" size={24} />
                  <span>Easy device pairing and setup</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-orange-500" size={24} />
                  <span>Voice control integration</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-orange-500" size={24} />
                  <span>Real-time monitoring and alerts</span>
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="text-orange-500" size={24} />
                  <span>Schedule and automation</span>
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1761305135267-892b33c19c61"
                alt="Mobile App"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Make Your Home Smart?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy homeowners. Get started with InHaus today and experience the future of living.
          </p>
          <Link to="/contact">
            <Button className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg rounded-full transition-all duration-300 shadow-lg">
              Get Started Now <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
