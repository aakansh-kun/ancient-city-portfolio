import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StarrySky = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate random background stars
    const newStars = Array.from({ length: 150 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      delay: Math.random() * 3,
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Deep blue/black gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811] via-[#0B101E] to-[#141d33]" />
      
      {/* Random Stars */}
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="star bg-white rounded-full absolute"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 0.3, star.opacity],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Paimon Constellation (Abstract rendering) */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <motion.g 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 4, yoyo: Infinity }}
          stroke="rgba(211, 188, 142, 0.4)" 
          strokeWidth="1"
        >
          {/* Crown */}
          <line x1="75%" y1="20%" x2="73%" y2="25%" />
          <line x1="73%" y1="25%" x2="77%" y2="25%" />
          <line x1="77%" y1="25%" x2="75%" y2="20%" />
          
          {/* Head & Body abstract */}
          <line x1="75%" y1="20%" x2="75%" y2="30%" />
          <line x1="75%" y1="30%" x2="72%" y2="35%" />
          <line x1="75%" y1="30%" x2="78%" y2="35%" />
          <line x1="72%" y1="35%" x2="78%" y2="35%" />
          
          {/* Scarf / Cape */}
          <line x1="72%" y1="35%" x2="68%" y2="42%" />
          <line x1="78%" y1="35%" x2="82%" y2="42%" />

          {/* Stars at constellation points */}
          <circle cx="75%" cy="20%" r="3" fill="#D3BC8E" />
          <circle cx="73%" cy="25%" r="2" fill="#D3BC8E" />
          <circle cx="77%" cy="25%" r="2" fill="#D3BC8E" />
          <circle cx="75%" cy="30%" r="2.5" fill="#D3BC8E" />
          <circle cx="72%" cy="35%" r="2" fill="#D3BC8E" />
          <circle cx="78%" cy="35%" r="2" fill="#D3BC8E" />
          <circle cx="68%" cy="42%" r="2.5" fill="#D3BC8E" />
          <circle cx="82%" cy="42%" r="2.5" fill="#D3BC8E" />
        </motion.g>
      </svg>

      {/* Shooting Stars */}
      <div className="absolute top-10 right-20 w-[2px] h-[100px] bg-gradient-to-b from-transparent via-white to-transparent animate-shooting-star" style={{ transform: 'rotate(45deg)' }} />
      <div className="absolute top-40 left-1/4 w-[2px] h-[80px] bg-gradient-to-b from-transparent via-genshin-gold to-transparent animate-shooting-star" style={{ transform: 'rotate(45deg)', animationDelay: '2s', animationDuration: '6s' }} />
    </div>
  );
};

export default StarrySky;
