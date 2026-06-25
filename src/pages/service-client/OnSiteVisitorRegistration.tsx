/**
 * Inscription visiteur sur place — sans mot de passe (lien magique sur l'app mobile).
 */
import { useState } from 'react';
import { CheckCircle, Loader, Mail, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { onSiteRegistration } from '../../services/serviceClientService';

const SECTORS = [
  'BTP & Construction',
  'Architecture & Design',
  'Matériaux & Équipements',
  'Immobilier & Promotion',
  'Consulting & Ingénierie',
  'Institutionnel',
  'Étudiant',
  'Média/Presse',
  'Autre',
];

export default function OnSiteVisitorRegistration() {
  const { user } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('MA');
  const [sector, setSector] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ badgeCode: string; magicLinkSent: boolean; name: string } | null>(null);

  const reset = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCountry('MA');
    setSector('');
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Session expirée — reconnectez-vous');
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Nom, prénom et email sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      const result = await onSiteRegistration({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        sector: sector.trim() || undefined,
        operatorId: user.id,
      });
      setSuccess({
        badgeCode: result.badgeCode,
        magicLinkSent: result.magicLinkSent,
        name: `${firstName.trim()} ${lastName.trim()}`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="p-8 max-w-lg mx-auto text-center">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie</h2>
        <p className="text-lg font-semibold text-gray-700 mb-6">{success.name}</p>
        <div className="bg-sib-navy text-white rounded-xl p-6 mb-6">
          <p className="text-xs uppercase tracking-wider text-sib-orange mb-1">Code badge</p>
          <p className="text-2xl font-display tracking-wider">{success.badgeCode}</p>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Aucun mot de passe pour le visiteur. Il se connecte sur l&apos;app UrbaEvent via{' '}
          <strong>lien magique</strong> envoyé à son email.
        </p>
        {success.magicLinkSent ? (
          <p className="flex items-center justify-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg mb-6">
            <Mail className="w-4 h-4" />
            Lien magique envoyé par email
          </p>
        ) : (
          <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mb-6">
            Imprimez le badge maintenant. Le visiteur pourra demander un lien magique depuis l&apos;app avec son email.
          </p>
        )}
        <Button onClick={reset} className="w-full bg-sib-orange hover:bg-sib-orange/90">
          Nouvelle inscription
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-sib-orange/15 flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-sib-orange" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inscription sur place</h2>
          <p className="text-sm text-gray-500">Sans mot de passe — le visiteur utilisera un lien magique sur l&apos;app</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="MA, FR…"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Secteur</label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sib-orange"
          >
            <option value="">— Choisir —</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-sib-orange hover:bg-sib-orange/90">
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Inscription en cours…
            </>
          ) : (
            'Inscrire et générer le badge'
          )}
        </Button>
      </form>
    </Card>
  );
}
