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
            <div className="space-y-8 text-gray-700 leading-relaxed">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">InHaus Smart Home Pvt. Ltd. Privacy Statement</h2>
                <p className="mb-4">
                  INHAUS SMART HOME PVT. LTD., and its subsidiaries or Parent Companies (collectively "INHAUS") are committed to protecting your privacy and providing you with a positive experience on our websites and in using our products and services ("Solution" or "Solutions").
                </p>
                <p className="mb-4">
                  This Privacy Statement applies to INHAUS websites and Solutions that link to or references this Statement and describes how we handle personal information and the choices available to you regarding collection, use, access, and how to update and correct your personal information.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Collection of Your Personal Information</h2>
                <p className="mb-4">
                  We may collect data, including personal, device information, about you as you use our websites and Solutions and interact with us. "Personal information" is any information that can be used to identify an individual, and may include name, address, email address, phone number, login information (account number, password), marketing preferences, social media account information, or payment card number.
                </p>
                <p className="mb-4">We collect personal information for a variety of reasons, such as:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Processing your order, including payment transactions</li>
                  <li>Providing you with a newsletter subscription</li>
                  <li>Sending marketing communications</li>
                  <li>Creating an account</li>
                  <li>Enabling the use of certain features of our Solutions</li>
                  <li>Personalizing your experience</li>
                  <li>Providing customer service</li>
                  <li>Managing a job application</li>
                </ul>
                <p className="mb-4">
                  When you use parts of the Service that require Hardware, we may collect Information from that Hardware, such as model and serial number, Hardware activity logs, and historic and current Hardware configuration. We also collect usage data from your Hardware, such as what devices are plugged into the Hardware, the location of the Hardware, whether Hardware is in dimmable mode or is in use, and how much electricity is being consumed by devices plugged into any Hardware.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Uses of Your Personal Information</h2>
                <p className="mb-4">
                  We may use your personal information for the purposes of operating our business, delivering, improving, and customizing our websites, mobile applications and Solutions, sending marketing and other communications related to our business, and for other legitimate purposes permitted by applicable law.
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Delivering a Solution you have requested</li>
                  <li>Analyzing, supporting, and improving our Solutions and your online experience</li>
                  <li>Personalizing websites, newsletters and other communications</li>
                  <li>Administering and processing your certification exams</li>
                  <li>Sending communications to you, including for marketing or customer satisfaction purposes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Sharing Your Personal Information</h2>
                <p className="mb-4">
                  We may share your personal information with third parties for the purposes of operating our business, delivering, improving, and customizing our Solutions, sending marketing and other communications related to our business, and for other legitimate purposes permitted by applicable law or otherwise with your consent.
                </p>
                <p className="mb-4">We may share personal information in the following ways:</p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Within INHAUS and its parent companies or subsidiaries for purposes of data processing or storage</li>
                  <li>With business partners, service vendors, authorized third-party agents, or contractors to provide requested services</li>
                  <li>In connection with, or during negotiations of, any merger, sale of company assets, consolidation or restructuring</li>
                  <li>In response to a request for information by a competent authority if we believe disclosure is required by law</li>
                  <li>With law enforcement officials, government authorities, or other third parties as necessary to comply with legal process</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security of Your Personal Information</h2>
                <p className="mb-4">
                  We intend to protect the personal information entrusted to us and treat it securely in accordance with this Privacy Statement. INHAUS implements physical, administrative, and technical safeguards designed to protect your personal information from unauthorized access, use, or disclosure. We also contractually require that our suppliers protect such information from unauthorized access, use, and disclosure.
                </p>
                <p className="mb-4">
                  The Internet, however, cannot be guaranteed to be 100% secure, and we cannot ensure or warrant the security of any personal information you provide to us.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Access to and Accuracy of Your Personal Information</h2>
                <p className="mb-4">
                  We need your help in keeping your personal information accurate and up to date. You can view or edit your personal information and preferences by using the account section of your profile.
                </p>
                <p className="mb-4">
                  If you need additional assistance, or help with accessing, correcting, suppressing, or deleting your personal information, please feel free to contact us directly at <a href="mailto:support@inhaus.co.in" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.co.in</a>. We will respond to your request within 30 days.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Choices and Communication Preferences</h2>
                <p className="mb-4">
                  We give you the choice of receiving a variety of information related to our Solutions. You can manage your communication preferences through the following methods:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>By following the instructions included in each promotional email from us to unsubscribe</li>
                  <li>By sending us a message through email at <a href="mailto:support@inhaus.co.in" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.co.in</a></li>
                  <li>By contacting us at our office address</li>
                </ul>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Use of Cookies and Web Technologies</h2>
                <p className="mb-4">
                  Like many websites, INHAUS uses automatic data collection tools, such as cookies, embedded web links, and web beacons. These tools collect certain standard information that your browser sends to our website, such as your browser type and the address of the website from which you arrived.
                </p>
                <p className="mb-4">
                  These tools help make your visit to our website easier, more efficient, and more valuable by providing you with a customized experience and recognizing you when you return.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="mb-4">
                  INHAUS encourages parents and guardians to take an active role in their children's online activities. INHAUS does not knowingly collect personal information from children without appropriate parental or guardian consent. If you believe that we may have collected personal information from someone under the applicable age of consent, please let us know using the contact methods below.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-4">
                  We value your opinions. Should you have questions or comments related to this Privacy Statement, please email our privacy team at <a href="mailto:support@inhaus.co.in" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.co.in</a>
                </p>
                <p className="mb-4">
                  Alternatively, write to:<br />
                  <strong>INHAUS SMART HOME PVT. LTD.</strong><br />
                  Shop no - 207, 1st Floor<br />
                  Kokapet terminal, Radha spaces<br />
                  Gandipet, Hyderabad<br />
                  Telangana, 500075<br />
                  India
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Updates to this Privacy Statement</h2>
                <p className="mb-4">
                  We may update this Privacy Statement from time to time. If we modify our Privacy Statement, we will post the revised version here, with an updated revision date. You agree to visit these pages periodically to be aware of and review any such revisions.
                </p>
                <p className="mb-4">
                  If we make material changes to our Privacy Statement, we may also notify you by other means prior to the changes taking effect, such as by posting a notice on our websites or sending you a notification. By continuing to use our website after such revisions are in effect, you accept and agree to the revisions and to abide by them.
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
