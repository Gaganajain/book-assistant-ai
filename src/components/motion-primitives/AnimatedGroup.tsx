import React from 'react';
import { motion, Variants } from 'motion/react';
import { cn } from '../../lib/utils';

type PresetType = 'fade' | 'slide' | 'scale' | 'blur';

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: {
    container?: Variants;
    item?: Variants;
  };
  preset?: PresetType;
  as?: keyof React.JSX.IntrinsicElements;
  stagger?: number;
  delay?: number;
}

const defaultItemPresets: Record<PresetType, Variants> = {
  fade: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  },
  slide: {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
  blur: {
    hidden: { opacity: 0, filter: 'blur(4px)', y: 8 },
    visible: { opacity: 1, filter: 'blur(0px)', y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  },
};

export const AnimatedGroup: React.FC<AnimatedGroupProps> = ({
  children,
  className,
  variants,
  preset = 'slide',
  as = 'div',
  stagger = 0.06,
  delay = 0,
}) => {
  const containerVariants: Variants = variants?.container || {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const itemVariants: Variants = variants?.item || defaultItemPresets[preset];

  const Component = motion[as as keyof typeof motion] as any || motion.div;

  return (
    <Component
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(className)}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div key={child.key || index} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </Component>
  );
};
