import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-600">Last updated: January 2025</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8 text-gray-700">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">InHaus Innovations Privacy Statement</h2>
                <p className="mb-4">
                  InHaus Innovations Pvt. Ltd., and its subsidiaries (collectively "InHaus") are committed to protecting your privacy and providing you with a positive experience on our websites and in using our products and services.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Collection of Your Personal Information</h2>
                <p className="mb-4">
                  We may collect data, including personal and device information, about you as you use our websites. Personal information may include name, address, email address, phone number, and payment card number.
                </p>
                <p className="mb-2">We collect personal information for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processing your order and payment transactions</li>
                  <li>Providing newsletters and marketing communications</li>
                  <li>Creating and managing accounts</li>
                  <li>Personalizing your experience</li>
                  <li>Providing customer service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Uses of Your Personal Information</h2>
                <p className="mb-4">
                  We use your personal information for operating our business, delivering and improving our Solutions, and sending marketing communications.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security</h2>
                <p className="mb-4">
                  We implement physical, administrative, and technical safeguards to protect your personal information from unauthorized access, use, or disclosure.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-4">
                  Email: <a href="mailto:support@inhaus.com" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.com</a>
                </p>
                <p>
                  InHaus Innovations Pvt. Ltd.<br />
                  123 Innovation Drive<br />
                  Tech Valley, CA 94025<br />
                  United States
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
