import React, { useState, useEffect } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import {
  ArrowLeft,
  Users,
  Building2,
  Crown,
  Eye,
  Search,
  Filter,
  Trash2,
  UserCheck,
  UserX,
  MapPin,
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Download
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { CONFIG, getUserActionMessage } from '../lib/config';
import { ROUTES } from '../lib/routes';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'exhibitor' | 'partner' | 'visitor' | 'admin';
  company: string;
  country: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  registrationDate: Date;
  lastActivity: Date;
  verified: boolean;
}

export default function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [newUserForm, setNewUserForm] = useState({
    name: '', email: '', password: '',
    type: 'visitor' as 'exhibitor' | 'partner' | 'visitor' | 'admin',
    company: '', country: ''
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const data = await SupabaseService.getUsers();
        if (!data || data.length === 0) {
          console.warn('Aucun utilisateur retourné par Supabase. Vérifiez les politiques RLS.');
        }
        const transformedUsers: User[] = data.map(u => ({
          id: u.id,
          name: u.name || u.email || 'Utilisateur sans nom',
          email: u.email,
          type: u.type as any,
          company: u.profile?.company || 'N/A',
          country: u.profile?.country || 'N/A',
          status: u.status as any || 'active',
          registrationDate: u.createdAt ? new Date(u.createdAt) : new Date(),
          lastActivity: u.updatedAt ? new Date(u.updatedAt) : new Date(),
          verified: u.status === 'active'
        }));
        setUsers(transformedUsers);
        setFilteredUsers(transformedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handler pour l'export CSV
  const handleExport = () => {
    // Export CSV simple (mock)
    const csv = [
      ['Nom', 'Email', 'Type', 'Entreprise', 'Pays', 'Statut'],
      ...filteredUsers.map(u => [u.name, u.email, u.type, u.company, u.country, u.status])
    ].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'utilisateurs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handler pour ouvrir le modal de création
  const handleCreateUser = () => {
    setNewUserForm({ name: '', email: '', password: '', type: 'visitor', company: '', country: '' });
    setShowCreateModal(true);
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.name || !newUserForm.password) {
      toast.error('Nom, email et mot de passe sont requis');
      return;
    }
    setIsCreating(true);
    try {
      const created = await SupabaseService.createUser({
        name: newUserForm.name,
        email: newUserForm.email,
        type: newUserForm.type,
        company: newUserForm.company,
        country: newUserForm.country,
        status: 'active',
        verified: false,
      });
      setUsers(prev => [...prev, {
        id: created.id,
        name: created.name || newUserForm.name,
        email: created.email || newUserForm.email,
        type: newUserForm.type,
        company: newUserForm.company,
        country: newUserForm.country,
        status: 'active',
        registrationDate: new Date(),
        lastActivity: new Date(),
        verified: false,
      }]);
      toast.success(`Utilisateur "${newUserForm.name}" créé avec succès`);
      setShowCreateModal(false);
    } catch (err) {
      console.error('Erreur création utilisateur:', err);
      toast.error('Erreur lors de la création de l\'utilisateur');
    } finally {
      setIsCreating(false);
    }
  };

  // Handler pour voir le détail utilisateur
  const handleViewUser = (user: User) => {
    setViewUser(user);
  };
  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !selectedType || user.type === selectedType;
      const matchesStatus = !selectedStatus || user.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedType, selectedStatus]);

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'exhibitor': return Building2;
      case 'partner': return Crown;
      case 'visitor': return Users;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'exhibitor': return 'Exposant';
      case 'partner': return 'Partenaire';
      case 'visitor': return 'Visiteur';
      case 'admin': return 'Administrateur';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'exhibitor': return 'bg-blue-100 text-blue-800';
      case 'partner': return 'bg-purple-100 text-purple-800';
      case 'visitor': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const handleUserAction = async (userId: string, action: keyof typeof CONFIG.userActions) => {
    setIsLoading(true);
    try {
      if (action === CONFIG.userActions.delete) {
        await SupabaseService.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success(getUserActionMessage('deleted'));
      } else {
        const newStatus = action === CONFIG.userActions.activate ? 'active' : 'suspended';
        await SupabaseService.updateUser(userId, { status: newStatus });
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        toast.success(getUserActionMessage(action === CONFIG.userActions.activate ? 'activated' : 'suspended'));
      }
      setIsLoading(false);
    } catch {
      setIsLoading(false);
      toast.error('Erreur lors de l\'action');
    }
  };

  const handleBulkAction = async (action: keyof typeof CONFIG.userActions) => {
    if (selectedUsers.length === 0) {
      toast.error('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    const confirmMessage = `Êtes-vous sûr de vouloir ${
      action === CONFIG.userActions.activate ? 'activer' :
      action === CONFIG.userActions.suspend ? 'suspendre' : 'supprimer'
    } ${selectedUsers.length} utilisateur(s) ?`;

    if (window.confirm(confirmMessage)) {
      setIsLoading(true);
      try {
        if (action === CONFIG.userActions.delete) {
          await Promise.all(selectedUsers.map(id => SupabaseService.deleteUser(id)));
          setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
        } else {
          const newStatus = action === CONFIG.userActions.activate ? 'active' : 'suspended';
          await Promise.all(selectedUsers.map(id => SupabaseService.updateUser(id, { status: newStatus })));
          setUsers(prev => prev.map(u => selectedUsers.includes(u.id) ? { ...u, status: newStatus } : u));
        }
        setSelectedUsers([]);
        setIsLoading(false);
        toast.success(getUserActionMessage(`${action === CONFIG.userActions.activate ? 'bulkActivated' : action === CONFIG.userActions.suspend ? 'bulkSuspended' : 'bulkDeleted'}` as keyof typeof CONFIG.messages.user));
      } catch {
        setIsLoading(false);
        toast.error('Erreur lors de l\'action groupée');
      }
    }
  };

  const formatDate = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date as unknown as string);
    if (isNaN(d.getTime())) {return '—';}
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  };

  const getLastActivityText = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date as unknown as string);
    if (isNaN(d.getTime())) {return '—';}
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {return 'À l\'instant';}
    if (diffHours < 24) {return `Il y a ${diffHours}h`;}
    if (diffDays < 7) {return `Il y a ${diffDays}j`;}
    return formatDate(d);
  };

  const userStats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    exhibitors: users.filter(u => u.type === 'exhibitor').length,
    partners: users.filter(u => u.type === 'partner').length,
    visitors: users.filter(u => u.type === 'visitor').length,
    admins: users.filter(u => u.type === 'admin').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au Tableau de Bord Admin
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gestion des Utilisateurs
                </h1>
                <p className="text-gray-600">
                  Administrez les comptes utilisateurs de la plateforme SIB
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800 font-medium">Gestion Utilisateurs</span>
                <Badge variant="info" size="sm">{userStats.total} utilisateurs</Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistiques Utilisateurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.total}
            </div>
            <div className="text-sm text-gray-600">Total Utilisateurs</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.active}
            </div>
            <div className="text-sm text-gray-600">Comptes Actifs</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-yellow-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.pending}
            </div>
            <div className="text-sm text-gray-600">En Attente</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-red-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.suspended}
            </div>
            <div className="text-sm text-gray-600">Suspendus</div>
          </Card>
        </div>

        {/* Répartition par Type */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center p-6">
            <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.exhibitors}
            </div>
            <div className="text-sm text-gray-600">Exposants</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.partners}
            </div>
            <div className="text-sm text-gray-600">Partenaires</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.visitors}
            </div>
            <div className="text-sm text-gray-600">Visiteurs</div>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-red-100 p-3 rounded-lg w-12 h-12 mx-auto mb-3">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {userStats.admins}
            </div>
            <div className="text-sm text-gray-600">Administrateurs</div>
          </Card>
        </div>

        {/* Filtres et Actions */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                </Button>

                <Button variant="outline" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>

                <Button variant="default" onClick={handleCreateUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Utilisateur
                </Button>
              </div>
            </div>

            {/* Filtres Avancés */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'utilisateur
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les types</option>
                      <option value="exhibitor">Exposants</option>
                      <option value="partner">Partenaires</option>
                      <option value="visitor">Visiteurs</option>
                      <option value="admin">Administrateurs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Tous les statuts</option>
                      <option value="active">Actifs</option>
                      <option value="pending">En attente</option>
                      <option value="suspended">Suspendus</option>
                      <option value="rejected">Rejetés</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedType('');
                        setSelectedStatus('');
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Actions Groupées */}
            {selectedUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} utilisateur(s) sélectionné(s)
                  </span>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="default"
                      disabled={isLoading}
                      onClick={() => handleBulkAction(CONFIG.userActions.activate)}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleBulkAction(CONFIG.userActions.suspend)}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Suspendre
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isLoading}
                      onClick={() => handleBulkAction(CONFIG.userActions.delete)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Liste des Utilisateurs */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière Activité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => {
                  const UserIcon = getUserTypeIcon(user.type);

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id]);
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{user.name}</span>
                              {user.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.company}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(user.type)}`}>
                          <UserIcon className="h-3 w-3 mr-1" />
                          {getUserTypeLabel(user.type)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={getStatusColor(user.status)}
                          size="sm"
                        >
                          {getStatusLabel(user.status)}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(user.registrationDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{user.country}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getLastActivityText(user.lastActivity)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewUser(user)}>
                            <Eye className="h-3 w-3 mr-1" />
                            Voir
                          </Button>

                          {user.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUserAction(user.id, CONFIG.userActions.activate)}
                              disabled={isLoading}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Activer
                            </Button>
                          )}

                          {user.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(user.id, CONFIG.userActions.suspend)}
                              disabled={isLoading}
                            >
                              <UserX className="h-3 w-3 mr-1" />
                              Suspendre
                            </Button>
                          )}

                          {user.status === 'suspended' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleUserAction(user.id, CONFIG.userActions.activate)}
                              disabled={isLoading}
                            >
                              <UserCheck className="h-3 w-3 mr-1" />
                              Réactiver
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isLoading}
                            onClick={() => handleUserAction(user.id, CONFIG.userActions.delete)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Si vous êtes administrateur et que vous ne voyez aucun utilisateur, il est possible que les politiques de sécurité (RLS) de la base de données restreignent l'accès.
              </p>
            </div>
          )}
        </Card>
      </div>
      {/* Modal Création Utilisateur */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-6">Créer un nouvel utilisateur</h2>
            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                  <input type="text" required value={newUserForm.name}
                    onChange={e => setNewUserForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean Dupont" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input type="text" value={newUserForm.company}
                    onChange={e => setNewUserForm(p => ({ ...p, company: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ma Société" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={newUserForm.email}
                  onChange={e => setNewUserForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean@exemple.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe temporaire *</label>
                <input type="password" required minLength={8} value={newUserForm.password}
                  onChange={e => setNewUserForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 caractères" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={newUserForm.type}
                    onChange={e => setNewUserForm(p => ({ ...p, type: e.target.value as typeof newUserForm.type }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="visitor">Visiteur</option>
                    <option value="exhibitor">Exposant</option>
                    <option value="partner">Partenaire</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
                  <input type="text" value={newUserForm.country}
                    onChange={e => setNewUserForm(p => ({ ...p, country: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="France" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} disabled={isCreating}>
                  Annuler
                </Button>
                <Button type="submit" variant="default" disabled={isCreating}>
                  {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Voir Utilisateur (mock) */}
      {viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Détail utilisateur</h2>
            <div className="mb-2"><b>Nom :</b> {viewUser.name}</div>
            <div className="mb-2"><b>Email :</b> {viewUser.email}</div>
            <div className="mb-2"><b>Type :</b> {getUserTypeLabel(viewUser.type)}</div>
            <div className="mb-2"><b>Entreprise :</b> {viewUser.company}</div>
            <div className="mb-2"><b>Pays :</b> {viewUser.country}</div>
            <div className="mb-2"><b>Statut :</b> {getStatusLabel(viewUser.status)}</div>
            <Button variant="default" onClick={() => setViewUser(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
};

