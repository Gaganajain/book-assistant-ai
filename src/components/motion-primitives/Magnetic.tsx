import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { cn } from '../../lib/utils';

interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  springOptions?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export const Magnetic: React.FC<MagneticProps> = ({
  children,
  className,
  intensity = 0.25,
  springOptions = { stiffness: 260, damping: 20, mass: 0.1 },
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = event;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    x.set(distanceX * intensity);
    y.set(distanceY * intensity);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
};
