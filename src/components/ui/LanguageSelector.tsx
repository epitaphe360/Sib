import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, ChevronDown, Check, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore, supportedLanguages } from '../../store/languageStore';
import { toast } from 'sonner';

export const LanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Sélecteurs individuels pour une meilleure réactivité
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const isLoading = useLanguageStore((state) => state.isLoading);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  
  // Trouver la langue actuelle
  const currentLang = supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = useCallback(async (languageCode: string) => {
    if (languageCode === currentLanguage) {
      setIsOpen(false);
      return;
    }

    try {
      console.log('🌍 Changing language to:', languageCode);
      await setLanguage(languageCode);
      setIsOpen(false);
      
      // Notification de succès avec Sonner
      const newLang = supportedLanguages.find(lang => lang.code === languageCode);
      if (newLang) {
        toast.success(`${newLang.flag} Langue changée en ${newLang.nativeName}`, {
          duration: 3000,
          position: 'top-right'
        });
      }
      
      // Forcer un re-render de l'application
      window.dispatchEvent(new Event('languagechange'));
      
    } catch (error) {
      console.error('Erreur changement de langue:', error);
      toast.error('Erreur lors du changement de langue');
    }
  }, [currentLanguage, setLanguage]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center space-x-2 p-2 text-siports-gray-600 hover:text-siports-primary transition-colors rounded-lg hover:bg-siports-gray-100 disabled:opacity-50"
        title={`Langue actuelle: ${currentLang.nativeName}`}
      >
        {isLoading ? (
          <Loader className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <Globe className="h-5 w-5" />
            <span className="hidden sm:inline text-sm font-medium">
              {currentLang.flag} {currentLang.nativeName}
            </span>
            <span className="sm:hidden text-lg">
              {currentLang.flag}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-siports-gray-200 py-2 z-50"
          >
            <div className="px-4 py-2 border-b border-siports-gray-100">
              <h3 className="text-sm font-semibold text-siports-gray-900">
                Choisir la langue
              </h3>
              <p className="text-xs text-siports-gray-500 mt-1">
                Sélectionnez votre langue préférée
              </p>
            </div>
            
            <div className="py-2">
              {supportedLanguages.map((language) => {
                const isSelected = language.code === currentLanguage;
                
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-siports-gray-50 transition-colors disabled:opacity-50 ${
                      isSelected ? 'bg-siports-primary/5 text-siports-primary' : 'text-siports-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{language.flag}</span>
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-siports-primary' : 'text-siports-gray-900'}`}>
                          {language.nativeName}
                        </div>
                        <div className="text-xs text-siports-gray-500">
                          {language.name}
                        </div>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <Check className="h-4 w-4 text-siports-primary" />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="px-4 py-2 border-t border-siports-gray-100">
              <p className="text-xs text-siports-gray-500">
                💡 Les traductions sont appliquées instantanément
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};