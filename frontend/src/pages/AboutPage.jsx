import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Target, Users, Award, Lightbulb } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To empower brands worldwide with cutting-edge IoT solutions that transform everyday devices into intelligent, connected experiences.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We continuously push the boundaries of technology to deliver innovative solutions that meet the evolving needs of our clients.',
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

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">InHaus</span>
            </h1>
            <p className="text-xl text-gray-400">
              Building the future of smart living, one device at a time
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-400">
              <p>
                InHaus was founded with a simple yet powerful vision: to make smart home technology accessible and affordable for everyone. We believe that everyone deserves to experience the comfort, convenience, and security that comes with a truly intelligent home.
              </p>
              <p>
                Today, we're proud to serve thousands of homes across the country, transforming ordinary houses into extraordinary smart homes. Our products are designed with you in mind—easy to install, simple to use, and built to last. Whether you're looking to save on energy bills, enhance your home security, or simply enjoy the convenience of voice-controlled lighting, we have the perfect solution.
              </p>
              <p>
                What sets us apart is our commitment to quality and customer satisfaction. We don't just sell products; we create experiences. Our devices work seamlessly together, our app is intuitive and reliable, and our customer support team is always here to help. With InHaus, you're not just buying smart devices—you're investing in a smarter way of living.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Values</h2>
            <p className="text-xl text-gray-400">The principles that guide everything we do</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300"
              >
                <div className="mb-4">
                  <value.icon size={40} className="text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">Our Team</h2>
            <p className="text-xl text-gray-400 mb-12">
              We're a passionate team of engineers, designers, and smart home enthusiasts dedicated to making your life easier and more comfortable. With years of experience in home automation and customer service, we're here to help you every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                5000+
              </div>
              <div className="text-lg text-gray-400">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                8+
              </div>
              <div className="text-lg text-gray-400">Years in Business</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                24/7
              </div>
              <div className="text-lg text-gray-400">Customer Support</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                4.8★
              </div>
              <div className="text-lg text-gray-400">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
