import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ExhibitorCreationSimulator from '../../components/admin/ExhibitorCreationSimulator';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ROUTES } from '../../lib/routes';

export default function ExhibitorCreationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [exhibitorData, setExhibitorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const editId = searchParams.get('edit');

  useEffect(() => {
    if (editId) {
      loadExhibitor(editId);
    }
  }, [editId]);

  const loadExhibitor = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase!
        .from('exhibitors')
        .select('id, user_id, company_name, category, sector, description, logo_url, website, verified, featured, is_published, stand_number, contact_info, created_at, updated_at')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Erreur chargement exposant:', error);
        toast.error('Impossible de charger l\'exposant');
        navigate(ROUTES.ADMIN_EXHIBITORS);
        return;
      }

      if (!data) {
        toast.error('Exposant non trouvé');
        navigate(ROUTES.ADMIN_EXHIBITORS);
        return;
      }

      // Normaliser le format pour ExhibitorCreationSimulator
      setExhibitorData({
        id: data.id,
        userId: data.user_id,
        companyName: data.company_name,
        category: data.category,
        sector: data.sector,
        description: data.description,
        logo: data.logo_url,
        website: data.website,
        verified: data.verified,
        featured: data.featured,
        isPublished: data.is_published ?? false,
        standNumber: data.stand_number,
        contactInfo: data.contact_info || {},
      });
    } catch (error) {
      console.error('Erreur chargement exposant:', error);
      toast.error('Impossible de charger l\'exposant');
      navigate(ROUTES.ADMIN_EXHIBITORS);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to={ROUTES.ADMIN_DASHBOARD} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au Tableau de Bord
        </Link>
      </div>
      <ExhibitorCreationSimulator
        exhibitorToEdit={exhibitorData}
        editMode={!!editId}
      />
    </>
  );
}

