import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const products = [
    'Smart Switches',
    'Lighting Solutions',
    'Security Systems',
    'Climate Control',
    'Voice Assistants',
  ];

  const socialLinks = [
    { name: 'Instagram', url: '#' },
    { name: 'Twitter', url: '#' },
    { name: 'LinkedIn', url: '#' },
    { name: 'Facebook', url: '#' },
  ];

  return (
    <footer className="bg-[#0A0A0A] border-t border-white/5" data-testid="footer">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <img 
                  src="/inhaus/fulllogo_transparent.png" 
                  alt="InHaus" 
                  className="h-16 w-auto brightness-0 invert"
                />
              </Link>
              <p className="text-neutral-500 text-sm leading-relaxed mb-6">
                Transform your home with intelligent automation. Experience comfort, security, and convenience like never before.
              </p>
              <div className="flex flex-col gap-3">
                <a 
                  href="mailto:support@inhaus.co.in" 
                  className="flex items-center gap-3 text-neutral-400 hover:text-orange-500 text-sm transition-colors duration-300"
                >
                  <Mail size={16} />
                  support@inhaus.co.in
                </a>
                <a 
                  href="tel:+917416925607" 
                  className="flex items-center gap-3 text-neutral-400 hover:text-orange-500 text-sm transition-colors duration-300"
                >
                  <Phone size={16} />
                  +91 7416925607
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Navigation
              </h3>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-neutral-500 hover:text-white text-sm transition-colors duration-300 flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Products
              </h3>
              <ul className="space-y-3">
                {products.map((product) => (
                  <li key={product}>
                    <Link
                      to="/products"
                      className="text-neutral-500 hover:text-white text-sm transition-colors duration-300"
                    >
                      {product}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">
                Connect
              </h3>
              <ul className="space-y-3">
                {socialLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-white text-sm transition-colors duration-300 flex items-center gap-1 group"
                    >
                      {link.name}
                      <ArrowUpRight size={12} className="opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} InHaus Smart Home Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/privacy" className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-neutral-600 hover:text-neutral-400 text-sm transition-colors duration-300">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
