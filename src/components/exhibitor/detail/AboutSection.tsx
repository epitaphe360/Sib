import React, { memo } from 'react';
import { Target, Zap, CheckCircle } from 'lucide-react';
import { Card } from '../../ui/Card';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  description: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

// OPTIMIZATION: Memoized about section component
export const AboutSection: React.FC<AboutSectionProps> = memo(({
  description,
  mission,
  vision,
  values = []
}) => {
  return (
    <section id="apropos" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">À propos de nous</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Description */}
            <Card>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Notre Histoire</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            </Card>

            {/* Mission & Vision */}
            <div className="space-y-6">
              {mission && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-start space-x-3">
                      <Target className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notre Mission</h3>
                        <p className="text-gray-600">{mission}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {vision && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-start space-x-3">
                      <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Notre Vision</h3>
                        <p className="text-gray-600">{vision}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Values */}
          {values.length > 0 && (
            <Card className="mt-8">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos Valeurs</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {values.map((value) => (
                    <div key={value} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';
