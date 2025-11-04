import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact Us', path: '/contact' },
    { name: 'Support', path: '/contact' },
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms & Conditions', path: '/terms' },
  ];

  const products = [
    'Electrical Switches',
    'Lighting Solutions',
    'Security Systems',
    'Consumer Appliances',
    'Kitchen Appliances',
    'Motorised Products',
  ];

  const solutions = [
    { name: 'Smart Hospitality', path: '/smart-hospitality' },
    { name: 'Smart Commercial Spaces', path: '/smart-commercial' },
    { name: 'Smart Homes', path: '/smart-homes' },
    { name: 'Smart Appliances', path: '/products' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img
              src="/inhaus/fulllogo_transparent_nobuffer.png"
              alt="InHaus"
              className="h-12 w-auto mb-4 brightness-110"
            />
            <p className="text-gray-400 text-sm mb-4">
              Transform your home with intelligent automation. Experience comfort, security, and convenience like never before.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-300">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-400 text-sm transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              {products.map((product) => (
                <li key={product}>
                  <Link
                    to="/products"
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300"
                  >
                    {product}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Solutions</h3>
            <ul className="space-y-2">
              {solutions.map((solution) => (
                <li key={solution.path}>
                  <Link
                    to={solution.path}
                    className="text-gray-400 hover:text-blue-400 text-sm transition-colors duration-300"
                  >
                    {solution.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright © {new Date().getFullYear()} All Rights Reserved By InHaus Innovation Pvt. Ltd.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="mailto:info@inhaus.com" className="text-gray-400 hover:text-blue-400 text-sm flex items-center gap-2 transition-colors duration-300">
                <Mail size={16} /> info@inhaus.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
