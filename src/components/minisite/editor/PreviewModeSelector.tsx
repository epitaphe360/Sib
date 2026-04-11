import React, { memo, useCallback } from 'react';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface PreviewModeSelectorProps {
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

// OPTIMIZATION: Memoized preview mode selector
export const PreviewModeSelector: React.FC<PreviewModeSelectorProps> = memo(({
  previewMode,
  onModeChange
}) => {
  const handleDesktopClick = useCallback(() => {
    onModeChange('desktop');
    toast('🖥️ Mode Desktop sélectionné');
  }, [onModeChange]);

  const handleTabletClick = useCallback(() => {
    onModeChange('tablet');
    toast('📱 Mode Tablette sélectionné');
  }, [onModeChange]);

  const handleMobileClick = useCallback(() => {
    onModeChange('mobile');
    toast('📱 Mode Mobile sélectionné');
  }, [onModeChange]);

  return (
    <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
      <button
        onClick={handleDesktopClick}
        className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
        aria-label="Mode Desktop"
      >
        <Monitor className="h-4 w-4" />
      </button>
      <button
        onClick={handleTabletClick}
        className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
        aria-label="Mode Tablette"
      >
        <Tablet className="h-4 w-4" />
      </button>
      <button
        onClick={handleMobileClick}
        className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
        aria-label="Mode Mobile"
      >
        <Smartphone className="h-4 w-4" />
      </button>
    </div>
  );
});

PreviewModeSelector.displayName = 'PreviewModeSelector';
