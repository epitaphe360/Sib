import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../ui/Button';

interface ExhibitorGenericModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export function ExhibitorGenericModal({ title, content, onClose }: ExhibitorGenericModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) {onClose();} }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-SIB-primary via-SIB-secondary to-SIB-accent" />
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
          <div className="mb-6">{content}</div>
          <div className="flex justify-end">
            <Button variant="default" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
