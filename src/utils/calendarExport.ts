/**
 * Calendar Export Utilities
 * Génère des fichiers .ics pour export vers Google Calendar, Outlook, etc.
 */

import { Appointment } from '@/types';

/**
 * Formate une date au format iCalendar (YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Échappe les caractères spéciaux pour iCalendar
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Génère un fichier .ics pour un rendez-vous
 */
export function generateICS(appointment: Appointment): string {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime || appointment.startTime);
  
  // Si pas d'heure de fin, ajouter 30 minutes par défaut
  if (!appointment.endTime) {
    endDate.setMinutes(endDate.getMinutes() + 30);
  }
  
  const now = new Date();
  const uid = `${appointment.id}@sibevent.com`;
  
  const exhibitorName = escapeICSText(appointment.exhibitorName || 'Exposant');
  const location = escapeICSText(
    appointment.location || 'SIB 2026, El Jadida, Maroc'
  );
  const description = escapeICSText(
    `Rendez-vous avec ${appointment.exhibitorName}\\n\\n` +
    `Type: ${appointment.type === 'in-person' ? 'En présentiel' : 
             appointment.type === 'virtual' ? 'Virtuel' : 'Hybride'}\\n` +
    `${appointment.notes ? `Notes: ${appointment.notes}` : ''}`
  );
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SIB 2026//Appointment//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SIB 2026',
    'X-WR-TIMEZONE:Africa/Casablanca',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:RDV ${exhibitorName}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  
  return icsContent;
}

/**
 * Télécharge un fichier .ics
 */
export function downloadICS(appointment: Appointment): void {
  const icsContent = generateICS(appointment);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `rdv-${appointment.exhibitorName?.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Libérer la mémoire
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Génère un lien Google Calendar
 */
export function getGoogleCalendarLink(appointment: Appointment): string {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime || appointment.startTime);
  
  if (!appointment.endTime) {
    endDate.setMinutes(endDate.getMinutes() + 30);
  }
  
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `RDV ${appointment.exhibitorName}`,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
    details: `Rendez-vous avec ${appointment.exhibitorName}\n\nType: ${
      appointment.type === 'in-person' ? 'En présentiel' : 
      appointment.type === 'virtual' ? 'Virtuel' : 'Hybride'
    }${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ''}`,
    location: appointment.location || 'SIB 2026, El Jadida, Maroc',
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Génère un lien Outlook Calendar
 */
export function getOutlookCalendarLink(appointment: Appointment): string {
  const startDate = new Date(appointment.startTime);
  const endDate = new Date(appointment.endTime || appointment.startTime);
  
  if (!appointment.endTime) {
    endDate.setMinutes(endDate.getMinutes() + 30);
  }
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: `RDV ${appointment.exhibitorName}`,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: `Rendez-vous avec ${appointment.exhibitorName}\n\nType: ${
      appointment.type === 'in-person' ? 'En présentiel' : 
      appointment.type === 'virtual' ? 'Virtuel' : 'Hybride'
    }${appointment.notes ? `\n\nNotes: ${appointment.notes}` : ''}`,
    location: appointment.location || 'SIB 2026, El Jadida, Maroc',
  });
  
  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}
