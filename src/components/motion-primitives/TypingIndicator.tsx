import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface TypingIndicatorProps {
  className?: string;
  dotClassName?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className,
  dotClassName,
}) => {
  return (
    <div className={cn('flex items-center gap-1.5 py-1 px-1', className)}>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className={cn('h-2 w-2 rounded-full bg-indigo-600', dotClassName)}
          animate={{
            scale: [0.8, 1.25, 0.8],
            opacity: [0.4, 1, 0.4],
            y: ['0px', '-4px', '0px'],
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            delay: index * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};
