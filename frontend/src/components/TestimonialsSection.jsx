import React from 'react';
import { Star } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      image: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      text: 'InHaus has completely transformed my home! The installation was seamless and the app is incredibly intuitive. I can control everything from anywhere in the world.',
    },
    {
      name: 'Michael Chen',
      role: 'Tech Enthusiast',
      image: 'https://i.pravatar.cc/150?img=13',
      rating: 5,
      text: 'Simply blown away by the technology. Voice control works flawlessly with Alexa, and the energy monitoring has already helped me save on bills. Highly recommended!',
    },
    {
      name: 'Priya Sharma',
      role: 'Interior Designer',
      image: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      text: 'I recommend InHaus to all my clients. The smart switches are elegant, the lighting control is perfect for creating ambiance, and the customer service is exceptional.',
    },
    {
      name: 'David Miller',
      role: 'Business Owner',
      image: 'https://i.pravatar.cc/150?img=12',
      rating: 5,
      text: 'Installed InHaus in both my home and office. The security features give me peace of mind, and the automation has made life so much more convenient.',
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 hex-background opacity-20"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-3xl opacity-10 animate-float"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-3xl opacity-10 animate-float" style={{animationDelay: '2s'}}></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-6 py-2 glass rounded-full border border-orange-500/30 animate-fadeInUp">
            <span className="text-sm font-semibold gradient-text">Customer Stories</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto animate-fadeInUp" style={{animationDelay: '0.2s'}}>
            Join thousands of happy homeowners who've transformed their living spaces
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="glass-dark p-8 rounded-3xl hover:scale-105 transition-all duration-500 animate-fadeInUp premium-card"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full border-2 border-orange-500"
                />
                <div>
                  <h4 className="text-white font-bold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-orange-500 text-orange-500" />
                ))}
              </div>

              <p className="text-gray-300 leading-relaxed">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
