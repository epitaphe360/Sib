import React, { memo } from 'react';
import { MapPin, Award, Eye, Building2 } from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  companyName: string;
  description: string;
  backgroundImage?: string;
  logo: string;
  industry: string;
  country: string;
  booth?: string;
  isPremium?: boolean;
  viewCount?: number;
}

// OPTIMIZATION: Memoized hero section component
export const HeroSection: React.FC<HeroSectionProps> = memo(({
  companyName,
  description,
  backgroundImage,
  logo,
  industry,
  country,
  booth,
  isPremium = false,
  viewCount = 0
}) => {
  return (
    <section
      id="accueil"
      className="relative h-96 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <motion.div
        className="relative z-10 text-center text-white max-w-4xl mx-auto px-4"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center mb-6">
          <img
            src={logo}
            alt={companyName}
            className="h-24 w-24 rounded-2xl shadow-2xl ring-4 ring-white/20 object-cover"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {companyName}
        </h1>
        <p className="text-xl mb-6 drop-shadow-md max-w-2xl mx-auto">
          {description}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <Badge variant="default" className="bg-white/20 text-white backdrop-blur-sm">
            <Building2 className="h-3 w-3 mr-1" />
            {industry}
          </Badge>
          <Badge variant="default" className="bg-white/20 text-white backdrop-blur-sm">
            <MapPin className="h-3 w-3 mr-1" />
            {country}
          </Badge>
          {booth && (
            <Badge variant="default" className="bg-white/20 text-white backdrop-blur-sm">
              Stand {booth}
            </Badge>
          )}
          {isPremium && (
            <Badge variant="success" className="bg-yellow-500/90 text-white">
              <Award className="h-3 w-3 mr-1" />
              Exposant Premium
            </Badge>
          )}
        </div>
        {viewCount > 0 && (
          <div className="flex items-center justify-center text-white/80 text-sm">
            <Eye className="h-4 w-4 mr-1" />
            {viewCount} vues
          </div>
        )}
      </motion.div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
