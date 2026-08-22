import React from 'react';
import { motion, Variants } from 'motion/react';
import { cn } from '../../lib/utils';

type PerType = 'word' | 'char' | 'line';
type PresetType = 'fade' | 'slide' | 'scale' | 'blur';

interface TextEffectProps {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  className?: string;
  preset?: PresetType;
  delay?: number;
  speedReveal?: number;
  onAnimationComplete?: () => void;
}

const defaultContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const defaultItemVariants: Record<PresetType, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
  },
  slide: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.92, y: 6 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(6px)', y: 8 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
  },
};

export const TextEffect: React.FC<TextEffectProps> = ({
  children,
  per = 'word',
  as = 'p',
  variants,
  className,
  preset = 'slide',
  delay = 0,
  speedReveal = 1,
  onAnimationComplete,
}) => {
  const Component = motion[as as keyof typeof motion] as any || motion.p;

  const segments = React.useMemo(() => {
    if (per === 'word') {
      return children.split(' ').map((word) => `${word}\u00A0`);
    }
    if (per === 'char') {
      return Array.from(children);
    }
    return children.split('\n');
  }, [children, per]);

  const stagger = per === 'char' ? 0.015 / speedReveal : 0.05 / speedReveal;

  const container: Variants = variants?.container || {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const item: Variants = variants?.item || defaultItemVariants[preset];

  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={container}
      onAnimationComplete={onAnimationComplete}
      className={cn('inline-block', className)}
    >
      {segments.map((segment, i) => (
        <motion.span
          key={`${segment}-${i}`}
          variants={item}
          className="inline-block whitespace-pre-wrap"
        >
          {segment}
        </motion.span>
      ))}
    </Component>
  );
};
