import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { 
      name: 'Solutions', 
      submenu: [
        { name: 'Smart Homes', path: '/smart-homes' },
        { name: 'Smart Commercial', path: '/smart-commercial' },
        { name: 'Smart Hospitality', path: '/smart-hospitality' },
      ]
    },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass-dark shadow-2xl border-b border-white/10' 
          : 'bg-gradient-to-r from-white/90 via-white/95 to-white/90 backdrop-blur-xl'
      }`}
    >
      <div className=\"container mx-auto px-4 lg:px-8\">
        <div className=\"flex items-center justify-between h-24\">
          <Link to="/" className="flex items-center space-x-2 group">
            <img
              src="/inhaus/grayscale_logo.png"
              alt="InHaus"
              className="h-20 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.submenu ? (
                <div key={link.name} className="relative group">
                  <button className="text-sm font-medium text-gray-700 hover:text-orange-500 transition-colors duration-300 flex items-center gap-1">
                    {link.name}
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    {link.submenu.map((sublink) => (
                      <Link
                        key={sublink.path}
                        to={sublink.path}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500 transition-colors duration-300 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {sublink.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 ${
                    location.pathname === link.path
                      ? 'text-orange-500'
                      : 'text-gray-700'
                  }`}
                >
                  {link.name}
                </Link>
              )
            ))}
            <Link to="/contact">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                link.submenu ? (
                  <div key={link.name}>
                    <button 
                      onClick={() => setSolutionsOpen(!solutionsOpen)}
                      className="text-sm font-medium text-gray-700 w-full text-left flex items-center justify-between"
                    >
                      {link.name}
                      <ChevronDown size={16} className={`transform transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {solutionsOpen && (
                      <div className="mt-2 pl-4 space-y-2">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.path}
                            to={sublink.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 text-sm text-gray-600 hover:text-orange-500 transition-colors duration-300"
                          >
                            {sublink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-medium transition-colors duration-300 hover:text-orange-500 ${
                      location.pathname === link.path
                        ? 'text-orange-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
              <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
