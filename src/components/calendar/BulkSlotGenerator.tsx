import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SupabaseService } from '../../services/supabaseService';

interface BulkSlotGeneratorProps {
  userId: string;
  onGenerate: () => void;
  onClose: () => void;
}

export const BulkSlotGenerator: React.FC<BulkSlotGeneratorProps> = ({ userId, onGenerate, onClose }) => {
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [duration, setDuration] = useState(30);
  const [maxBookings, setMaxBookings] = useState(1); // Default to 1
  const [isGenerating, setIsGenerating] = useState(false);

  // Hardcoded salon dates based on requirements
  const salonDays = [
    { date: '2026-04-01', label: 'Mercredi 1 Avril 2026' },
    { date: '2026-04-02', label: 'Jeudi 2 Avril 2026' },
    { date: '2026-04-03', label: 'Vendredi 3 Avril 2026' },
  ];

  const handleDateToggle = (date: string) => {
    if (selectedDates.includes(date)) {
      setSelectedDates(selectedDates.filter(d => d !== date));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  const calculateSlots = () => {
    if (!startTime || !endTime || duration <= 0) return 0;
    
    let totalSlots = 0;
    const startMin = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMin = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    if (endMin <= startMin) return 0;
    
    const slotsPerDay = Math.floor((endMin - startMin) / duration);
    return slotsPerDay * selectedDates.length;
  };

  const totalInteractions = calculateSlots() * maxBookings;

  const handleGenerate = async () => {
    if (selectedDates.length === 0) {
      toast.error('Veuillez sélectionner au moins un jour');
      return;
    }
    if (startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    setIsGenerating(true);

    try {
      const slotsToCreate = [];
      const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
      const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

      for (const date of selectedDates) {
        let currentMin = startMinutes;
        
        while (currentMin + duration <= endMinutes) {
          // Format times
          const hStart = Math.floor(currentMin / 60).toString().padStart(2, '0');
          const mStart = (currentMin % 60).toString().padStart(2, '0');
          
          const endSlotMin = currentMin + duration;
          const hEnd = Math.floor(endSlotMin / 60).toString().padStart(2, '0');
          const mEnd = (endSlotMin % 60).toString().padStart(2, '0');

          slotsToCreate.push({
            userId,
            date: date,
            startTime: `${hStart}:${mStart}:00`,
            endTime: `${hEnd}:${mEnd}:00`,
            duration: duration,
            type: 'in-person' as const,
            maxBookings: maxBookings,
            location: 'Sur le stand',
            description: 'Créneau généré automatiquement'
          });

          currentMin += duration;
        }
      }

      console.log(`Génération de ${slotsToCreate.length} créneaux...`);
      
      await SupabaseService.createTimeSlotsBulk(slotsToCreate);
      
      toast.success(`${slotsToCreate.length} créneaux générés avec succès !`);
      onGenerate();
      onClose();

    } catch (error) {
      console.error('Erreur génération', error);
      toast.error('Erreur lors de la génération des créneaux');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Générateur de créneaux rapide</p>
          <p>
            Créez tous vos créneaux en une seule fois pour les jours de votre choix.
            Idéal si vos horaires sont réguliers.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          1. Sélectionnez les jours
        </label>
        <div className="space-y-2">
          {salonDays.map((day) => (
            <label key={day.date} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={selectedDates.includes(day.date)}
                onChange={() => handleDateToggle(day.date)}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-gray-900">{day.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            2. Heure de début
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Heure de fin
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            3. Durée par RDV
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={15}>15 minutes</option>
            <option value={20}>20 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 heure</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            4. Capacité par créneau
          </label>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              max="50"
              value={maxBookings}
              onChange={(e) => setMaxBookings(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-blue-300 rounded-lg bg-blue-50 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-600 text-sm">Résumé de la génération</p>
        <div className="flex justify-center items-baseline space-x-2 mt-1">
           <span className="text-2xl font-bold text-blue-600">{calculateSlots()}</span>
           <span className="text-gray-500">créneaux</span>
           <span className="text-gray-400 mx-1">×</span>
           <span className="text-2xl font-bold text-blue-600">{maxBookings}</span>
           <span className="text-gray-500">places</span>
        </div>
        <p className="text-sm font-medium text-gray-900 mt-2">
           Total: {totalInteractions} possibilités de rencontre
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || selectedDates.length === 0 || calculateSlots() === 0}
            className="bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? 'Génération en cours...' : 'Générer les créneaux'}
        </Button>
      </div>
    </div>
  );
};
