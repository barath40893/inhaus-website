import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onComplete();
      }, 800);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
          style={{ pointerEvents: 'none' }}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Grid Lines */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.03 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #f97316 1px, transparent 1px),
                  linear-gradient(to bottom, #f97316 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px'
              }}
            />
            
            {/* Animated Gradient Circles */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 2, opacity: 0.1 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-orange-500 to-red-500 blur-3xl"
            />
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.43, 0.13, 0.23, 0.96],
                delay: 0.2 
              }}
              className="mb-8"
            >
              <img
                src="/inhaus/fulllogo_transparent.png"
                alt="InHaus Logo"
                className="w-48 h-auto"
              />
            </motion.div>

            {/* Text Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.8 
              }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to InHaus
              </h1>
              <p className="text-gray-600">
                Smart Home Solutions
              </p>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '200px' }}
              transition={{ 
                duration: 2.5, 
                ease: 'easeInOut',
                delay: 0.5 
              }}
              className="mt-8 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
            />

            {/* Animated Dots */}
            <div className="flex gap-2 mt-6">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1, 0.7]
                  }}
                  transition={{
                    duration: 0.6,
                    delay: 1 + (i * 0.15),
                    repeat: Infinity,
                    repeatDelay: 0.8
                  }}
                  className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"
                />
              ))}
            </div>
          </div>

          {/* Reveal Animation Elements */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.76, 0, 0.24, 1],
              delay: 2.5
            }}
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-500 to-red-500 origin-left"
            style={{ 
              transformOrigin: 'left',
              zIndex: 10
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;
