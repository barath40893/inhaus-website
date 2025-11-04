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
                InHaus was founded with a simple yet powerful vision: to make IoT technology accessible to everyone. We recognized that while the potential of smart devices was enormous, the complexity of development and deployment was a significant barrier for many brands.
              </p>
              <p>
                Today, we've evolved into a leading white-label IoT platform provider, helping brands across the globe launch their smart products without the need for extensive R&D investments or technical expertise. Our platform powers millions of devices, bringing intelligence and connectivity to homes, offices, and hospitality spaces worldwide.
              </p>
              <p>
                What sets us apart is our commitment to excellence and innovation. We don't just provide technology; we partner with our clients to understand their unique needs and deliver solutions that exceed expectations. Our enterprise-grade platform is built on reliability, scalability, and security – the foundations of any successful IoT ecosystem.
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
              We're a diverse team of engineers, designers, and innovators passionate about creating intelligent solutions that make a real difference. With decades of combined experience in IoT, cloud computing, and product development, we bring expertise and dedication to every project.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mt-12">
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                50+
              </div>
              <div className="text-lg text-gray-400">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                10+
              </div>
              <div className="text-lg text-gray-400">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                20+
              </div>
              <div className="text-lg text-gray-400">Countries Served</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
                99.9%
              </div>
              <div className="text-lg text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
