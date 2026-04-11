import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { MenuSection } from './MegaMenu';

interface MegaMenuDropdownProps {
  section: MenuSection;
  onItemClick: (href: string) => void;
}

/**
 * MegaMenuDropdown - Composant de dropdown pour le menu principal
 * 
 * Affiche les sous-services avec icônes et descriptions
 */
export const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  section,
  onItemClick,
}) => {
  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-100 z-50"
    >
      <div className="p-4 space-y-2">
        {section.items.map((item) => (
          <motion.button
            key={item.id}
            variants={itemVariants}
            onClick={() => onItemClick(item.href)}
            className={clsx(
              'w-full text-left px-4 py-3 rounded-lg',
              'hover:bg-gray-50 transition-colors group',
              'border border-transparent hover:border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              {item.icon && (
                <div className="flex-shrink-0 mt-1 text-amber-600 group-hover:text-amber-700">
                  {item.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">
                  {item.label}
                </div>
                {item.description && (
                  <div className="text-sm text-gray-600 mt-1">
                    {item.description}
                  </div>
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
