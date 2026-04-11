import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Hotel, Star, MapPin, Phone, Wifi, ParkingCircle, Waves, BellRing, UtensilsCrossed, CheckCircle, X } from 'lucide-react';

interface RoomRate {
  roomType: string;
  bbPrice: string;
  dpPrice: string;
}

interface Hotel {
  id: string;
  name: string;
  stars: number;
  image: string;
  distance: string;
  amenities: string[];
  standardPrice: number;
  vipPrice: number;
  description: string;
  address: string;
  phone: string;
  website?: string;
  featured?: boolean;
  rates?: RoomRate[];
}

const AccommodationPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  const hotels: Hotel[] = [
    {
      id: 'pullman',
      name: 'Pullman Mazagan Royal Golf & Spa',
      stars: 5,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      distance: t('accommodation.dist.5km'),
      amenities: ['wifi', 'parking', 'pool', 'spa', 'restaurant', 'gym'],
      standardPrice: 1340,
      vipPrice: 1139,
      description: t('accommodation.hotel.pullman.desc'),
      address: 'Route de Casablanca, Casablanca 24000',
      phone: '+212 523 388 000',
      website: 'https://www.pullmanhotels.com',
      featured: true,
      rates: [
        { roomType: t('accommodation.room.deluxe_single'), bbPrice: '1340 DH', dpPrice: '1790 DH' },
        { roomType: t('accommodation.room.deluxe_double'), bbPrice: '1490 DH', dpPrice: '1940 DH' },
        { roomType: t('accommodation.room.suite_junior_single'), bbPrice: '2340 DH', dpPrice: '2790 DH' },
        { roomType: t('accommodation.room.suite_junior_double'), bbPrice: '3140 DH', dpPrice: '3590 DH' }
      ]
    },
    {
      id: 'mazagan',
      name: 'Mazagan Beach & Golf Resort',
      stars: 5,
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      distance: t('accommodation.dist.6km'),
      amenities: ['wifi', 'parking', 'pool', 'spa', 'restaurant', 'casino', 'beach, golf'],
      standardPrice: 1810,
      vipPrice: 1539,
      description: t('accommodation.hotel.mazagan.desc'),
      address: 'Route Côtière, Casablanca',
      phone: '+212 523 388 100',
      website: 'https://www.mazaganbeachresort.com',
      featured: true,
      rates: [
        { roomType: t('accommodation.room.garden_pool_single'), bbPrice: '1810 DH', dpPrice: '2310 DH' },
        { roomType: t('accommodation.room.garden_pool_double'), bbPrice: '2030 DH', dpPrice: '3030 DH' },
        { roomType: t('accommodation.room.suite_partial_ocean'), bbPrice: '2180 DH', dpPrice: '+50 DH - Taxe/P' },
        { roomType: t('accommodation.room.suite_full_ocean'), bbPrice: '2550 DH', dpPrice: '+500 DH - Dinner/P' }
      ]
    }
  ];

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="text-blue-600" size={20} />;
      case 'parking': return <ParkingCircle className="text-blue-600" size={20} />;
      case 'pool': return <Waves className="text-blue-600" size={20} />;
      case 'spa': return <BellRing className="text-blue-600" size={20} />;
      case 'restaurant': return <UtensilsCrossed className="text-blue-600" size={20} />;
      case 'gym': return <BellRing className="text-blue-600" size={20} />;
      case 'casino': return <BellRing className="text-blue-600" size={20} />;
      case 'beach': return <Waves className="text-blue-600" size={20} />;
      case 'golf': return <BellRing className="text-blue-600" size={20} />;
      case 'bar': return <UtensilsCrossed className="text-blue-600" size={20} />;
      case 'terrace': return <BellRing className="text-blue-600" size={20} />;
      default: return <CheckCircle className="text-blue-600" size={20} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-blue-100 text-blue-700 px-6 py-2 rounded-full mb-4">
            <Hotel className="text-2xl" size={24} />
            <span className="font-semibold">{t('accommodation.badge')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('accommodation.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('accommodation.subtitle')}
          </p>
        </div>

        {/* Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 mb-12 shadow-xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{hotels.length}</div>
              <div className="text-blue-100">{t('accommodation.hotels_partners')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">-15%</div>
              <div className="text-blue-100">{t('accommodation.vip_discount')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1-3</div>
              <div className="text-blue-100">{t('accommodation.april_dates')}</div>
            </div>
          </div>
        </div>

        {/* VIP Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="bg-amber-500 text-white p-3 rounded-full">
              <Star className="text-2xl" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('accommodation.vip_advantage_title')}
              </h3>
              <p className="text-gray-700 mb-3">
                {t('accommodation.vip_advantage_desc')}
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-800">
                  <CheckCircle className="text-green-600" size={20} />
                  <span>{t('accommodation.vip_benefit_1')}</span>
                </li>
                <li className="flex items-center gap-2 text-gray-800">
                  <CheckCircle className="text-green-600" size={20} />
                  <span>{t('accommodation.vip_benefit_2')}</span>
                </li>
                <li className="flex items-center gap-2 text-gray-800">
                  <CheckCircle className="text-green-600" size={20} />
                  <span>{t('accommodation.vip_benefit_3')}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Hotels Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                hotel.featured ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {hotel.featured && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2 font-semibold">
                  {t('accommodation.featured_partner')}
                </div>
              )}
              
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.image}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <Star key={i} className="text-yellow-500 text-sm" size={16} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin className="text-blue-600" size={18} />
                  <span className="text-sm">{hotel.distance}</span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {hotel.description}
                </p>

                {/* Amenities */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 5).map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg"
                      title={t(`accommodation.amenity_${amenity}`)}
                    >
                      {getAmenityIcon(amenity)}
                    </div>
                  ))}
                  {hotel.amenities.length > 5 && (
                    <span className="text-xs text-gray-500 self-center">
                      +{hotel.amenities.length - 5}
                    </span>
                  )}
                </div>

                {/* Pricing */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-sm text-gray-600">{t('accommodation.standard_rate')}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {hotel.standardPrice} <span className="text-sm text-gray-600">MAD</span>
                      </div>
                      <div className="text-xs text-gray-500">{t('accommodation.per_night')}</div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold text-green-800 flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} fill="currentColor" />
                          {t('accommodation.vip_rate')}
                        </div>
                        <div className="text-2xl font-bold text-green-700">
                          {hotel.vipPrice} <span className="text-sm">MAD</span>
                        </div>
                      </div>
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{Math.round(((hotel.standardPrice - hotel.vipPrice) / hotel.standardPrice) * 100)}%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedHotel(hotel.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                  >
                    {t('accommodation.view_details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How to Book Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t('accommodation.how_to_book')}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('accommodation.step1_title')}</h3>
              <p className="text-sm text-gray-600">{t('accommodation.step1_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('accommodation.step2_title')}</h3>
              <p className="text-sm text-gray-600">{t('accommodation.step2_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('accommodation.step3_title')}</h3>
              <p className="text-sm text-gray-600">{t('accommodation.step3_desc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-blue-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('accommodation.step4_title')}</h3>
              <p className="text-sm text-gray-600">{t('accommodation.step4_desc')}</p>
            </div>
          </div>
        </div>

        {/* Contact Banner */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-3">{t('accommodation.need_help')}</h3>
          <p className="text-gray-300 mb-6">{t('accommodation.contact_desc')}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="tel:+212523388000"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Phone size={20} />
              +212 523 388 000
            </a>
            <a
              href="mailto:hebergement@SIBevent.com"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              hebergement@SIBevent.com
            </a>
          </div>
        </div>

        {/* Modal Détails & Tarifs */}
        {selectedHotel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedHotel(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
               {(() => {
                 const hotel = hotels.find(h => h.id === selectedHotel);
                 if (!hotel) return null;
                 return (
                   <div className="p-6">
                      <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">{hotel.name}</h2>
                        <button onClick={() => setSelectedHotel(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                          <X size={24} className="text-gray-500" /> 
                        </button>
                      </div>

                      <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <img src={hotel.image} alt={hotel.name} className="w-full md:w-1/3 h-48 object-cover rounded-xl" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="text-blue-600" size={18} />
                            <span>{hotel.address}</span>
                          </div>
                          <p className="text-gray-700 mb-4">{hotel.description}</p>
                          <div className="flex flex-wrap gap-2">
                             {hotel.amenities.map(a => (
                               <span key={a} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                                 {t(`accommodation.amenity_${a}`)}
                               </span>
                             ))}
                          </div>
                        </div>
                      </div>

                      {hotel.rates && (
                        <div className="mb-8 bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                              <Star className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Tarifs Négociés SIB 2026</h3>
                              <p className="text-sm text-gray-500">Prix exclusifs pour les participants</p>
                            </div>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">Type de Chambre</th>
                                  <th className="p-4 font-semibold text-blue-600 text-sm uppercase tracking-wider">BB (Petit-déjeuner)</th>
                                  <th className="p-4 font-semibold text-gray-600 text-sm uppercase tracking-wider">DP (Demi-pension)</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {hotel.rates.map((rate, idx) => (
                                  <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-4 font-medium text-gray-900">{rate.roomType}</td>
                                    <td className="p-4 font-bold text-blue-600 font-mono text-lg">{rate.bbPrice}</td>
                                    <td className="p-4 text-gray-600 font-mono">{rate.dpPrice}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-gray-500 mt-4 italic">
                            * Les tarifs incluent la taxe de séjour (sauf mention contraire).
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                         <a href={`tel:${hotel.phone}`} className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                            <Phone size={18} />
                            Appeler l'hôtel
                         </a>
                         {hotel.website && (
                            <a href={hotel.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                               Réserver en ligne
                            </a>
                         )}
                      </div>
                   </div>
                 );
               })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationPage;

