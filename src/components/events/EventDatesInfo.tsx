import { Calendar, Clock } from 'lucide-react';
import { Card } from '../ui/Card';

export default function EventDatesInfo() {
  const eventDates = [
    { date: '25 novembre 2026', day: 'Jour 1', color: 'bg-blue-500' },
    { date: '26 novembre 2026', day: 'Jour 2', color: 'bg-blue-600' },
    { date: '27 novembre 2026', day: 'Jour 3', color: 'bg-blue-700' },
    { date: '28 novembre 2026', day: 'Jour 4', color: 'bg-blue-800' },
    { date: '29 novembre 2026', day: 'Jour 5', color: 'bg-blue-900' }
  ];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">
            SIB 2026 - Dates de l'événement
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {eventDates.map((item, index) => (
            <div
              key={index}
              className={`${item.color} text-white rounded-lg p-4 text-center transform transition-transform hover:scale-105`}
            >
              <div className="text-xs font-semibold uppercase mb-1 opacity-90">
                {item.day}
              </div>
              <div className="text-lg font-bold">
                {item.date}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-3 border border-blue-200">
          <div className="flex items-center justify-center text-sm text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-blue-600" />
            <span className="font-medium">
              Horaires : 9h00 - 19h00
            </span>
          </div>
        </div>

        <div className="mt-3 text-center text-xs text-blue-700 font-medium">
          ⚠️ Les rendez-vous ne peuvent être pris QUE durant ces 5 jours
        </div>
      </div>
    </Card>
  );
}
