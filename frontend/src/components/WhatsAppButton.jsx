import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  const phoneNumber = '917416925607'; // Country code + phone number (no + or spaces)
  const message = 'Hi! I am interested in InHaus Smart Home Solutions. Can you help me?';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl transition-all duration-300 ease-in-out group"
      style={{
        padding: isHovered ? '12px 20px 12px 16px' : '16px',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MessageCircle 
        size={28} 
        className="animate-pulse group-hover:animate-none transition-all duration-300" 
      />
      <span
        className="font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
        style={{
          maxWidth: isHovered ? '200px' : '0px',
          opacity: isHovered ? 1 : 0,
        }}
      >
        Chat with us
      </span>
    </a>
  );
};

export default WhatsAppButton;
