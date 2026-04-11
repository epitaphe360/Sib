import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter, Globe, Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../lib/routes';
import { Card } from '../../components/ui/Card';

interface Speaker {
  id: string;
  first_name: string;
  last_name: string;
  title: string;
  company: string;
  bio: string | null;
  photo_url: string | null;
  featured: boolean;
  social_links: any;
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('last_name', { ascending: true });

      if (error) {
        if (error.code === '42P01') {
          console.warn("Table speakers not found.");
          setSpeakers([]);
        } else {
          throw error;
        }
      } else {
        setSpeakers((data || []) as Speaker[]);
      }
    } catch (err) {
      console.error(err);
      setSpeakers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = speakers.filter(s => 
    `${s.first_name} ${s.last_name} ${s.title} ${s.company}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      {/* Hero Section */}
      <div className="bg-blue-900 text-white py-16 px-4 mb-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Intervenants & Experts</h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto">
            Découvrez les leaders, ministres, et experts de renommée internationale qui partageront leur vision lors des conférences du SIB 2026.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Rechercher un intervenant, une entreprise..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link to={ROUTES.EVENTS} className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <Calendar className="mr-2 h-5 w-5" />
            Voir le programme complet
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow">Aucun intervenant trouvé.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((speaker, index) => (
              <motion.div 
                key={speaker.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full overflow-hidden hover:shadow-xl transition-shadow group flex flex-col text-center p-0 border-t-4 border-blue-600">
                  <div className="p-6 flex-grow flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-5 border-4 border-gray-50 shadow-md">
                      <img 
                        src={speaker.photo_url || 'https://via.placeholder.com/150'} 
                        alt={`${speaker.first_name} ${speaker.last_name}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{speaker.first_name} {speaker.last_name}</h3>
                    <p className="text-blue-600 font-medium text-sm mb-1">{speaker.title}</p>
                    <p className="text-gray-500 text-sm font-semibold mb-4">{speaker.company}</p>
                    
                    {speaker.bio && (
                      <p className="text-gray-600 text-sm line-clamp-3 mt-auto">{speaker.bio}</p>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex justify-center gap-4 mt-auto border-t">
                    {speaker.social_links?.linkedin && (
                      <a href={speaker.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {speaker.social_links?.twitter && (
                      <a href={speaker.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {speaker.social_links?.website && (
                      <a href={speaker.social_links.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition-colors">
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

