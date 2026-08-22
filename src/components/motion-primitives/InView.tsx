import React, { useRef } from 'react';
import { motion, useInView, Variants } from 'motion/react';
import { cn } from '../../lib/utils';

interface InViewProps {
  children: React.ReactNode;
  variants?: Variants;
  transition?: any;
  viewOptions?: {
    once?: boolean;
    margin?: any;
    amount?: 'some' | 'all' | number;
  };
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  },
};

export const InView: React.FC<InViewProps> = ({
  children,
  variants = defaultVariants,
  transition,
  viewOptions = { once: true, margin: '0px 0px -50px 0px' },
  as = 'div',
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, viewOptions);

  const Component = motion[as as keyof typeof motion] as any || motion.div;

  return (
    <Component
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={cn(className)}
    >
      {children}
    </Component>
  );
};
