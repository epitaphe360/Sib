import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { MegaMenuDropdown } from './MegaMenuDropdown';

export interface MenuSection {
  id: string;
  label: string;
  icon?: React.ReactNode;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  icon?: React.ReactNode;
}

interface MegaMenuProps {
  sections: MenuSection[];
  onNavigate?: (href: string) => void;
  className?: string;
}

/**
 * MegaMenu - Composant de navigation principal avec menu déroulant
 *
 * Fonctionnalités :
 * - Menu déroulant avec sous-services
 * - Responsive design (drawer sur mobile)
 * - Animations fluides
 * - Support multilingue
 */
export const MegaMenu: React.FC<MegaMenuProps> = ({
  sections,
  onNavigate,
  className,
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSectionHover = useCallback((sectionId: string | null) => {
    setActiveSection(sectionId);
  }, []);

  const handleMenuItemClick = useCallback((href: string) => {
    onNavigate?.(href);
    setActiveSection(null);
    setIsMobileMenuOpen(false);
  }, [onNavigate]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  return (
    <nav className={clsx('bg-white shadow-sm', className)}>
      {/* Desktop Menu */}
      <div className="hidden lg:flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-1">
          {sections.map((section) => (
            <div
              key={section.id}
              className="relative group"
              onMouseEnter={() => handleSectionHover(section.id)}
              onMouseLeave={() => handleSectionHover(null)}
            >
              <button
                className={clsx(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  'hover:bg-gray-100 flex items-center gap-2',
                  activeSection === section.id && 'bg-gray-100'
                )}
              >
                {section.label}
                <ChevronDown
                  size={16}
                  className={clsx(
                    'transition-transform',
                    activeSection === section.id && 'rotate-180'
                  )}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeSection === section.id && (
                  <MegaMenuDropdown
                    section={section}
                    onItemClick={handleMenuItemClick}
                  />
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
            {t('common.contact')}
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
            {t('common.requestAudit')}
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4">
        <div className="text-2xl font-bold text-gray-900">SIB 2026</div>
        <button
          onClick={handleMobileMenuToggle}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {sections.map((section) => (
                <div key={section.id} className="space-y-2">
                  <div className="font-semibold text-gray-900 px-2 py-2">
                    {section.label}
                  </div>
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.href)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              ))}

              {/* Mobile CTA Buttons */}
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <button className="w-full px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                  {t('common.contact')}
                </button>
                <button className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  {t('common.requestAudit')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

