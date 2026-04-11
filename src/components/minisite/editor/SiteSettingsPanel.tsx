import React, { memo, useCallback } from 'react';
import { Settings, Upload } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { toast } from 'sonner';

interface SiteSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl: string;
}

interface SiteSettingsPanelProps {
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
}

// OPTIMIZATION: Memoized site settings panel
export const SiteSettingsPanel: React.FC<SiteSettingsPanelProps> = memo(({
  settings,
  onSettingsChange
}) => {
  const handleColorChange = useCallback((field: keyof SiteSettings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
    if (field === 'primaryColor') {
      toast.success(`Couleur principale mise à jour: ${value}`);
    }
  }, [settings, onSettingsChange]);

  const handleFontChange = useCallback((value: string) => {
    onSettingsChange({ ...settings, fontFamily: value });
    toast.success(`Police mise à jour: ${value}`);
  }, [settings, onSettingsChange]);

  const handleLogoUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onSettingsChange({ ...settings, logoUrl: result });
          toast.success(`Logo mis à jour: ${file.name}`);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }, [settings, onSettingsChange]);

  return (
    <Card>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Paramètres du site
        </h3>

        <div className="space-y-4">
          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur principale
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Police
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => handleFontChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
            </select>
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo
            </label>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogoUpload}
            >
              <Upload className="h-3 w-3 mr-1" />
              Changer Logo
            </Button>
            {settings.logoUrl && (
              <div className="mt-2">
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="w-full h-20 object-contain bg-gray-100 rounded border"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
});

SiteSettingsPanel.displayName = 'SiteSettingsPanel';
