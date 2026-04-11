import { useState, useEffect } from 'react';
import { useExhibitorStore } from '../../store/exhibitorStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle, XCircle, Clock, Eye, Building, Loader2 } from 'lucide-react';
import { Exhibitor } from '@/types';

// This local interface can be removed if the store provides the correct shape
interface ExhibitorApplication {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  description: string;
  website?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  documents?: string[];
}

export default function ExhibitorValidation() {
  const { 
    exhibitors, 
    isLoading, 
    isUpdating,
    error,
    fetchExhibitors, 
    updateExhibitorStatus 
  } = useExhibitorStore();
  
  const [selectedApplication, setSelectedApplication] = useState<ExhibitorApplication | null>(null);

  useEffect(() => {
    fetchExhibitors();
  }, [fetchExhibitors]);

  // Map the exhibitor data from the store to the shape the component expects
  const applications: ExhibitorApplication[] = exhibitors.map((ex: Exhibitor) => ({
    id: ex.id,
    company_name: ex.companyName,
    contact_name: `${ex.contactInfo?.email}`, // Placeholder, adapt as needed
    email: ex.contactInfo?.email || '',
    phone: ex.contactInfo?.phone || '',
    description: ex.description,
    website: ex.website,
    status: ex.verified ? 'approved' : 'pending',
    created_at: ex.establishedYear ? new Date(ex.establishedYear, 0, 1).toISOString() : new Date().toISOString(),
    documents: ex.certifications || []
  }));

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    await updateExhibitorStatus(applicationId, newStatus);
    if (selectedApplication?.id === applicationId) {
      setSelectedApplication(null);
    }
  };

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="error" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="default" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>;
    }
  };

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Exhibitor Validation</h2>
        <div className="text-sm text-gray-500">
          {applications.filter(app => app.status === 'pending').length} pending applications
        </div>
      </div>
      
      {error && <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg">{error}</div>}

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.company_name}
                  </h3>
                  {getStatusBadge(application.status)}
                </div>

                {/* ... other details ... */}

                <div className="text-xs text-gray-500 mt-4">
                  Applied: {new Date(application.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplication(application)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Review
                </Button>
                
                {application.status === 'pending' && (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'approved')}
                      disabled={isUpdating === application.id}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                    >
                      {isUpdating === application.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleStatusUpdate(application.id, 'rejected')}
                      disabled={isUpdating === application.id}
                      className="flex items-center gap-1"
                    >
                      {isUpdating === application.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}

        {!isLoading && applications.length === 0 && (
          <Card className="p-8 text-center">
            <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications</h3>
            <p className="text-gray-500">No exhibitor applications to review at this time.</p>
          </Card>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Application Details
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
              </div>

              {/* ... modal content ... */}
              
                {selectedApplication.status === 'pending' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="default"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'approved')}
                      disabled={isUpdating === selectedApplication.id}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {isUpdating === selectedApplication.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve Application
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'rejected')}
                      disabled={isUpdating === selectedApplication.id}
                      className="flex items-center gap-2"
                    >
                      {isUpdating === selectedApplication.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject Application
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
      )}
    </div>
  );
};