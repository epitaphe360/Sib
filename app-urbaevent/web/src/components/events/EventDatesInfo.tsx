import React from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { DEFAULT_SALON_CONFIG, formatSalonDatesWithNote, formatSalonHours } from '../../config/salonInfo';

export default function EventDatesInfo() {
  const eventDates = [
    { date: '25 novembre 2026', day: 'Mercredi', color: 'bg-primary-600' },
    { date: '26 novembre 2026', day: 'Jeudi', color: 'bg-primary-600' },
    { date: '27 novembre 2026', day: 'Vendredi', color: 'bg-primary-700' },
    { date: '28 novembre 2026', day: 'Samedi', color: 'bg-primary-700' },
    { date: '29 novembre 2026', day: 'Dimanche', color: 'bg-primary-800' },
  ];

  return (
    <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
      <div className="p-4">
        <div className="flex items-center justify-center mb-4">
          <Calendar className="h-6 w-6 text-primary-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">
            SIB 2026 — {formatSalonDatesWithNote(DEFAULT_SALON_CONFIG)}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {eventDates.map((item) => (
            <div
              key={item.date}
              className={`${item.color} text-white rounded-lg p-3 text-center`}
            >
              <div className="text-xs font-semibold uppercase mb-1 opacity-90">
                {item.day}
              </div>
              <div className="text-sm font-bold">{item.date}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-3 border border-primary-200">
          <div className="flex items-center justify-center text-sm text-gray-700">
            <Clock className="h-4 w-4 mr-2 text-primary-600" />
            <span className="font-medium">
              Horaires : {formatSalonHours(DEFAULT_SALON_CONFIG)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
