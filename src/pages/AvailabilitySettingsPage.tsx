import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { useTranslation } from '../hooks/useTranslation';
import useAuthStore from '@/store/authStore';
import AvailabilityManager from '@/components/availability/AvailabilityManager';
import PersonalAppointmentsCalendar from '@/components/calendar/PersonalAppointmentsCalendar';
import { useAppointmentStore } from '@/store/appointmentStore';
import { toast } from 'sonner';
import { 
  Calendar, Clock, BarChart3, 
  CheckCircle, XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

export default function AvailabilitySettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { appointments, timeSlots, fetchAppointments, fetchTimeSlots } = useAppointmentStore();

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchTimeSlots(user.id);
    }
  }, [user, fetchAppointments, fetchTimeSlots]);

  if (!user) return null;

  // Stats for Appointments
  const confirmedApps = appointments.filter(a => a.status === 'confirmed').length;
  const pendingApps = appointments.filter(a => a.status === 'pending').length;
  const completedApps = appointments.filter(a => a.status === 'completed').length;
  const cancelledApps = appointments.filter(a => a.status === 'cancelled').length;
  const totalApps = appointments.length;

  // Calculer les pourcentages réels
  const confirmedPercent = totalApps > 0 ? ((confirmedApps / totalApps) * 100).toFixed(1) : '0.0';
  const pendingPercent = totalApps > 0 ? ((pendingApps / totalApps) * 100).toFixed(1) : '0.0';
  const completedPercent = totalApps > 0 ? ((completedApps / totalApps) * 100).toFixed(1) : '0.0';

  // Données d'engagement hebdomadaire - remplacées par 0 car nécessite une table d'analytics
  // TODO: Créer une table 'weekly_analytics' pour stocker les visites et interactions par jour
  const engagementData = [
    { name: 'Lun', visits: 0, interactions: 0 },
    { name: 'Mar', visits: 0, interactions: 0 },
    { name: 'Mer', visits: 0, interactions: 0 },
    { name: 'Jeu', visits: 0, interactions: 0 },
    { name: 'Ven', visits: 0, interactions: 0 },
    { name: 'Sam', visits: 0, interactions: 0 },
    { name: 'Dim', visits: 0, interactions: 0 },
  ];

  // Utiliser les vraies données dynamiques
  const statusData = [
    { name: 'Confirmés', value: confirmedPercent, color: '#10B981' },
    { name: 'En attente', value: pendingPercent, color: '#F59E0B' },
    { name: 'Terminés', value: completedPercent, color: '#3B82F6' },
  ];

  const activityData = [
    { name: 'Vues Mini-Site', value: 0.8 },
    { name: 'Téléchargements', value: 0.4 },
    { name: 'Messages', value: 0.6 },
    { name: 'Connexions', value: 0.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gestion Calendaire Avancée</h1>
          <p className="mt-2 text-gray-600">
            Votre système complet de gestion des rendez-vous : définissez vos disponibilités publiques et suivez tous vos rendez-vous personnels
          </p>
        </div>

        {/* Content Sections - Vertical Layout */}
        <div className="space-y-12">
          
          {/* SECTION 1: Gestion des Disponibilités */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <AvailabilityManager 
              userId={user.id} 
              userType={user.type as any} 
              onAvailabilityUpdate={() => {
                fetchTimeSlots(user.id);
                toast.success("Disponibilités mises à jour");
              }}
            />
          </motion.div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200" />

          {/* SECTION 2: Mes Rendez-vous B2B */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <PersonalAppointmentsCalendar userType={user.type as any} />
          </motion.div>

          {/* Séparateur visuel */}
          <div className="border-t border-gray-200" />

          {/* SECTION 3: Analytics */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Performance & Analytics
              </h2>
              <p className="mt-1 text-gray-600">Suivez vos statistiques de rendez-vous et d'engagement</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total RDV</p>
                    <p className="text-2xl font-bold text-gray-900">{totalApps}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Confirmés</p>
                    <p className="text-2xl font-bold text-green-600">{confirmedApps}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">En attente</p>
                    <p className="text-2xl font-bold text-amber-600">{pendingApps}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </Card>
              <Card className="p-4 bg-white shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Annulés</p>
                    <p className="text-2xl font-bold text-red-600">{cancelledApps}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 bg-white shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Données en temps réel</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="visits" name="Visites" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="interactions" name="Interactions" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6 bg-white shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Statut des Rendez-vous</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                  <div className="h-64 w-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RePieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-gray-900">100%</span>
                      <span className="text-xs text-gray-500">Total</span>
                    </div>
                  </div>
                  <div className="space-y-4 w-full max-w-xs">
                    {statusData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-white shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Répartition des Activités</h3>
              <div className="space-y-6">
                {activityData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm font-medium text-gray-500">{item.value * 100}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${item.value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
