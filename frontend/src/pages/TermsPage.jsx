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
            <div className="space-y-8 text-gray-700 leading-relaxed">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">InHaus Smart Home Pvt. Ltd. Terms and Conditions</h2>
                <p className="mb-4">
                  INHAUS SMART HOME PVT. LTD operates the https://inhaus.co.in website and INHAUS SMART HOME PVT. LTD iOS app and INHAUS SMART HOME PVT. LTD Android app, which provides the SERVICE. This page is used to inform users regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
                </p>
                <p className="mb-4">
                  If you choose to use our Service, then you agree to the collection and use of information in relation with this policy. The Personal Information that we collect are used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
                </p>
                <p className="mb-4">
                  The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible at https://inhaus.co.in, unless otherwise defined in this Privacy Policy.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Information Collection and Use</h2>
                <p className="mb-4">
                  For a better experience while using our Service, we may require you to provide us with certain personally identifiable information, including but not limited to your name, phone number, and postal address. The information that we collect will be used to contact or identify you.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Log Data</h2>
                <p className="mb-4">
                  We want to inform you that whenever you visit our Service, we collect information that your browser sends to us that is called Log Data. This Log Data may include information such as your computer's Internet Protocol ("IP") address, browser version, pages of our Service that you visit, the time and date of your visit, the time spent on those pages, and other statistics.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookies</h2>
                <p className="mb-4">
                  Cookies are files with small amount of data that is commonly used as an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your computer's hard drive.
                </p>
                <p className="mb-4">
                  Our website uses these "cookies" to collect information and to improve our Service. You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your computer. If you choose to refuse our cookies, you may not be able to use some portions of our service.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Security</h2>
                <p className="mb-4">
                  We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Links to Other Sites</h2>
                <p className="mb-4">
                  Our Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over, and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
                <p className="mb-4">
                  Our Services do not address anyone under the age of 4. We do not knowingly collect personal identifiable information from children under 4. In the case we discover that a child under 4 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                <p className="mb-4">
                  We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted on this page.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at <a href="mailto:support@inhaus.co.in" className="text-orange-600 hover:text-orange-700 font-semibold">support@inhaus.co.in</a>
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
