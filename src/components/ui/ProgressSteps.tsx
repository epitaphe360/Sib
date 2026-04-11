import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  completed: boolean;
}

interface ProgressStepsProps {
  steps: Step[];
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps }) => {
  const completedCount = steps.filter(s => s.completed).length;
  const percentage = (completedCount / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Barre de progression globale */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">Progression du formulaire</span>
          <span className="font-semibold text-primary-600">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Étapes */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
              step.completed 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'bg-white border-gray-300 text-gray-400'
            }`}>
              {step.completed ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
            </div>
            <span className={`mt-2 text-xs text-center ${step.completed ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
