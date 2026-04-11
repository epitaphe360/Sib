import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../lib/routes';
import {
  ArrowLeft,
  HeadphonesIcon,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
  BookOpen,
  Zap
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const PartnerSupportPage: React.FC = () => {
  const { t } = useTranslation();
  const supportData = {
    overview: {
      activeTickets: 3,
      resolvedThisMonth: 24,
      averageResponseTime: '2h 15m',
      satisfactionRate: 4.8
    },
    recentTickets: [
      {
        id: 'T-2024-001',
        title: t('partSupport.ticket1Title'),
        status: t('partSupport.statusInProgress'),
        priority: 'high',
        category: t('partSupport.ticket1Category'),
        createdAt: '2024-01-15 09:30',
        lastUpdate: '2024-01-15 11:45',
        assignedTo: 'Marie Dupont',
        description: t('partSupport.ticket1Desc')
      },
      {
        id: 'T-2024-002',
        title: t('partSupport.ticket2Title'),
        status: t('partSupport.statusResolved'),
        priority: 'medium',
        category: t('partSupport.ticket2Category'),
        createdAt: '2024-01-12 14:20',
        lastUpdate: '2024-01-14 16:30',
        assignedTo: 'Pierre Martin',
        description: t('partSupport.ticket2Desc')
      },
      {
        id: 'T-2024-003',
        title: t('partSupport.ticket3Title'),
        status: t('partSupport.statusPending'),
        priority: 'low',
        category: t('partSupport.ticket3Category'),
        createdAt: '2024-01-10 08:15',
        lastUpdate: '2024-01-10 08:15',
        assignedTo: 'Sophie Bernard',
        description: t('partSupport.ticket3Desc')
      }
    ],
    supportCategories: [
      {
        name: t('partSupport.technicalSupport'),
        icon: <Zap className="h-6 w-6" />,
        description: t('partSupport.technicalSupportDesc'),
        tickets: 12,
        avgResolution: '4h 30m'
      },
      {
        name: t('partSupport.trainingOnboarding'),
        icon: <BookOpen className="h-6 w-6" />,
        description: t('partSupport.trainingOnboardingDesc'),
        tickets: 8,
        avgResolution: '1j 2h'
      },
      {
        name: t('partSupport.commercial'),
        icon: <User className="h-6 w-6" />,
        description: t('partSupport.commercialDesc'),
        tickets: 6,
        avgResolution: '6h 45m'
      },
      {
        name: t('partSupport.administrative'),
        icon: <FileText className="h-6 w-6" />,
        description: t('partSupport.administrativeDesc'),
        tickets: 4,
        avgResolution: '2h 15m'
      }
    ],
    quickActions: [
      {
        title: t('partSupport.createTicket'),
        description: t('partSupport.createTicketDesc'),
        icon: <MessageSquare className="h-5 w-5" />,
        action: 'new-ticket'
      },
      {
        title: t('partSupport.contactSupport'),
        description: t('partSupport.contactSupportDesc'),
        icon: <Phone className="h-5 w-5" />,
        action: 'call-support'
      },
      {
        title: t('partSupport.knowledgeBase'),
        description: t('partSupport.knowledgeBaseDesc'),
        icon: <BookOpen className="h-5 w-5" />,
        action: 'knowledge-base'
      },
      {
        title: t('partSupport.scheduleTraining'),
        description: t('partSupport.scheduleTrainingDesc'),
        icon: <Calendar className="h-5 w-5" />,
        action: 'schedule-training'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    const inProgress = t('partSupport.statusInProgress');
    const resolved = t('partSupport.statusResolved');
    const pending = t('partSupport.statusPending');
    const closed = t('partSupport.statusClosed');
    if (status === inProgress) return 'text-blue-600 bg-blue-50';
    if (status === resolved) return 'text-green-600 bg-green-50';
    if (status === pending) return 'text-yellow-600 bg-yellow-50';
    if (status === closed) return 'text-gray-600 bg-gray-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return t('partSupport.priorityHigh');
      case 'medium': return t('partSupport.priorityMedium');
      case 'low': return t('partSupport.priorityLow');
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTES.PARTNER_DASHBOARD} className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('partSupport.backToDashboard')}
          </Link>

          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-lg">
              <HeadphonesIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('partSupport.pageTitle')}
              </h1>
              <p className="text-gray-600">
                {t('partSupport.pageSubtitle')}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800 font-medium">{t('partSupport.premiumSupport')}</span>
              <Badge className="bg-blue-100 text-blue-800" size="sm">
                {t('partSupport.responseTime')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{supportData.overview.activeTickets}</p>
                  <p className="text-sm text-gray-600">{t('partSupport.activeTickets')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{supportData.overview.resolvedThisMonth}</p>
                  <p className="text-sm text-gray-600">{t('partSupport.resolvedThisMonth')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{supportData.overview.averageResponseTime}</p>
                  <p className="text-sm text-gray-600">{t('partSupport.avgResponseTime')}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <User className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{supportData.overview.satisfactionRate}/5</p>
                  <p className="text-sm text-gray-600">{t('partSupport.clientSatisfaction')}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partSupport.quickActions')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportData.quickActions.map((action) => (
                <button
                  key={action.title}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="text-blue-600">{action.icon}</div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Tickets */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partSupport.recentTickets')}</h3>
            <div className="space-y-4">
              {supportData.recentTickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
                      <p className="text-sm text-gray-600">{t('partSupport.ticket')} #{ticket.id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3">{ticket.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.category')}</span>
                      <div className="font-medium">{ticket.category}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.createdAt')}</span>
                      <div className="font-medium">{ticket.createdAt}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.lastUpdate')}</span>
                      <div className="font-medium">{ticket.lastUpdate}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.assignedTo')}</span>
                      <div className="font-medium">{ticket.assignedTo}</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100">
                      <MessageSquare className="h-3 w-3" />
                      <span>{t('partSupport.reply')}</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-green-50 text-green-600 rounded text-sm hover:bg-green-100">
                      <CheckCircle className="h-3 w-3" />
                      <span>{t('partSupport.markResolved')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Support Categories */}
        <Card className="mb-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('partSupport.supportCategories')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {supportData.supportCategories.map((category, index) => (
                <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      index === 0 ? 'bg-yellow-100 text-yellow-600' :
                      index === 1 ? 'bg-blue-100 text-blue-600' :
                      index === 2 ? 'bg-green-100 text-green-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {category.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.name}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.activeTicketsLabel')}</span>
                      <div className="font-medium">{category.tickets}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm">{t('partSupport.avgResolution')}</span>
                      <div className="font-medium">{category.avgResolution}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('partSupport.contactSupportTitle')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-900 mb-1">{t('partSupport.phoneSupport')}</h4>
                  <p className="text-sm text-blue-700 mb-2">{t('partSupport.phoneAvailability')}</p>
                  <p className="text-blue-600 font-medium">01 23 45 67 89</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-900 mb-1">{t('partSupport.emailSupport')}</h4>
                  <p className="text-sm text-blue-700 mb-2">{t('partSupport.emailResponseTime')}</p>
                  <p className="text-blue-600 font-medium">support@sipors.fr</p>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-900 mb-1">{t('partSupport.liveChat')}</h4>
                  <p className="text-sm text-blue-700 mb-2">{t('partSupport.liveChatAvailability')}</p>
                  <p className="text-blue-600 font-medium">{t('partSupport.liveChatLocation')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PartnerSupportPage;
