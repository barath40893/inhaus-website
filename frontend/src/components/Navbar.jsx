import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut, Package, ChevronDown } from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { customer, cart, logout } = useCustomerAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    if (isUserMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  // Live cart badge — read from localStorage (source of truth)
  // and listen for 'cart-updated' custom event + cross-tab 'storage' events.
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const readCartCount = () => {
      try {
        const saved = localStorage.getItem('customer_cart');
        if (!saved) { setCartItemCount(0); return; }
        const items = JSON.parse(saved);
        const total = Array.isArray(items)
          ? items.reduce((sum, it) => sum + (it.quantity || 0), 0)
          : 0;
        setCartItemCount(total);
      } catch {
        setCartItemCount(0);
      }
    };

    readCartCount();

    const onStorage = (e) => {
      if (!e || e.key === 'customer_cart' || e.key === null) readCartCount();
    };
    const onCartUpdated = () => readCartCount();

    window.addEventListener('storage', onStorage);
    window.addEventListener('cart-updated', onCartUpdated);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('cart-updated', onCartUpdated);
    };
  }, []);

  return (
    <>
      {/* Floating Navbar */}
      <nav
        className={`fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
            : 'bg-black/60'
        } backdrop-blur-xl rounded-full border border-white/10`}
        data-testid="navbar"
      >
        <div className="px-6 py-2.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group" data-testid="nav-logo">
              <img 
                src="/inhaus_icon_white.png" 
                alt="InHaus Icon" 
                className="h-12 w-auto"
                style={{ imageRendering: 'auto' }}
              />
              <img 
                src="/inhaus_text_logo_white.png" 
                alt="INHAUS Smart Automation" 
                className="h-10 w-auto hidden sm:block"
                style={{ imageRendering: 'auto' }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-link-${link.name.toLowerCase()}`}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'text-orange-500 bg-orange-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* Cart */}
              <Link 
                to="/customer/cart" 
                className="relative p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/5 transition-all duration-300"
                data-testid="nav-cart"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>

              {/* User / Login */}
              {customer ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-300"
                    data-testid="nav-account"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <User size={16} />
                    <span className="max-w-[100px] truncate">{customer.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-neutral-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                      data-testid="user-dropdown"
                      role="menu"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-[10px] tracking-[2px] uppercase text-zinc-500 font-semibold">Signed in as</p>
                        <p className="text-sm text-white font-medium truncate">{customer.name}</p>
                        <p className="text-[11px] text-zinc-400 truncate">{customer.email}</p>
                      </div>

                      <Link
                        to="/customer/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                        data-testid="user-menu-orders"
                      >
                        <Package size={15} />
                        My Orders
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border-t border-white/5"
                        data-testid="user-menu-signout"
                      >
                        <LogOut size={15} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-full bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-all duration-300 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
                  data-testid="nav-login"
                >
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-white rounded-full hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute top-24 left-4 right-4 bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                    location.pathname === link.path
                      ? 'text-orange-500 bg-orange-500/10'
                      : 'text-neutral-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="h-px bg-white/10 my-3" />
              
              <div className="flex items-center gap-3">
                <Link 
                  to="/customer/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 text-white font-medium"
                >
                  <ShoppingCart size={18} />
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
                
                {customer ? (
                  <Link
                    to="/customer/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium"
                  >
                    <User size={18} />
                    Account
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-500 text-white font-medium"
                  >
                    Sign In
                  </Link>
                )}
              </div>

              {/* Mobile Sign Out button (only when logged in) */}
              {customer && (
                <button
                  onClick={handleSignOut}
                  className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                  data-testid="mobile-signout"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
