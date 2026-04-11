import { Calendar, Users, Clock, MapPin, X, Award, Download, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { AppointmentFilters } from '../../common/AppointmentFilters';
import PersonalCalendar from '../PersonalCalendar';
import { useTranslation } from '../../../hooks/useTranslation';
import { ROUTES } from '../../../lib/routes';
import { downloadICS, getGoogleCalendarLink, getOutlookCalendarLink } from '../../../utils/calendarExport';
import { handleKeyboardNavigation } from '../../../utils/accessibility';
import { toast } from 'sonner';
import type { Appointment } from '../../../types';

interface Event { id: string; title: string; startTime?: string; location?: string; date?: Date; }

interface VisitorNetworkingHubProps {
  activeTab: 'schedule' | 'appointments';
  setActiveTab: (t: 'schedule' | 'appointments') => void;
  historyTab: 'upcoming' | 'past' | 'cancelled';
  setHistoryTab: (t: 'upcoming' | 'past' | 'cancelled') => void;
  userLevel: string;
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  refusedAppointments: Appointment[];
  filteredUpcoming: Appointment[];
  filteredPast: Appointment[];
  filteredCancelled: Appointment[];
  setFilteredUpcoming: (a: Appointment[]) => void;
  setFilteredPast: (a: Appointment[]) => void;
  setFilteredCancelled: (a: Appointment[]) => void;
  confirmedCount: number;
  pendingCount: number;
  isAppointmentsLoading: boolean;
  getUpcomingEvents: () => Event[];
  isEventPast: (d: Date) => boolean;
  handleUnregisterFromEvent: (id: string) => void;
  handleAccept: (id: string) => void;
  handleReject: (id: string) => void;
  handleRequestAnother: (exhibitorId: string) => void;
  getExhibitorName: (a: { exhibitor?: { companyName?: string; name?: string }; exhibitorId?: string }) => string;
  registeredEventsCount: number;
}

export function VisitorNetworkingHub({
  activeTab, setActiveTab,
  historyTab, setHistoryTab,
  userLevel,
  upcomingAppointments, pastAppointments, refusedAppointments,
  filteredUpcoming, filteredPast, filteredCancelled,
  setFilteredUpcoming, setFilteredPast, setFilteredCancelled,
  confirmedCount, pendingCount,
  isAppointmentsLoading,
  getUpcomingEvents, isEventPast,
  handleUnregisterFromEvent, handleAccept, handleReject, handleRequestAnother,
  getExhibitorName,
  registeredEventsCount,
}: VisitorNetworkingHubProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-20">
      <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden relative border border-white/5">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-6">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em]">sib • Visitor Experience</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              {t('visitor.personal')} <span className="text-indigo-400">{t('visitor.networking_hub')}</span>
            </h2>
            <p className="text-indigo-100/60 text-lg font-medium italic">{t('visitor.networking_hub_desc')}</p>
          </div>

          <div className="flex flex-col md:flex-row bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl w-full md:w-auto">
            {(['schedule', 'appointments'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full md:w-auto justify-center px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-3 ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {tab === 'schedule' ? <Calendar className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                <span>{tab === 'schedule' ? t('visitor.my_schedule') : t('visitor.b2b_appointments')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === 'schedule' ? (
              <motion.div key="schedule-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Events list */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 text-white">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg"><Calendar className="h-5 w-5 text-indigo-400" /></div>
                      <h3 className="text-xl font-bold">{t('visitor.registrations_title')}</h3>
                    </div>
                    <Badge variant="info" className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold">{registeredEventsCount}</Badge>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {getUpcomingEvents().map((event, index) => {
                      const isPast = event.date ? isEventPast(event.date) : false;
                      return (
                        <motion.div key={event.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                          className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border border-white/5 hover:border-white/20 ${isPast ? 'bg-white/5 grayscale opacity-60' : 'bg-white/10 hover:bg-white/15'}`}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-base text-white">{event.title}</p>
                              {isPast && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-white/10 rounded-full">{t('visitor.event_past')}</span>}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-indigo-200/60">
                              <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /><span>{event.startTime}</span></div>
                              <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /><span>{event.location}</span></div>
                            </div>
                          </div>
                          {!isPast && (
                            <button onClick={() => handleUnregisterFromEvent(event.id)}
                              className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all" title={t('events.unregister')}>
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                    {getUpcomingEvents().length === 0 && (
                      <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                        <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">{t('visitor.no_registered_events')}</p>
                        <Link to={ROUTES.EVENTS} className="mt-4 inline-block text-indigo-400 font-bold hover:text-indigo-300 transition-colors">{t('visitor.browse_program')} →</Link>
                      </div>
                    )}
                  </div>
                  <div className="mt-8">
                    <Link to={ROUTES.EVENTS} className="block">
                      <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white border-none py-6 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-sm uppercase tracking-widest">
                        {t('visitor.view_full_program')}
                      </Button>
                    </Link>
                  </div>
                </div>
                {/* Calendar */}
                <div className="bg-white rounded-3xl p-1 shadow-xl overflow-hidden">
                  <PersonalCalendar compact={true} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="appointments-tab" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4 }}
                className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 text-white">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl"><Users className="h-6 w-6 text-indigo-400" /></div>
                    <div>
                      <h3 className="text-2xl font-bold">{t('visitor.b2b_management_title')}</h3>
                      <p className="text-indigo-200/60 text-sm">{t('visitor.b2b_management_subtitle')}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="border-indigo-500/30 text-indigo-300 font-bold">{confirmedCount} {t('status.confirmed')}</Badge>
                    <Badge variant="outline" className="border-amber-500/30 text-amber-300 font-bold">{pendingCount} {t('status.pending')}</Badge>
                  </div>
                </div>

                {/* History tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-2xl">
                  {(['upcoming', 'past', 'cancelled'] as const).map((tab) => {
                    const count = tab === 'upcoming' ? upcomingAppointments.length : tab === 'past' ? pastAppointments.length : refusedAppointments.length;
                    const label = tab === 'upcoming' ? t('visitor.tab_upcoming', { count }) : tab === 'past' ? t('visitor.tab_past', { count }) : t('visitor.tab_cancelled', { count });
                    return (
                      <Button key={tab} onClick={() => setHistoryTab(tab)}
                        variant={historyTab === tab ? 'default' : 'ghost'}
                        className={`flex-1 rounded-xl transition-all ${historyTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
                        {label}
                      </Button>
                    );
                  })}
                </div>

                {/* Filters */}
                <div className="mb-6">
                  {historyTab === 'upcoming' && <AppointmentFilters appointments={upcomingAppointments} onFilteredChange={setFilteredUpcoming} getDisplayName={getExhibitorName} />}
                  {historyTab === 'past' && <AppointmentFilters appointments={pastAppointments} onFilteredChange={setFilteredPast} getDisplayName={getExhibitorName} />}
                  {historyTab === 'cancelled' && <AppointmentFilters appointments={refusedAppointments} onFilteredChange={setFilteredCancelled} getDisplayName={getExhibitorName} />}
                </div>

                {userLevel === 'free' ? (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <Award className="h-16 w-16 text-indigo-400/40 mx-auto mb-6" />
                    <h4 className="text-2xl font-bold text-white mb-2">{t('visitor.premium_feature')}</h4>
                    <p className="max-w-md mx-auto text-indigo-100/60 mb-8">{t('visitor.b2b_reserved_message')}</p>
                    <Button className="bg-gradient-to-r from-SIB-gold to-yellow-600 text-white font-black px-8 py-4 rounded-xl">{t('visitor.upgrade_level')}</Button>
                  </div>
                ) : isAppointmentsLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4" />
                    <p className="text-indigo-200/40">{t('visitor.loading_appointments')}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Upcoming */}
                    {historyTab === 'upcoming' && (
                      <>
                        {filteredUpcoming.filter((a) => a.status === 'pending').length > 0 && (
                          <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-amber-400/80 mb-4 px-2">{t('visitor.new_invitations')}</h4>
                            {filteredUpcoming.filter((a) => a.status === 'pending').map((app, index) => (
                              <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                                className="group bg-white/10 hover:bg-white/15 border border-white/5 hover:border-white/20 p-6 rounded-3xl transition-all duration-300">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                                      {getExhibitorName(app).charAt(0)}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg">{getExhibitorName(app)}</span>
                                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase rounded-full border border-amber-500/20">{t('visitor.action_required')}</span>
                                      </div>
                                      <p className="text-indigo-100/60 text-sm italic">"{app.message || t('visitor.no_message')}"</p>
                                    </div>
                                  </div>
                                  <div className="flex gap-3">
                                    <Button onClick={() => handleAccept(app.id)}
                                      onKeyDown={(e) => handleKeyboardNavigation(e, { onEnter: () => handleAccept(app.id), onSpace: () => handleAccept(app.id) })}
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6"
                                      aria-label={`${t('actions.accept')} ${t('visitor.appointment_with')} ${getExhibitorName(app)}`}>
                                      {t('actions.accept')}
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleReject(app.id)}
                                      onKeyDown={(e) => handleKeyboardNavigation(e, { onEnter: () => handleReject(app.id), onSpace: () => handleReject(app.id) })}
                                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                                      aria-label={`${t('actions.reject')} ${t('visitor.appointment_with')} ${getExhibitorName(app)}`}>
                                      {t('actions.reject')}
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        <div className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400/80 mb-4 px-2">{t('visitor.confirmed_agenda')}</h4>
                          {filteredUpcoming.filter((a) => a.status === 'confirmed').length === 0 ? (
                            <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                              <p className="text-white/20">{t('visitor.no_upcoming_confirmed')}</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {filteredUpcoming.filter((a) => a.status === 'confirmed').map((app) => (
                                <motion.div key={app.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-all">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                                        {getExhibitorName(app).charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-white">{getExhibitorName(app)}</p>
                                        <p className="text-xs text-indigo-200/60">
                                          {new Date(app.startTime || (app.createdAt as any) || 0).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="p-2 bg-indigo-500/10 rounded-lg"><Award className="w-4 h-4 text-indigo-400" /></div>
                                  </div>
                                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                                    <Button size="sm" variant="outline"
                                      onClick={() => { downloadICS(app); toast.success('Fichier .ics téléchargé'); }}
                                      onKeyDown={(e) => handleKeyboardNavigation(e, { onEnter: () => { downloadICS(app); toast.success('Fichier .ics téléchargé'); }, onSpace: () => { downloadICS(app); toast.success('Fichier .ics téléchargé'); } })}
                                      className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white text-xs"
                                      title="Compatible avec Apple Calendar, Outlook, Thunderbird">
                                      <Download className="h-3 w-3 mr-1" />.ics
                                    </Button>
                                    <Button size="sm" variant="outline"
                                      onClick={() => { window.open(getGoogleCalendarLink(app), '_blank'); toast.success('Ouverture de Google Calendar'); }}
                                      className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white text-xs" title="Ouvrir dans Google Calendar">
                                      <CalendarPlus className="h-3 w-3 mr-1" />Google
                                    </Button>
                                    <Button size="sm" variant="outline"
                                      onClick={() => { window.open(getOutlookCalendarLink(app), '_blank'); toast.success("Ouverture d'Outlook"); }}
                                      className="flex-1 bg-white/5 hover:bg-white/10 border-white/10 text-white text-xs">
                                      <CalendarPlus className="h-3 w-3 mr-1" />Outlook
                                    </Button>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Past */}
                    {historyTab === 'past' && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-4 px-2">{t('visitor.past_appointments')}</h4>
                        {filteredPast.length === 0 ? (
                          <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-white/20">{t('visitor.no_past_appointments')}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPast.map((app) => (
                              <motion.div key={app.id} className="bg-white/5 border border-white/5 p-4 rounded-2xl opacity-60">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white/40 font-bold">
                                    {getExhibitorName(app).charAt(0)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-white/60">{getExhibitorName(app)}</p>
                                    <p className="text-xs text-white/40">
                                      {new Date(app.startTime || (app.createdAt as any) || 0).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Cancelled */}
                    {historyTab === 'cancelled' && (
                      <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-red-400/60 mb-4 px-2">{t('visitor.cancelled_appointments')}</h4>
                        {filteredCancelled.length === 0 ? (
                          <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <p className="text-white/20">{t('visitor.no_cancelled_appointments')}</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredCancelled.map((app) => (
                              <motion.div key={app.id} className="bg-white/5 border border-red-500/10 p-4 rounded-2xl">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 font-bold">
                                      {getExhibitorName(app).charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm text-white/60">{getExhibitorName(app)}</p>
                                      <p className="text-xs text-red-300/40">{t('visitor.appointment_cancelled')}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" onClick={() => app.exhibitorId && handleRequestAnother(app.exhibitorId)}
                                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                                    {t('visitor.retry_appointment')}
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
