import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import type { SiteSection } from '../../types/site-builder';

interface SectionEditorProps {
  section: SiteSection;
  selected: boolean;
  onSelect: () => void;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  selected,
  onSelect,
  onUpdate,
  onDelete,
  onToggleVisibility
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const renderSectionContent = () => {
    switch (section.type) {
      case 'hero':
        return (
          <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre principal"
              className="text-4xl font-bold bg-transparent border-none outline-none mb-4 w-full"
            />
            <input
              type="text"
              value={section.content.subtitle || ''}
              onChange={(e) => onUpdate({ ...section.content, subtitle: e.target.value })}
              placeholder="Sous-titre"
              className="text-xl bg-transparent border-none outline-none mb-6 w-full"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={section.content.ctaText || ''}
                onChange={(e) => onUpdate({ ...section.content, ctaText: e.target.value })}
                placeholder="Texte bouton"
                className="px-4 py-2 bg-white text-gray-900 rounded font-semibold"
              />
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-4 w-full border-none outline-none"
            />
            <textarea
              value={section.content.description || ''}
              onChange={(e) => onUpdate({ ...section.content, description: e.target.value })}
              placeholder="Description..."
              rows={5}
              className="w-full border rounded p-4 resize-none"
            />
          </div>
        );

      case 'products':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-6 w-full border-none outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(section.content.items || []).map((item: any, index: number) => (
                <div key={index} className="border rounded p-4">
                  <div className="aspect-square bg-gray-200 rounded mb-2"></div>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => {
                      const newItems = [...(section.content.items || [])];
                      newItems[index] = { ...item, name: e.target.value };
                      onUpdate({ ...section.content, items: newItems });
                    }}
                    placeholder="Nom produit"
                    className="font-semibold w-full mb-1"
                  />
                  <input
                    type="text"
                    value={item.price || ''}
                    onChange={(e) => {
                      const newItems = [...(section.content.items || [])];
                      newItems[index] = { ...item, price: e.target.value };
                      onUpdate({ ...section.content, items: newItems });
                    }}
                    placeholder="Prix"
                    className="text-sm text-gray-600 w-full"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newItems = [...(section.content.items || []), { name: '', price: '', image: '' }];
                  onUpdate({ ...section.content, items: newItems });
                }}
                className="border-2 border-dashed rounded p-4 flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                + Ajouter
              </button>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-6 w-full border-none outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <input
                type="email"
                value={section.content.email || ''}
                onChange={(e) => onUpdate({ ...section.content, email: e.target.value })}
                placeholder="Email"
                className="border rounded px-4 py-2"
              />
              <input
                type="tel"
                value={section.content.phone || ''}
                onChange={(e) => onUpdate({ ...section.content, phone: e.target.value })}
                placeholder="Téléphone"
                className="border rounded px-4 py-2"
              />
            </div>
            <textarea
              value={section.content.address || ''}
              onChange={(e) => onUpdate({ ...section.content, address: e.target.value })}
              placeholder="Adresse"
              rows={3}
              className="w-full border rounded px-4 py-2"
            />
          </div>
        );

      case 'gallery':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-6 w-full border-none outline-none"
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {(section.content.images || []).map((img: string, index: number) => (
                <div key={index} className="aspect-square bg-gray-200 rounded"></div>
              ))}
              <div className="aspect-square border-2 border-dashed rounded flex items-center justify-center text-gray-400">
                + Image
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-6 w-full border-none outline-none"
            />
            <div className="space-y-4">
              {(section.content.items || []).map((item: any, index: number) => (
                <div key={index} className="border rounded p-4">
                  <textarea
                    value={item.text || ''}
                    onChange={(e) => {
                      const newItems = [...(section.content.items || [])];
                      newItems[index] = { ...item, text: e.target.value };
                      onUpdate({ ...section.content, items: newItems });
                    }}
                    placeholder="Témoignage..."
                    rows={2}
                    className="w-full mb-2"
                  />
                  <input
                    type="text"
                    value={item.author || ''}
                    onChange={(e) => {
                      const newItems = [...(section.content.items || [])];
                      newItems[index] = { ...item, author: e.target.value };
                      onUpdate({ ...section.content, items: newItems });
                    }}
                    placeholder="Auteur"
                    className="font-semibold w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="p-8">
            <input
              type="text"
              value={section.content.title || ''}
              onChange={(e) => onUpdate({ ...section.content, title: e.target.value })}
              placeholder="Titre"
              className="text-3xl font-bold mb-6 w-full border-none outline-none"
            />
            <div className="aspect-video bg-gray-900 rounded flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">▶</div>
                <input
                  type="text"
                  value={section.content.videoUrl || ''}
                  onChange={(e) => onUpdate({ ...section.content, videoUrl: e.target.value })}
                  placeholder="URL vidéo YouTube/Vimeo"
                  className="bg-gray-800 px-4 py-2 rounded"
                />
              </div>
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="p-8">
            <textarea
              value={section.content.html || ''}
              onChange={(e) => onUpdate({ ...section.content, html: e.target.value })}
              placeholder="Code HTML personnalisé"
              rows={10}
              className="w-full border rounded p-4 font-mono text-sm resize-none"
            />
          </div>
        );

      default:
        return <div className="p-8 text-gray-400">Section type: {section.type}</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative border-2 rounded-lg mb-4 transition-all ${
        selected ? 'border-blue-500 shadow-lg' : 'border-transparent hover:border-gray-300'
      } ${!section.visible ? 'opacity-50' : ''}`}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="w-6 h-6 text-gray-400 hover:text-gray-600" />
      </div>

      {/* Actions */}
      <div className="absolute right-2 top-2 flex gap-1 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white rounded shadow hover:bg-gray-50"
        >
          {section.visible ? (
            <Eye className="w-4 h-4 text-gray-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center bg-white rounded shadow hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {/* Content */}
      <div className="pt-8">
        {renderSectionContent()}
      </div>
    </div>
  );
};
