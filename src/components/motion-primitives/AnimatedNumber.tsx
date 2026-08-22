import React, { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  springOptions?: {
    bounce?: number;
    duration?: number;
    stiffness?: number;
    damping?: number;
  };
  as?: keyof React.JSX.IntrinsicElements;
  format?: (value: number) => string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className,
  springOptions = { stiffness: 180, damping: 24 },
  as = 'span',
  format = (val) => Math.round(val).toLocaleString(),
}) => {
  const spring = useSpring(0, springOptions);
  const display = useTransform(spring, (current) => format(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const Component = motion[as as keyof typeof motion] as any || motion.span;

  return <Component className={cn('tabular-nums inline-block', className)}>{display}</Component>;
};
