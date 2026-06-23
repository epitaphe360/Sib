import React from 'react';
import { motion } from 'framer-motion';
import { DM } from '../../../design/designMasterTokens';

interface MasterGlassCardProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
  as?: 'div' | 'article';
}

export const MasterGlassCard: React.FC<MasterGlassCardProps> = ({
  children,
  className = '',
  light = false,
  as = 'div',
}) => {
  const Tag = motion[as];
  return (
    <Tag
      whileHover={{ scale: DM.hoverScale }}
      transition={DM.spring}
      className={`${light ? 'dm-glass-light' : 'dm-glass'} rounded-[32px] dm-card-hover overflow-hidden ${className}`}
    >
      {children}
    </Tag>
  );
};

interface MasterBentoGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

export const MasterBentoGrid: React.FC<MasterBentoGridProps> = ({
  children,
  cols = 3,
  className = '',
}) => {
  const colClass =
    cols === 4
      ? 'lg:grid-cols-4'
      : cols === 2
        ? 'lg:grid-cols-2'
        : 'lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 ${colClass} gap-10 ${className}`}>
      {children}
    </div>
  );
};
