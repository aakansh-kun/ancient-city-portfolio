import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

const PaimonChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Ehe te nandayo?! I'm Paimon, your best travel companion! What do you want to know about this mysterious traveler?", sender: 'paimon' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setInput('');
    
    // Simulate Paimon AI response
    setTimeout(() => {
      const paimonResponses = [
        "Paimon thinks this traveler is super skilled with React and Tailwind!",
        "Are we going to explore? This portfolio is full of secrets!",
        "Paimon is NOT emergency food! But speaking of food, did you see the projects section?",
        "Ehe! The animations here are smoother than a slime's surface!",
        "Hmm... Paimon doesn't understand all this code stuff, but it looks magical!"
      ];
      const randomResponse = paimonResponses[Math.floor(Math.random() * paimonResponses.length)];
      setMessages(prev => [...prev, { text: randomResponse, sender: 'paimon' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="glass-panel w-80 h-96 mb-4 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-genshin-dark/80 p-4 border-b border-genshin-gold/30 flex justify-between items-center relative">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-genshin-gold/20 flex items-center justify-center border border-genshin-gold/50">
                    <span className="text-sm">✨</span>
                 </div>
                 <h3 className="text-genshin-gold font-semibold tracking-wide">Paimon AI</h3>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                 <X size={20} />
               </button>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-genshin-blue/40 text-white rounded-tr-sm border border-genshin-blue/30' 
                      : 'bg-white/10 text-gray-100 rounded-tl-sm border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <div className="p-3 border-t border-genshin-gold/20 flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask Paimon..."
                className="flex-1 bg-black/40 border border-genshin-gold/30 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-genshin-gold transition-colors"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-full bg-genshin-gold/20 border border-genshin-gold/50 flex items-center justify-center text-genshin-gold hover:bg-genshin-gold/40 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full glass-panel flex items-center justify-center shadow-lg border border-genshin-gold/50 relative group"
      >
        <MessageCircle size={28} className="text-genshin-gold group-hover:text-white transition-colors" />
        {/* Floating star effect on hover */}
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">✨</div>
      </motion.button>
    </div>
  );
};

export default PaimonChat;
