import React, { useRef, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, useMotionTemplate } from 'motion/react';
import { cn } from '../../lib/utils';

interface SpotlightProps {
  className?: string;
  size?: number;
  springOptions?: {
    bounce?: number;
    stiffness?: number;
    damping?: number;
  };
  fill?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  className,
  size = 350,
  springOptions = { bounce: 0, stiffness: 350, damping: 30 },
  fill = 'rgba(99, 102, 241, 0.12)',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  const background = useMotionTemplate`radial-gradient(${size}px circle at ${mouseX}px ${mouseY}px, ${fill}, transparent 80%)`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </div>
  );
};
