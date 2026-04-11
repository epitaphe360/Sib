import React, { memo, useCallback } from 'react';
import { Plus, Eye, Trash2, Move, Layout, FileText, Image, Mail } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import type { Section, SectionType } from './types';

interface SectionsListProps {
  sections: Section[];
  sectionTypes: SectionType[];
  activeSection: string | null;
  onAddSection: (type: Section['type']) => void;
  onSelectSection: (id: string) => void;
  onRemoveSection: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

// OPTIMIZATION: Memoized sections list component
export const SectionsList: React.FC<SectionsListProps> = memo(({
  sections,
  sectionTypes,
  activeSection,
  onAddSection,
  onSelectSection,
  onRemoveSection,
  onToggleVisibility
}) => {
  const getSectionIcon = useCallback((type: Section['type']) => {
    const sectionType = sectionTypes.find(s => s.type === type);
    return sectionType?.icon || FileText;
  }, [sectionTypes]);

  return (
    <div className="space-y-6">
      {/* Add Section */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une section
          </h3>
          <div className="space-y-2">
            {sectionTypes.map((sectionType) => {
              const IconComponent = sectionType.icon;
              return (
                <Button
                  key={sectionType.type}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => onAddSection(sectionType.type as Section['type'])}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {sectionType.title}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Sections List */}
      <Card>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Move className="h-4 w-4 mr-2" />
            Sections ({sections.length})
          </h3>
          <div className="space-y-2">
            {sections.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune section. Ajoutez-en une ci-dessus.
              </p>
            ) : (
              sections.map((section) => {
                const IconComponent = getSectionIcon(section.type);
                return (
                  <div
                    key={section.id}
                    className={`
                      p-3 rounded-lg border-2 cursor-pointer transition-all
                      ${activeSection === section.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      ${!section.visible ? 'opacity-50' : ''}
                    `}
                    onClick={() => onSelectSection(section.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <IconComponent className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium text-sm text-gray-900">
                            {section.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {section.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(section.id);
                          }}
                          className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-200 rounded"
                          title={section.visible ? 'Masquer' : 'Afficher'}
                        >
                          <Eye
                            className={`h-3 w-3 ${
                              section.visible ? 'text-blue-500' : 'text-gray-400'
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSection(section.id);
                          }}
                          className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-red-100 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                    {activeSection === section.id && (
                      <Badge variant="info" className="mt-2">
                        En cours d'édition
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Card>
    </div>
  );
});

SectionsList.displayName = 'SectionsList';
