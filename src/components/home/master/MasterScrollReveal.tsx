import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { DM } from '../../../design/designMasterTokens';

interface MasterScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}

export const MasterScrollReveal: React.FC<MasterScrollRevealProps> = ({
  children,
  delay = 0,
  y = 40,
  className = '',
  ...rest
}) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ ...DM.springSoft, delay }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);
