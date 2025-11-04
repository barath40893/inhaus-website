import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, CheckCircle, Zap, Shield, Star, Smartphone, Home, Lock, Lightbulb, Clock, TrendingUp, Mic } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('home');

  const features = [
    {
      icon: Zap,
      title: 'Comfort & Convenience',
      description: 'Control all your devices from anywhere. Experience true convenience at your fingertips.',
      image: 'https://images.unsplash.com/photo-1752955471067-294a5de5bf48?w=800&q=80',
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Enterprise-grade security with real-time monitoring and instant alerts.',
      image: 'https://images.unsplash.com/photo-1708807472445-d33589e6b090?w=800&q=80',
    },
    {
      icon: TrendingUp,
      title: 'Energy Efficient',
      description: 'Save up to 30% on electricity bills with smart energy tracking.',
      image: 'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=800&q=80',
    },
    {
      icon: Smartphone,
      title: 'Easy Control',
      description: 'Intuitive mobile app for seamless control of your entire home.',
      image: 'https://images.unsplash.com/photo-1608377205619-03a0b4c4e270?w=800&q=80',
    },
    {
      icon: Mic,
      title: 'Voice Commands',
      description: 'Works with Alexa, Google Home, and Siri for hands-free control.',
      image: 'https://images.unsplash.com/photo-1519558260268-cde7e03a0152?w=800&q=80',
    },
    {
      icon: Clock,
      title: 'Smart Automation',
      description: 'Set schedules and automations for a truly intelligent home.',
      image: 'https://images.unsplash.com/photo-1591174425156-fd472f354be4?w=800&q=80',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Williams',
      role: 'Homeowner, Mumbai',
      rating: 5,
      text: 'InHaus transformed my home! The installation was quick, and the app is incredibly easy to use. Love the voice control feature!',
      avatar: 'https://i.pravatar.cc/150?img=1',
    },
    {
      name: 'Rajesh Kumar',
      role: 'Tech Professional, Bangalore',
      rating: 5,
      text: 'Amazing product! The energy monitoring helped me save significantly on my electricity bills. Highly recommended!',
      avatar: 'https://i.pravatar.cc/150?img=13',
    },
    {
      name: 'Priya Sharma',
      role: 'Interior Designer, Delhi',
      rating: 5,
      text: 'I recommend InHaus to all my clients. The switches are elegant and the smart features are impressive.',
      avatar: 'https://i.pravatar.cc/150?img=5',
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full">
                  <span className="text-sm font-semibold gradient-text">The Future of Smart Living</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  Transform Your Home with
                  <span className="block mt-2 gradient-text">
                    InHaus Smart
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Experience seamless home automation with voice control, energy monitoring, and complete security—all from your smartphone.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link to="/contact">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started <ArrowRight className="ml-2" size={20} />
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button variant="outline" className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg rounded-xl transition-all duration-300">
                      View Products
                    </Button>
                  </Link>
                </div>
                
                {/* Trust indicators */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>Free Installation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>2-Year Warranty</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-green-500" size={20} />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="relative">
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
                    alt="Smart Home"
                    className="w-full rounded-3xl shadow-2xl"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-orange-200 to-red-200 rounded-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gradient-to-br from-slate-50 via-white to-orange-50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-red-200 to-orange-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4 px-6 py-2 glass rounded-full border border-orange-500/30">
              <span className="text-sm font-semibold gradient-text">Simple Process</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Get started with your smart home in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="relative group">
              <div className="premium-card gradient-border p-10 rounded-3xl h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    1
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:gradient-text transition-all duration-300">Choose Your Devices</h3>
                  <p className="text-gray-600 leading-relaxed">Select from our range of smart lights, switches, sensors, and appliances that fit your needs.</p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-orange-500 z-20">
                <ArrowRight size={40} className="animate-pulse" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="premium-card gradient-border p-10 rounded-3xl h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    2
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:gradient-text transition-all duration-300">Easy Installation</h3>
                  <p className="text-gray-600 leading-relaxed">Simple DIY setup or professional installation. Connect devices to your Wi-Fi in minutes.</p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-red-500 z-20">
                <ArrowRight size={40} className="animate-pulse" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="premium-card gradient-border p-10 rounded-3xl h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center text-4xl font-bold text-white mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    3
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:gradient-text transition-all duration-300">Control Everything</h3>
                  <p className="text-gray-600 leading-relaxed">Use your smartphone or voice commands to control your entire home from anywhere.</p>
                </div>
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
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80"
                  alt="Smart Home Mobile App Control"
                  className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-gradient-to-br from-orange-300 to-red-300 rounded-full blur-3xl opacity-30 -z-10"></div>
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
