import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface GlowEffectProps {
  className?: string;
  colors?: string[];
  duration?: number;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({
  className,
  colors = ['#6366f1', '#a855f7', '#3b82f6', '#6366f1'],
  duration = 4,
}) => {
  return (
    <div
      className={cn(
        'pointer-events-none absolute -inset-0.5 rounded-[inherit] opacity-75 blur-xs transition-opacity duration-500 overflow-hidden',
        className
      )}
    >
      <motion.div
        className="absolute inset-[-100%]"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
        }}
      />
    </div>
  );
};
