import React, { useState } from 'react';
import { X, Smartphone, Tablet, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SiteSection, MiniSite } from '../../types/site-builder';

interface MobilePreviewProps {
  sections: SiteSection[];
  siteConfig: MiniSite;
  onClose: () => void;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const MobilePreview: React.FC<MobilePreviewProps> = ({ sections, siteConfig, onClose }) => {
  const [device, setDevice] = useState<DeviceType>('mobile');

  const deviceSizes: Record<DeviceType, { width: string; height: string }> = {
    mobile: { width: '375px', height: '667px' },
    tablet: { width: '768px', height: '1024px' },
    desktop: { width: '100%', height: '100%' }
  };

  const renderSection = (section: SiteSection) => {
    if (!section.visible) return null;

    switch (section.type) {
      case 'hero':
        return (
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
            <h1 className="text-3xl font-bold mb-2">{section.content.title}</h1>
            <p className="text-lg mb-4">{section.content.subtitle}</p>
            <button className="px-6 py-2 bg-white text-gray-900 rounded-lg font-semibold">
              {section.content.ctaText}
            </button>
          </div>
        );

      case 'about':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <p className="text-gray-600">{section.content.description}</p>
          </div>
        );

      case 'products':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <div className="grid grid-cols-2 gap-4">
              {section.content.items?.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                  <h3 className="font-semibold text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-600">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom"
                className="w-full border rounded-lg px-4 py-2"
                readOnly
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-4 py-2"
                readOnly
              />
              <textarea
                placeholder="Message"
                rows={4}
                className="w-full border rounded-lg px-4 py-2 resize-none"
                readOnly
              />
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold">
                Envoyer
              </button>
            </div>
          </div>
        );

      case 'gallery':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {section.content.images?.map((img: string, index: number) => (
                <div key={index} className="aspect-square bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <div className="space-y-4">
              {section.content.items?.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm mb-2 italic">"{item.text}"</p>
                  <p className="text-xs font-semibold">{item.author}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{section.content.title}</h2>
            <div className="aspect-video bg-gray-900 rounded flex items-center justify-center">
              <div className="text-white text-6xl">▶</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Aperçu Responsive</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded ${device === 'mobile' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                <Smartphone className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded ${device === 'tablet' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                <Tablet className="w-5 h-5" />
              </button>
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded ${device === 'desktop' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              >
                <Monitor className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Device Frame */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-100">
          <div
            style={{
              width: deviceSizes[device].width,
              height: deviceSizes[device].height,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
            className="bg-white rounded-lg shadow-2xl overflow-hidden"
          >
            {/* Browser/Mobile Header */}
            {device === 'desktop' && (
              <div className="h-10 bg-gray-200 flex items-center px-4 gap-2">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 mx-4 bg-white rounded px-3 py-1 text-xs text-gray-500">
                  SIB.com/{siteConfig.slug || 'preview'}
                </div>
              </div>
            )}

            {/* Content */}
            <div className="h-full overflow-y-auto">
              {sections.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <p>Aucune section à prévisualiser</p>
                </div>
              ) : (
                <div>
                  {sections.map(section => (
                    <div key={section.id}>
                      {renderSection(section)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          <div className="flex justify-between max-w-2xl mx-auto">
            <div>
              <strong>Device:</strong> {device === 'mobile' ? '📱 Mobile' : device === 'tablet' ? '📱 Tablet' : '💻 Desktop'}
            </div>
            <div>
              <strong>Resolution:</strong> {deviceSizes[device].width} × {deviceSizes[device].height}
            </div>
            <div>
              <strong>Sections:</strong> {sections.filter(s => s.visible).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
