import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Download, CalendarPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { AppointmentFilters } from '../../common/AppointmentFilters';
import { useTranslation } from '../../../hooks/useTranslation';
import { getVisitorDisplayName } from '../../../utils/visitorHelpers';
import { downloadICS, getGoogleCalendarLink, getOutlookCalendarLink } from '../../../utils/calendarExport';
import { handleKeyboardNavigation } from '../../../utils/accessibility';
import { toast } from 'sonner';
import type { Appointment } from '../../../types';

interface ExhibitorAppointmentSectionProps {
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  cancelledAppointments: Appointment[];
  isAppointmentsLoading: boolean;
  processingAppointment: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function ExhibitorAppointmentSection({
  upcomingAppointments,
  pastAppointments,
  cancelledAppointments,
  isAppointmentsLoading,
  processingAppointment,
  onAccept,
  onReject,
}: ExhibitorAppointmentSectionProps) {
  const { t } = useTranslation();
  const [historyTab, setHistoryTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [filteredUpcoming, setFilteredUpcoming] = useState(upcomingAppointments);
  const [filteredPast, setFilteredPast] = useState(pastAppointments);
  const [filteredCancelled, setFilteredCancelled] = useState(cancelledAppointments);

  useEffect(() => {
    setFilteredUpcoming(upcomingAppointments);
  }, [upcomingAppointments.length]);

  useEffect(() => {
    setFilteredPast(pastAppointments);
  }, [pastAppointments.length]);

  useEffect(() => {
    setFilteredCancelled(cancelledAppointments);
  }, [cancelledAppointments.length]);

  const tabBtnClass = (active: boolean) =>
    `transition-all px-3 py-1.5 rounded-lg text-sm font-semibold ${
      active
        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`;

  return (
    <div id="appointments-section">
      <Card className="SIB-glass-card overflow-hidden mb-8">
        <div className="p-6 bg-gradient-to-br from-white via-purple-50/20 to-pink-50/20">
          {/* Section header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{t('exhibitor.appointments_received')}</h3>
                <p className="text-xs text-gray-500">{t('exhibitor.appointments_received_subtitle')}</p>
              </div>
            </div>

            {/* History tabs */}
            <div className="flex gap-2 bg-white/80 p-1 rounded-xl shadow-sm">
              <button className={tabBtnClass(historyTab === 'upcoming')} onClick={() => setHistoryTab('upcoming')}>
                {t('exhibitor.appointments_upcoming')} ({upcomingAppointments.length})
              </button>
              <button className={tabBtnClass(historyTab === 'past')} onClick={() => setHistoryTab('past')}>
                {t('exhibitor.appointments_past')} ({pastAppointments.length})
              </button>
              <button className={tabBtnClass(historyTab === 'cancelled')} onClick={() => setHistoryTab('cancelled')}>
                {t('exhibitor.appointments_cancelled')} ({cancelledAppointments.length})
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            {historyTab === 'upcoming' && (
              <AppointmentFilters
                appointments={upcomingAppointments}
                onFilteredChange={setFilteredUpcoming}
                getDisplayName={getVisitorDisplayName}
              />
            )}
            {historyTab === 'past' && (
              <AppointmentFilters
                appointments={pastAppointments}
                onFilteredChange={setFilteredPast}
                getDisplayName={getVisitorDisplayName}
              />
            )}
            {historyTab === 'cancelled' && (
              <AppointmentFilters
                appointments={cancelledAppointments}
                onFilteredChange={setFilteredCancelled}
                getDisplayName={getVisitorDisplayName}
              />
            )}
          </div>

          {isAppointmentsLoading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                <span className="text-gray-600 font-medium">{t('exhibitor.appointments_loading')}</span>
              </div>
            </div>
          ) : (
            <>
              {/* ── À venir ── */}
              {historyTab === 'upcoming' && (
                <>
                  {filteredUpcoming.filter((a) => a.status === 'pending').length === 0 &&
                  filteredUpcoming.filter((a) => a.status === 'confirmed').length === 0 ? (
                    <EmptyState icon={Calendar} title={t('exhibitor.appointments_no_pending')} hint={t('exhibitor.appointments_no_pending_hint')} />
                  ) : (
                    <>
                      {/* Pending */}
                      <div className="space-y-3 mb-6">
                        {filteredUpcoming
                          .filter((a) => a.status === 'pending')
                          .map((app: any, index) => (
                            <PendingCard
                              key={app.id}
                              app={app}
                              index={index}
                              processingId={processingAppointment}
                              onAccept={onAccept}
                              onReject={onReject}
                              t={t}
                            />
                          ))}
                      </div>

                      {/* Confirmed upcoming */}
                      {filteredUpcoming.filter((a) => a.status === 'confirmed').length > 0 && (
                        <>
                          <SectionDivider label={t('exhibitor.appointments_confirmed_upcoming')} />
                          <div className="space-y-3">
                            {filteredUpcoming
                              .filter((a) => a.status === 'confirmed')
                              .map((app: any, index) => (
                                <ConfirmedCard key={app.id} app={app} index={index} t={t} />
                              ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </>
              )}

              {/* ── Passés ── */}
              {historyTab === 'past' && (
                <div className="space-y-3">
                  {filteredPast.length === 0 ? (
                    <EmptyState icon={Clock} title={t('exhibitor.appointments_no_past')} hint={t('exhibitor.appointments_no_past_hint')} />
                  ) : (
                    filteredPast.map((app: any) => (
                      <PastCard key={app.id} app={app} t={t} />
                    ))
                  )}
                </div>
              )}

              {/* ── Annulés ── */}
              {historyTab === 'cancelled' && (
                <div className="space-y-3">
                  {filteredCancelled.length === 0 ? (
                    <EmptyState icon={Calendar} title={t('exhibitor.appointments_no_cancelled')} hint={t('exhibitor.appointments_no_cancelled_hint')} />
                  ) : (
                    filteredCancelled.map((app: any) => (
                      <CancelledCard key={app.id} app={app} t={t} />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Sub-cards ────────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint: string }) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-gray-500 font-medium">{title}</p>
      <p className="text-xs text-gray-400 mt-1">{hint}</p>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center space-x-2 mb-4 mt-8">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{label}</h4>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
    </div>
  );
}

function PendingCard({
  app,
  index,
  processingId,
  onAccept,
  onReject,
  t,
}: {
  app: any;
  index: number;
  processingId: string | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      key={app.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-purple-100 hover:border-purple-300"
    >
      <div className="absolute top-2 right-2">
        <Badge variant="warning" className="text-xs font-bold animate-pulse">{t('exhibitor.appointments_badge_new')}</Badge>
      </div>
      <div className="flex items-start space-x-4 mb-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {getVisitorDisplayName(app).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
            {t('exhibitor.appointments_request_from')} {getVisitorDisplayName(app)}
          </div>
          <div className="text-sm text-gray-600 leading-relaxed break-words">
            {app.message || t('exhibitor.appointments_no_message')}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
          onClick={() => onAccept(app.id)}
          onKeyDown={(e) => handleKeyboardNavigation(e, { onEnter: () => onAccept(app.id), onSpace: () => onAccept(app.id) })}
          disabled={processingId === app.id}
          aria-label={`Accepter la demande de ${getVisitorDisplayName(app)}`}
        >
          {processingId === app.id ? t('exhibitor.appointments_confirming') : t('exhibitor.appointments_accept')}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          className="flex-1 font-bold"
          onClick={() => onReject(app.id)}
          onKeyDown={(e) => handleKeyboardNavigation(e, { onEnter: () => onReject(app.id), onSpace: () => onReject(app.id) })}
          disabled={processingId === app.id}
          aria-label={`Refuser la demande de ${getVisitorDisplayName(app)}`}
        >
          {processingId === app.id ? t('exhibitor.appointments_rejecting') : t('exhibitor.appointments_reject')}
        </Button>
      </div>
    </motion.div>
  );
}

function ConfirmedCard({ app, index, t }: { app: any; index: number; t: (key: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-100 hover:border-green-300"
    >
      <div className="flex items-start space-x-4 mb-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {getVisitorDisplayName(app).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
              {t('exhibitor.appointments_with')} {getVisitorDisplayName(app)}
            </div>
            <Badge variant="success" className="font-bold">{t('exhibitor.appointments_badge_confirmed')}</Badge>
          </div>
          <div className="text-xs text-gray-500 mb-1">
            {new Date(app.startTime).toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
            })}
          </div>
          <div className="text-sm text-gray-600 break-words">{app.message || t('exhibitor.appointments_no_message')}</div>
        </div>
      </div>
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        {[
          { label: '.ics', icon: Download, action: () => { downloadICS(app); toast.success('Fichier .ics téléchargé'); } },
          { label: 'Google', icon: CalendarPlus, action: () => { window.open(getGoogleCalendarLink(app), '_blank'); } },
          { label: 'Outlook', icon: CalendarPlus, action: () => { window.open(getOutlookCalendarLink(app), '_blank'); } },
        ].map(({ label, icon: Icon, action }) => (
          <Button key={label} size="sm" variant="outline" className="flex-1 text-xs" onClick={action}>
            <Icon className="h-3 w-3 mr-1" />
            {label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}

function PastCard({ app, t }: { app: any; t: (key: string) => string }) {
  return (
    <motion.div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-200 opacity-70">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">
          {getVisitorDisplayName(app).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-700">{t('exhibitor.appointments_with')} {getVisitorDisplayName(app)}</div>
          <div className="text-xs text-gray-500">
            {new Date(app.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">{t('exhibitor.appointments_badge_completed')}</Badge>
      </div>
    </motion.div>
  );
}

function CancelledCard({ app, t }: { app: any; t: (key: string) => string }) {
  return (
    <motion.div className="bg-white rounded-xl p-4 shadow-md border-2 border-red-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
          {getVisitorDisplayName(app).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="font-bold text-gray-700">{t('exhibitor.appointments_with')} {getVisitorDisplayName(app)}</div>
          <div className="text-xs text-gray-500">
            {new Date(app.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <Badge variant="error" className="text-xs">{t('exhibitor.appointments_badge_cancelled')}</Badge>
      </div>
    </motion.div>
  );
}
