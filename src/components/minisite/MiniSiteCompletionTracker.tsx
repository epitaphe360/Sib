import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Progress } from '../ui/Progress';
import { getPrioritizedSections, calculateCompletion } from '../../services/miniSiteFormService';

interface MiniSiteCompletionTrackerProps {
  formData: any;
  onSectionClick?: (section: string) => void;
}

/**
 * Affiche la progression et les sections prioritaires pour compléter un mini-site
 */
export function MiniSiteCompletionTracker({
  formData,
  onSectionClick,
}: MiniSiteCompletionTrackerProps) {
  const completion = calculateCompletion(formData);
  const sections = getPrioritizedSections(formData);

  const highPrioritySections = sections.filter(s => s.priority === 'high');
  const mediumPrioritySections = sections.filter(s => s.priority === 'medium');
  const lowPrioritySections = sections.filter(s => s.priority === 'low');

  const highComplete = highPrioritySections.filter(s => s.complete).length;
  const allHighComplete = highComplete === highPrioritySections.length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Complétude du Mini-Site</h3>
            <p className="text-sm text-gray-600 mt-1">
              {completion}% des informations requises
            </p>
          </div>
          <div className="text-4xl font-bold text-blue-600">{completion}%</div>
        </div>

        <Progress value={completion} className="h-3" />

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {sections.filter(s => s.complete).length}
            </div>
            <p className="text-sm text-gray-600">Complétées</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">
              {sections.filter(s => !s.complete).length}
            </div>
            <p className="text-sm text-gray-600">À remplir</p>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {sections.length}
            </div>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </Card>

      {/* Sections par Priorité */}

      {/* Priorité HAUTE */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <h4 className="font-semibold text-gray-900">
            À faire d'abord ({highComplete}/{highPrioritySections.length})
          </h4>
        </div>

        <div className="space-y-2">
          {highPrioritySections.map(section => (
            <SectionItem
              key={section.section}
              section={section}
              onClick={() => onSectionClick?.(section.section)}
            />
          ))}
        </div>

        {allHighComplete && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700 font-medium">Bravo! Sections essentielles complétées ✓</p>
          </div>
        )}
      </div>

      {/* Priorité MOYENNE */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3">
          Recommandé ({mediumPrioritySections.filter(s => s.complete).length}/{mediumPrioritySections.length})
        </h4>

        <div className="space-y-2">
          {mediumPrioritySections.map(section => (
            <SectionItem
              key={section.section}
              section={section}
              onClick={() => onSectionClick?.(section.section)}
            />
          ))}
        </div>
      </div>

      {/* Priorité BASSE */}
      <details className="group">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
          Optionnel ({lowPrioritySections.filter(s => s.complete).length}/{lowPrioritySections.length})
        </summary>

        <div className="space-y-2 mt-3">
          {lowPrioritySections.map(section => (
            <SectionItem
              key={section.section}
              section={section}
              onClick={() => onSectionClick?.(section.section)}
            />
          ))}
        </div>
      </details>

      {/* Next Steps */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-2">Prochaine étape</h4>
        <p className="text-sm text-gray-700">
          {allHighComplete
            ? '✓ Excellente base! Ajoutez maintenant des photos et contenus pour améliorer votre mini-site.'
            : '→ Complétez d\'abord les sections essentielles marquées en rouge.'}
        </p>
      </Card>
    </div>
  );
}

interface SectionItemProps {
  section: {
    priority: 'high' | 'medium' | 'low';
    section: string;
    complete: boolean;
  };
  onClick?: () => void;
}

function SectionItem({ section, onClick }: SectionItemProps) {
  const priorityColors = {
    high: 'bg-red-50 border-red-200 hover:bg-red-100',
    medium: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
    low: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 border rounded-lg flex items-center gap-3 transition ${priorityColors[section.priority]} ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {section.complete ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
      ) : (
        <Circle className="h-5 w-5 text-gray-400 flex-shrink-0" />
      )}
      <span className={`text-sm font-medium ${section.complete ? 'text-gray-700' : 'text-gray-600'}`}>
        {section.section}
      </span>
      {section.complete && <span className="ml-auto text-xs text-green-600">✓</span>}
    </button>
  );
}

export default MiniSiteCompletionTracker;
