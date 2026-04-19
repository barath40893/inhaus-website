import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ShoppingCart, Check, ChevronRight, Share2, Copy,
  Minus, Plus, Package, Loader2, Home, Bed, Bath, ChefHat,
  Briefcase, UtensilsCrossed, TreePalm, Building2, X,
} from 'lucide-react';

// Parse "Available in X / Y" / "Available in X and Y" style lines from description
// into attribute chip groups. Works with existing product data.
const parseAttributes = (description) => {
  if (!description) return [];
  const groups = [];
  const lines = description.split(/\n|\.|;/).map((l) => l.trim()).filter(Boolean);

  const patterns = [
    { label: 'Front Glass', regex: /front\s+glass\s+available\s+in\s+(.+)/i },
    { label: 'Bezel',       regex: /(?:aluminum\s+)?bezel\s+available\s+in\s+(.+)/i },
    { label: 'Technology',  regex: /available\s+in\s+(zigbee(?:\s+and\s+wifi)?|wifi\s+and\s+zigbee|zigbee|wifi)\s+models?/i },
    { label: 'Connectivity',regex: /(wifi|zigbee|bluetooth|ble)\s+enabled/i },
  ];

  for (const line of lines) {
    for (const p of patterns) {
      const m = line.match(p.regex);
      if (m) {
        const raw = m[1];
        // split by "/", "and", ","
        const options = raw
          .split(/\s*(?:\/|,|\band\b)\s*/i)
          .map((s) => s.trim().replace(/models?$/i, '').trim())
          .filter((s) => s.length > 0 && s.length < 30);
        if (options.length && !groups.find((g) => g.label === p.label)) {
          groups.push({ label: p.label, options });
        }
        break;
      }
    }
  }

  // Fallback: gang-box hint
  const gm = description.match(/fits?\s+in\s+(?:standard\s+)?(\d+m(?:\/\d+m)?)\s+gang\s+box/i);
  if (gm && !groups.find((g) => g.label === 'Gang Box')) {
    groups.push({ label: 'Gang Box', options: [gm[1].toUpperCase()] });
  }
  return groups;
};

// Build bullet highlights from description (split by newline, skip short/empty)
const getHighlights = (description) => {
  if (!description) return [];
  return description
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.length < 140)
    .slice(0, 8);
};

const ROOM_OPTIONS = [
  { name: 'Living Room', icon: Home },
  { name: 'Master Bedroom', icon: Bed },
  { name: 'Bedroom 2', icon: Bed },
  { name: 'Bedroom 3', icon: Bed },
  { name: 'Kitchen', icon: ChefHat },
  { name: 'Bathroom', icon: Bath },
  { name: 'Office/Study', icon: Briefcase },
  { name: 'Dining Room', icon: UtensilsCrossed },
  { name: 'Balcony', icon: TreePalm },
  { name: 'Hall', icon: Building2 },
];

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${backendUrl}/api/shop/products`);
        if (!res.ok) throw new Error('Failed to load products');
        const all = await res.json();
        const found = all.find((p) => p.id === productId);
        setProduct(found || null);
        if (found) {
          const sameCat = all.filter((p) => p.category === found.category && p.id !== found.id).slice(0, 6);
          setRelated(sameCat);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [productId, backendUrl]);

  const attributes = useMemo(() => parseAttributes(product?.description), [product]);
  const highlights = useMemo(() => getHighlights(product?.description), [product]);

  // Initialize default selection for each attribute group
  useEffect(() => {
    if (!attributes.length) return;
    const defaults = {};
    attributes.forEach((g) => { defaults[g.label] = g.options[0]; });
    setSelectedAttrs(defaults);
  }, [attributes]);

  const imgSrc = product?.image_url?.startsWith('http')
    ? product.image_url
    : `${backendUrl}${product?.image_url || ''}`;

  const handleAddToCart = () => {
    setShowRoomModal(true);
  };

  const addToCartForRoom = (roomName) => {
    const existing = JSON.parse(localStorage.getItem('customer_cart') || '[]');
    const attrSuffix = Object.values(selectedAttrs).filter(Boolean).join(', ');
    const matchIdx = existing.findIndex(
      (it) => it.product_id === product.id && it.room_name === roomName && (it.variant || '') === attrSuffix
    );
    let newCart;
    if (matchIdx >= 0) {
      newCart = existing.map((it, i) => i === matchIdx ? { ...it, quantity: it.quantity + quantity } : it);
    } else {
      newCart = [...existing, {
        product_id: product.id,
        product_name: product.name,
        model_no: product.model_no,
        image_url: product.image_url,
        price: product.list_price,
        quantity,
        room_name: roomName,
        room_type: 'predefined',
        variant: attrSuffix,
      }];
    }
    localStorage.setItem('customer_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
    setShowRoomModal(false);
    navigate('/customer/cart');
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = product ? `Check out ${product.name} on InHaus` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // noop
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, text: shareText, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      setShareOpen((v) => !v);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="h-[60vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <Package className="w-16 h-16 mx-auto text-zinc-700 mb-4" />
          <h1 className="text-2xl font-bold mb-3">Product not found</h1>
          <p className="text-zinc-500 mb-6">It may have been moved or removed from the catalog.</p>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-orange-500 text-white hover:bg-orange-600 font-semibold">
            Back to Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-28 pb-16" data-testid="product-detail-page">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-8" aria-label="breadcrumb">
          <Link to="/products" className="hover:text-orange-400 transition">All Products</Link>
          <ChevronRight size={12} />
          <Link to={`/products?category=${encodeURIComponent(product.category || '')}`} className="hover:text-orange-400 transition truncate max-w-[200px]">
            {product.category || 'Uncategorized'}
          </Link>
          <ChevronRight size={12} />
          <span className="text-zinc-300 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* LEFT — Image */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-white/5">
              {product.image_url ? (
                <img
                  src={imgSrc}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                  data-testid="pdp-hero-image"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-zinc-400" />
                </div>
              )}
              {product.category && (
                <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[2px] font-bold bg-black/90 text-orange-400 px-3 py-1.5 rounded-full">
                  {product.category}
                </span>
              )}
            </div>
          </motion.div>

          {/* RIGHT — Info */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-semibold leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
              data-testid="pdp-title"
            >
              {product.name}
            </motion.h1>
            {product.model_no && (
              <p className="text-xs tracking-[2px] uppercase text-zinc-500 mt-2" data-testid="pdp-model">
                Model · {product.model_no}
              </p>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <ul className="mt-6 space-y-2">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <Check size={14} className="text-orange-400 mt-1 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Price */}
            <div className="mt-7 pb-6 border-b border-white/5">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-orange-500" data-testid="pdp-price">
                  ₹ {product.list_price?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs tracking-[2px] uppercase text-zinc-500">Incl. GST on checkout</span>
              </div>
            </div>

            {/* Attributes */}
            {attributes.length > 0 && (
              <div className="mt-6 space-y-5" data-testid="pdp-attributes">
                {attributes.map((group) => (
                  <div key={group.label}>
                    <p className="text-[10px] tracking-[3px] uppercase font-bold text-zinc-400 mb-2">
                      {group.label}
                      <span className="text-orange-400 font-medium ml-2 lowercase tracking-wider">
                        — {selectedAttrs[group.label] || group.options[0]}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((opt) => {
                        const active = selectedAttrs[group.label] === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setSelectedAttrs((p) => ({ ...p, [group.label]: opt }))}
                            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                              active
                                ? 'bg-orange-500 text-white border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.35)]'
                                : 'bg-white/[0.02] text-zinc-300 border-white/10 hover:border-orange-500/40'
                            }`}
                            data-testid={`pdp-attr-${group.label.replace(/\s+/g, '-').toLowerCase()}-${opt.replace(/\s+/g, '-').toLowerCase()}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-full overflow-hidden shrink-0" data-testid="pdp-qty">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-white/[0.04] transition"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center font-semibold text-base">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-white/[0.04] transition"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-3 font-semibold text-sm transition-all duration-300 shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:shadow-[0_0_40px_rgba(249,115,22,0.5)]"
                data-testid="pdp-add-to-cart"
              >
                <ShoppingCart size={16} />
                Add to Cart
              </button>

              <div className="relative">
                <button
                  onClick={nativeShare}
                  className="w-11 h-11 flex items-center justify-center bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-full transition"
                  aria-label="Share"
                  data-testid="pdp-share-btn"
                >
                  <Share2 size={16} />
                </button>
                {shareOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40" data-testid="pdp-share-menu">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition"
                      onClick={() => setShareOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366"><path d="M17.5 14.3c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.8.9-1 1.1-.2.2-.4.2-.7.1-.3-.2-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 2 .6 3.9 1.6 5.4L2 22l4.8-1.5c1.5.8 3.3 1.3 5.2 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.7 0-3.3-.5-4.7-1.3l-.3-.2-3 .9.9-2.9-.2-.3C3.9 15 3.5 13.5 3.5 12c0-4.7 3.8-8.5 8.5-8.5s8.5 3.8 8.5 8.5-3.8 8-8.5 8z"/></svg>
                      WhatsApp
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition"
                      onClick={() => setShareOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      Email
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition"
                      onClick={() => setShareOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#1DA1F2"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
                      Twitter / X
                    </a>
                    <button
                      onClick={copyLink}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5 transition border-t border-white/5"
                    >
                      <Copy size={14} />
                      {copied ? 'Link copied!' : 'Copy link'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[9px] tracking-[2px] uppercase text-zinc-500 mb-1">Warranty</p>
                <p className="text-xs text-zinc-200 font-semibold">2 Years</p>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[9px] tracking-[2px] uppercase text-zinc-500 mb-1">Support</p>
                <p className="text-xs text-zinc-200 font-semibold">24 × 7</p>
              </div>
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <p className="text-[9px] tracking-[2px] uppercase text-zinc-500 mb-1">Install</p>
                <p className="text-xs text-zinc-200 font-semibold">InHaus Pro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {attributes.length > 0 && (
          <div className="mt-16 max-w-4xl" data-testid="pdp-specs">
            <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Specifications</h2>
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {attributes.map((group) => (
                    <tr key={group.label} className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-xs tracking-[1px] uppercase font-semibold text-zinc-400 w-1/3">{group.label}</td>
                      <td className="px-5 py-3 text-sm text-zinc-200">{group.options.join(' · ')}</td>
                    </tr>
                  ))}
                  {product.category && (
                    <tr className="border-b border-white/5 last:border-0">
                      <td className="px-5 py-3 text-xs tracking-[1px] uppercase font-semibold text-zinc-400">Category</td>
                      <td className="px-5 py-3 text-sm text-zinc-200">{product.category}</td>
                    </tr>
                  )}
                  {product.model_no && (
                    <tr>
                      <td className="px-5 py-3 text-xs tracking-[1px] uppercase font-semibold text-zinc-400">Model No.</td>
                      <td className="px-5 py-3 text-sm text-zinc-200">{product.model_no}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16" data-testid="pdp-related">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>More from {product.category}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={`/product/${r.id}`}
                  className="group bg-white/[0.02] border border-white/5 rounded-xl p-3 hover:border-orange-500/30 transition"
                >
                  <div className="aspect-square bg-white rounded-lg overflow-hidden mb-3">
                    {r.image_url && (
                      <img
                        src={r.image_url.startsWith('http') ? r.image_url : `${backendUrl}${r.image_url}`}
                        alt={r.name}
                        className="w-full h-full object-contain p-3"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  <p className="text-xs text-white font-medium line-clamp-2 group-hover:text-orange-400 transition">
                    {r.name}
                  </p>
                  <p className="text-[11px] text-orange-500 font-bold mt-1">
                    ₹ {r.list_price?.toLocaleString('en-IN')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Room picker modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" data-testid="pdp-room-modal">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900 border border-white/10 rounded-2xl max-w-lg w-full p-6"
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-white">Select Room</h3>
                <p className="text-xs text-zinc-500 mt-1">Adding: {product.name}{Object.values(selectedAttrs).filter(Boolean).length > 0 ? ` (${Object.values(selectedAttrs).filter(Boolean).join(', ')})` : ''}</p>
              </div>
              <button
                onClick={() => setShowRoomModal(false)}
                className="text-zinc-500 hover:text-white transition"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-[10px] tracking-[2px] uppercase text-zinc-500 font-semibold mb-2">Predefined Rooms</p>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_OPTIONS.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.name}
                    onClick={() => addToCartForRoom(r.name)}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-orange-500 hover:bg-orange-500/10 text-sm text-white transition"
                    data-testid={`pdp-room-${r.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <Icon size={16} className="text-orange-400" />
                    {r.name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
