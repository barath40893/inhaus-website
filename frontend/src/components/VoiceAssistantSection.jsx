import React from 'react';
import { Mic } from 'lucide-react';

const VoiceAssistantSection = () => {
  const assistants = [
    {
      name: 'Alexa',
      command: 'Alexa, turn on living room lights',
      color: 'from-blue-400 to-cyan-400',
      bgColor: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      name: 'Google',
      command: 'Ok Google, set bedroom to movie mode',
      color: 'from-red-400 to-yellow-400',
      bgColor: 'from-red-500/20 to-yellow-500/20',
    },
    {
      name: 'Siri',
      command: 'Hey Siri, good morning',
      color: 'from-purple-400 to-pink-400',
      bgColor: 'from-purple-500/20 to-pink-500/20',
    },
  ];

  return (
    <section className="py-32 bg-slate-950 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(249, 115, 22, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.05) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>

      <div container mx-auto px-4 lg:px-8 relative z-10>
        <div text-center mb-20>
          <div inline-flex items-center gap-3 mb-6 px-8 py-4 glass rounded-full border border-orange-500/30 animate-fadeInUp>
            <Mic text-orange-500\" size={24} />
            <span text-lg font-bold gradient-text>Voice Control</span>
          </div>
          <h2 text-5xl md:text-7xl font-bold text-white mb-6 animate-fadeInUp\" style={{animationDelay: '0.1s'}}>
            Your Voice is the <span gradient-text>Switch</span>
          </h2>
          <p text-xl text-gray-400 max-w-3xl mx-auto animate-fadeInUp\" style={{animationDelay: '0.2s'}}>
            Control your entire home with simple voice commands. Works seamlessly with all major voice assistants.
          </p>
        </div>

        <div grid md:grid-cols-3 gap-8 max-w-6xl mx-auto>
          {assistants.map((assistant, index) => (
            <div
              key={index}
              premium-card neon-border glass-dark p-10 rounded-3xl hover:scale-105 transition-all duration-500 animate-fadeInUp\"
              style={{animationDelay: `${index * 0.15}s`}}
            >
              <div className={`w-20 h-20 bg-gradient-to-br ${assistant.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto`}>
                <Mic className={`bg-gradient-to-r ${assistant.color} text-transparent bg-clip-text`} size={40} />
              </div>
              <h3 text-3xl font-bold text-white mb-4 text-center>{assistant.name}</h3>
              <div bg-slate-900/50 rounded-xl p-4 border border-slate-700>
                <p text-gray-300 text-center italic>\"{assistant.command}\"</p>
              </div>
            </div>
          ))}
        </div>

        <div mt-20 text-center>
          <div inline-flex flex-wrap gap-6 justify-center items-center>
            <div px-6 py-3 glass rounded-full border border-orange-500/30>
              <span text-white font-semibold>✓ Amazon Alexa</span>
            </div>
            <div px-6 py-3 glass rounded-full border border-orange-500/30>
              <span text-white font-semibold>✓ Google Assistant</span>
            </div>
            <div px-6 py-3 glass rounded-full border border-orange-500/30>
              <span text-white font-semibold>✓ Apple HomeKit</span>
            </div>
            <div px-6 py-3 glass rounded-full border border-orange-500/30>
              <span text-white font-semibold>✓ Samsung SmartThings</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceAssistantSection;
