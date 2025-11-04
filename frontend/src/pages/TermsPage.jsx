import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="pt-32 pb-20 bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Terms & <span className="gradient-text">Conditions</span>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
                <p className="mb-4">
                  InHaus Innovations Pvt Ltd operates our website and mobile applications. By using our Service, you agree to these terms.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Information Collection</h2>
                <p className="mb-4">
                  We may collect personally identifiable information including your name, phone number, and address to provide better service.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies</h2>
                <p className="mb-4">
                  Our website uses cookies to improve your experience. You may choose to refuse cookies, though some features may not work properly.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security</h2>
                <p className="mb-4">
                  We strive to protect your personal information using commercially acceptable means, though no method is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="mb-4">
                  Our services do not address anyone under 13. We do not knowingly collect information from children under 13.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
                <p className="mb-4">
                  We may update these terms periodically. Changes are effective immediately upon posting.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-4">
                  For questions: <a href="mailto:support@inhaus.com" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.com</a>
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

export default TermsPage;
