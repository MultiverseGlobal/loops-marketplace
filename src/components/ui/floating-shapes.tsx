'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function FloatingShapes() {
  const { scrollY } = useScroll();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 40,
        y: (e.clientY / window.innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax scroll effects
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -400]);
  const rotate1 = useTransform(scrollY, [0, 1000], [0, 45]);
  const rotate2 = useTransform(scrollY, [0, 1000], [0, -45]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5] overflow-hidden opacity-60">
      {/* Lightning 3D Shape */}
      <motion.div
        style={{ y: y1, rotate: rotate1, x: mousePos.x * 0.5 }}
        animate={{ 
          y: [0, -15, 0],
          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute top-[15%] left-[5%] w-32 h-32 md:w-48 md:h-48"
      >
        <Image 
          src="/assets/3d/lightning.png" 
          alt="" 
          width={200} 
          height={200} 
          className="object-contain drop-shadow-2xl"
          priority
        />
      </motion.div>

      {/* Bag 3D Shape */}
      <motion.div
        style={{ y: y2, rotate: rotate2, x: -mousePos.x * 0.3 }}
        animate={{ 
          y: [0, 20, 0],
          transition: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
        className="absolute top-[40%] right-[8%] w-40 h-40 md:w-64 md:h-64"
      >
        <Image 
          src="/assets/3d/bag.png" 
          alt="" 
          width={250} 
          height={250} 
          className="object-contain drop-shadow-2xl"
        />
      </motion.div>

      {/* Decorative Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-[20%] left-[15%] w-96 h-96 bg-loops-primary/5 rounded-full blur-[100px]" 
      />
      
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-loops-teal/5 rounded-full blur-[120px]" 
      />
    </div>
  );
}
