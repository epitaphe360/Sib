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

/* ═══════════════════════════════════════════════════════════════════════════
   SESSIONS DU PROGRAMME SCIENTIFIQUE
   Les sessions du programmeStore ont des heures ("09h00") et des dates en
   format français ("Mercredi 1er avril 2026"). Ces utilitaires permettent de
   convertir ces données en événements de calendrier exportables.
═══════════════════════════════════════════════════════════════════════════ */

const FRENCH_MONTHS: Record<string, number> = {
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5,
  juillet: 6, août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
};

/** Échappe les caractères spéciaux ICS (RFC 5545). */
function escapeICS(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Parse une date en français ("Mercredi 1er avril 2026") + une heure ("09h00")
 * et retourne un objet Date UTC.
 */
export function parseFrenchSessionDate(dayDateStr: string, timeStr: string): Date | null {
  try {
    const dayMatch = dayDateStr.match(/(\d+)/);
    const yearMatch = dayDateStr.match(/(\d{4})/);
    const monthMatch = dayDateStr.toLowerCase().match(
      /(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/
    );
    const timeMatch = timeStr.match(/(\d+)h(\d+)?/);

    if (!dayMatch || !yearMatch || !monthMatch || !timeMatch) { return null; }

    const day = parseInt(dayMatch[1], 10);
    const month = FRENCH_MONTHS[monthMatch[1]];
    const year = parseInt(yearMatch[1], 10);
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2] ?? '0', 10);

    // UTC+1 (Maroc) → soustrait 1h pour UTC
    return new Date(Date.UTC(year, month, day, hours - 1, minutes, 0));
  } catch {
    return null;
  }
}

/**
 * Génère un contenu ICS pour une session du programme.
 */
export function generateSessionICS(
  title: string,
  dayDateStr: string,
  timeStr: string,
  description?: string,
): string | null {
  const startDate = parseFrenchSessionDate(dayDateStr, timeStr);
  if (!startDate) { return null; }

  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000); // +1h30 par défaut
  const now = new Date();
  const uid = `session-${title.replace(/[^a-z0-9]/gi, '').toLowerCase().substring(0, 16)}-${Date.now()}@sibevent.com`;

  const esc = escapeICS;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SIB 2026//Programme//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:SIB 2026 — Programme',
    'X-WR-TIMEZONE:Africa/Casablanca',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${esc(title)}`,
    `DESCRIPTION:${esc(description ?? 'Session du programme SIB 2026')}`,
    'LOCATION:Parc des Expositions Mohammed VI, El Jadida, Maroc',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/** Télécharge un fichier .ics pour une session du programme. */
export function downloadSessionICS(
  title: string,
  dayDateStr: string,
  timeStr: string,
  description?: string,
): void {
  const ics = generateSessionICS(title, dayDateStr, timeStr, description);
  if (!ics) { return; }

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `session-sib2026-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase().substring(0, 30)}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/** Lien Google Calendar pour une session du programme. */
export function getSessionGoogleCalendarLink(
  title: string,
  dayDateStr: string,
  timeStr: string,
  description?: string,
): string | null {
  const startDate = parseFrenchSessionDate(dayDateStr, timeStr);
  if (!startDate) { return null; }

  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
    details: description ?? 'Session du programme scientifique SIB 2026',
    location: 'Parc des Expositions Mohammed VI, El Jadida, Maroc',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Lien Outlook Calendar pour une session du programme. */
export function getSessionOutlookCalendarLink(
  title: string,
  dayDateStr: string,
  timeStr: string,
  description?: string,
): string | null {
  const startDate = parseFrenchSessionDate(dayDateStr, timeStr);
  if (!startDate) { return null; }

  const endDate = new Date(startDate.getTime() + 90 * 60 * 1000);

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: title,
    startdt: startDate.toISOString(),
    enddt: endDate.toISOString(),
    body: description ?? 'Session du programme scientifique SIB 2026',
    location: 'Parc des Expositions Mohammed VI, El Jadida, Maroc',
  });

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}


