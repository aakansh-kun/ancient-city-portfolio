import React from 'react';
import { motion } from 'framer-motion';
import { Mail, ExternalLink, ChevronDown, Link, Globe } from 'lucide-react';

const Portfolio = () => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="glass-panel max-w-4xl w-full rounded-3xl p-8 md:p-12 relative overflow-hidden"
      >
        {/* Decorative corner elements */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-genshin-gold/40 rounded-tl-3xl opacity-50 m-4" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-genshin-gold/40 rounded-tr-3xl opacity-50 m-4" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-genshin-gold/40 rounded-bl-3xl opacity-50 m-4" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-genshin-gold/40 rounded-br-3xl opacity-50 m-4" />

        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-genshin-blue/40 to-genshin-gold/40 p-1 mb-8"
          >
            <div className="w-full h-full rounded-full bg-genshin-dark flex items-center justify-center border border-genshin-gold/30">
              {/* Anonymous Avatar Placeholder */}
              <span className="text-5xl">🎭</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-genshin-gold via-white to-genshin-gold mb-4"
          >
            THE TRAVELER
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl font-light leading-relaxed mb-10"
          >
            A mysterious developer from another world, weaving code and magic to build enchanting digital experiences. Exploring the realms of React, Tailwind, and beyond.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4 mb-12"
          >
            <a href="#" className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-genshin-gold/50 hover:bg-genshin-gold/10 transition-all text-gray-300 hover:text-genshin-gold">
              <Globe />
            </a>
            <a href="#" className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-genshin-gold/50 hover:bg-genshin-gold/10 transition-all text-gray-300 hover:text-genshin-gold">
              <Link />
            </a>
            <a href="#" className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-genshin-gold/50 hover:bg-genshin-gold/10 transition-all text-gray-300 hover:text-genshin-gold">
              <Mail />
            </a>
          </motion.div>

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="w-full text-left"
          >
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-genshin-gold/30"></div>
              <h2 className="text-2xl font-medium tracking-widest text-genshin-gold uppercase">Relics & Artifacts</h2>
              <div className="h-[1px] w-12 bg-genshin-gold/30"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((item) => (
                <div key={item} className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-genshin-gold/40 transition-all overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-genshin-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h3 className="text-xl font-medium text-white mb-2 flex justify-between items-center relative z-10">
                    Project {item} <ExternalLink size={16} className="text-gray-400 group-hover:text-genshin-gold" />
                  </h3>
                  <p className="text-sm text-gray-400 relative z-10">An intricate web application forged with react and ancient magic. Optimized for performance across all domains.</p>
                  
                  <div className="flex gap-2 mt-4 relative z-10">
                    <span className="text-xs px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-300">React</span>
                    <span className="text-xs px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-300">Tailwind</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mt-16 text-genshin-gold/60"
      >
        <ChevronDown size={32} />
      </motion.div>
    </div>
  );
};

export default Portfolio;
