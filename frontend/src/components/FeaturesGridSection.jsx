import React from 'react';
import { Shield, Zap, Clock, Lightbulb, Lock, Smartphone, TrendingUp, Settings, Radio } from 'lucide-react';

const FeaturesGridSection = () => {
  const features = [
    {
      icon: Zap,
      title: 'Comfort & Convenience',
      description: 'Switch on/off appliances anytime from anywhere. No more worries about hassles at home.',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Shield,
      title: 'Tighter Security',
      description: 'Monitor your home on the go. Set virtual locks with smart notifications about intrusions.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: TrendingUp,
      title: 'Live Power Tracking',
      description: 'Monitor hourly and daily power consumption in real-time to save more energy.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: Clock,
      title: 'Timing Setup',
      description: 'Set timers on any device, from light bulbs to water pumps with smart scheduling.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Lightbulb,
      title: 'Custom Lighting',
      description: 'Set custom light scenes that turn on with a single tap - movie night, party, etc.',
      gradient: 'from-amber-500 to-yellow-500',
    },
    {
      icon: Radio,
      title: 'Smart Entertainment',
      description: 'Control all IR remotes with your smartphone. Smart makeover for your DTH and TV.',
      gradient: 'from-red-500 to-rose-500',
    },
    {
      icon: Smartphone,
      title: 'Mobile Master Control',
      description: 'Complete control over smart home with your phone from anywhere in the world.',
      gradient: 'from-indigo-500 to-violet-500',
    },
    {
      icon: Lock,
      title: 'Voice Assistant',
      description: 'Use your voice as a remote to control all your appliances hands-free.',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Settings,
      title: 'Smart Automation',
      description: 'Let appliances customize their actions automatically based on your preferences.',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <section className=\"py-32 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden\">
      <div className=\"absolute inset-0 hex-background opacity-10\"></div>

      <div className=\"container mx-auto px-4 lg:px-8 relative z-10\">
        <div className=\"text-center mb-20\">
          <div className=\"inline-block mb-4 px-6 py-2 glass rounded-full border border-orange-500/30 animate-fadeInUp\">
            <span className=\"text-sm font-semibold gradient-text\">Premium Features</span>
          </div>
          <h2 className=\"text-5xl md:text-6xl font-bold text-white mb-6 animate-fadeInUp\" style={{animationDelay: '0.1s'}}>
            Everything You Need for a <span className=\"gradient-text\">Smart Home</span>
          </h2>
          <p className=\"text-xl text-gray-400 max-w-3xl mx-auto animate-fadeInUp\" style={{animationDelay: '0.2s'}}>
            Advanced features that make your home truly intelligent
          </p>
        </div>

        <div className=\"grid md:grid-cols-3 gap-8\">
          {features.map((feature, index) => (
            <div
              key={index}
              className=\"group premium-card glass-dark p-8 rounded-3xl hover:scale-105 transition-all duration-500 animate-fadeInUp\"
              style={{animationDelay: `${index * 0.05}s`}}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <feature.icon className=\"text-white\" size={32} />
              </div>
              <h3 className=\"text-2xl font-bold text-white mb-4 group-hover:gradient-text transition-all duration-300\">
                {feature.title}
              </h3>
              <p className=\"text-gray-400 leading-relaxed\">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGridSection;
