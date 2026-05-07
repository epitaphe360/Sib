/**
 * PrintableBadgeA4 â€“ Badge A4 bifold 4 faces SIB 2026
 *
 * Bifold A4 â†’ 4 faces de 148mm Ã— 105mm :
 *   Face 1 (couverture extÃ©rieure droite) : Promo app URBAEVENT + QR App Store / Google Play
 *   Face 2 (intÃ©rieure gauche)            : Logo + bandeau validitÃ© bilingue + Programme gÃ©nÃ©ral
 *   Face 3 (intÃ©rieure droite)            : IdentitÃ© participant + QR code personnel
 *   Face 4 (dos extÃ©rieur gauche)         : Logos organisateurs, co-organisateurs, partenaires
 *
 * Impression recto-verso :
 *   Page 1 (recto) : Face 4 (gauche) | Face 1 (droite)
 *   Page 2 (verso) : Face 2 (gauche) | Face 3 (droite)
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { UserBadge } from '../../types';
import { getBadgeColor, getAccessLevelLabel } from '../../services/badgeService';
import { supabase } from '../../lib/supabase';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface BadgeSession {
  time: string;
  title: string;
  type: string;
}

interface BadgeDayProgram {
  id: string;
  date: string;
  label: string;
  sessions: BadgeSession[];
  open: boolean;
}

interface FeaturedSponsor {
  id: string;
  name: string;
  logo_url: string;
  role: string;
  order: number;
}

type FaceContent = 'partenaires' | 'programme' | 'infos_pratiques' | 'app_promo' | 'image_pleine' | 'carte_de_visite' | 'identite_participant';

interface BadgeConfig {
  event_name: string;
  event_edition: string;
  event_dates_display: string;
  event_location: string;
  event_location_detail: string;
  badge_validity_text_fr: string;
  badge_validity_text_en: string;
  primary_color: string;
  secondary_color: string;
  header_bg: string;
  text_dark: string;
  accent_color: string;
  logo_main_url: string;
  logo_ministry_url: string;
  logo_sponsor_1_url: string;
  logo_sponsor_1_label: string;
  logo_sponsor_2_url: string;
  logo_sponsor_2_label: string;
  logo_sponsor_3_url: string;
  logo_sponsor_3_label: string;
  show_program_on_badge: string;
  program_compact_mode: string;  // 'false'|'small'|'mini'
  program_days: BadgeDayProgram[];
  partners_section_title: string;
  show_app_promo: string;
  app_promo_title: string;
  app_promo_subtitle: string;
  app_store_url: string;
  google_play_url: string;
  app_promo_image_url: string;
  logo_organizer_url: string;
  logo_organizer_label: string;
  logo_delegate_url: string;
  logo_delegate_label: string;
  logo_badging_url: string;
  logo_badging_label: string;
  logo_media_url: string;
  logo_media_label: string;
  logo_digital_url: string;
  logo_digital_label: string;
  logo_aegis_url: string;
  logo_aegis_label: string;
  // Choix de contenu par face
  face1_content: FaceContent;
  face2_content: FaceContent;
  face3_content: FaceContent;
  face4_content: FaceContent;
  // Sponsors sélectionnés pour la face partenaires
  featured_sponsors: FeaturedSponsor[];
  // Infos pratiques (Face 1 option)
  opening_hours: string;
  location_address: string;
  location_qr_url: string;
  how_to_get_there: string;
  contact_phone: string;
  contact_email: string;
  contact_website: string;
  dates_label: string;
}

const DEFAULT_CONFIG: BadgeConfig = {
  event_name: 'SIB 2026',
  event_edition: '1ère édition',
  event_dates_display: '25 – 29 Novembre 2026',
  event_location: 'El Jadida, Maroc',
  event_location_detail: "Parc d'Exposition Mohammed VI",
  badge_validity_text_fr: "CECI EST VOTRE BADGE D'ACCÈS VALABLE POUR LES 5 JOURS DU SALON",
  badge_validity_text_en: 'THIS DOCUMENT IS YOUR ENTRY BADGE VALID FOR THE 5 DAYS OF THE EXHIBITION',
  primary_color: '#1e3a5f',
  secondary_color: '#C9A84C',
  header_bg: '#1e3a5f',
  text_dark: '#111827',
  accent_color: '#3ECF8E',
  logo_main_url: '/logo-sib2026.png',
  logo_ministry_url: '/logo-ministere.png',
  logo_sponsor_1_url: '',
  logo_sponsor_1_label: 'Partenaire Officiel',
  logo_sponsor_2_url: '',
  logo_sponsor_2_label: 'Co-Organisateur',
  logo_sponsor_3_url: '',
  logo_sponsor_3_label: 'Partenaire Médias',
  show_program_on_badge: 'true',
  program_compact_mode: 'false',
  program_days: [],
  partners_section_title: "Sous le Haut Patronage de Sa Majesté le Roi",
  show_app_promo: 'true',
  app_promo_title: "Développez votre réseau Professionnel avec URBA event",
  app_promo_subtitle: 'Networking · Rendez-vous · Programme · Annuaire',
  app_store_url: 'https://apps.apple.com',
  google_play_url: 'https://play.google.com/store',
  app_promo_image_url: '',
  logo_organizer_url: '',
  logo_organizer_label: 'Organisateur',
  logo_delegate_url: '',
  logo_delegate_label: 'Organisateur délégué',
  logo_badging_url: '',
  logo_badging_label: 'Partenaire Badging',
  logo_media_url: '',
  logo_media_label: 'Partenaire Médias',
  logo_digital_url: '',
  logo_digital_label: 'Partenaire Digital',
  logo_aegis_url: '',
  logo_aegis_label: "Sous l'égide de",
  face1_content: 'infos_pratiques',
  face2_content: 'carte_de_visite',
  face3_content: 'identite_participant',
  face4_content: 'partenaires',
  featured_sponsors: [],
  opening_hours: 'de 9h30 à 18h30 · Vendredi & Samedi / de 9h à 17h30 · Dimanche',
  location_address: 'ICEC - Ain Sebaa, Casablanca',
  location_qr_url: '',
  how_to_get_there: 'Accessible depuis la rocade — sortie Marjane et Décathlon Ain Sebaa',
  contact_phone: '+212 6 88 50 05 00',
  contact_email: 'contact@sib2026.ma',
  contact_website: 'www.sib2026.ma',
  dates_label: 'du 25 au 29 Novembre 2026',
};

const SESSION_COLORS: Record<string, string> = {
  opening:    '#7c3aed',
  panel:      '#1e3a5f',
  session:    '#0369a1',
  networking: '#059669',
  demo:       '#d97706',
  lunch:      '#16a34a',
  break:      '#9ca3af',
  visit:      '#c2410c',
  ceremony:   '#C9A84C',
};

const SESSION_LABELS: Record<string, string> = {
  opening:    'Ouverture',
  panel:      'Panel',
  session:    'Conférence',
  networking: 'Networking',
  demo:       'Démo',
  lunch:      'Déjeuner',
  break:      'Pause',
  visit:      'Visite',
  ceremony:   'Cérémonie',
};

// ─── Sous-composants faces ───────────────────────────────────────────────────

function InfoRow({ icon, title, value }: Readonly<{ icon: string; title: string; value: string }>) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: '2mm', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '4mm', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontWeight: 800, fontSize: '3mm', color: '#111827', lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: '2.8mm', color: '#374151', lineHeight: 1.4, marginTop: '0.3mm' }}>{value}</div>
      </div>
    </div>
  );
}

interface FaceBaseProps {
  faceStyle: React.CSSProperties;
  config: BadgeConfig;
  primary: string;
  secondary: string;
}

interface Face1Props extends FaceBaseProps {
  qrAppStore: string;
  qrPlayStore: string;
}

interface Face3Props extends FaceBaseProps {
  badge: UserBadge;
  accessColor: string;
  accessLabel: string;
  qrParticipant: string;
}

function Face1({ faceStyle, config, primary, secondary, qrAppStore, qrPlayStore }: Readonly<Face1Props>) {
  // Option image pleine
  if (config.face1_content === 'image_pleine' && config.app_promo_image_url) {
    return (
      <div style={{ ...faceStyle, padding: 0, overflow: 'hidden' }}>
        <img src={config.app_promo_image_url} alt="URBAEVENT"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
      </div>
    );
  }
  // Option infos pratiques
  if (config.face1_content === 'infos_pratiques') {
    return (
      <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: '#111', color: '#fff', padding: '2.5mm 4mm', fontSize: '2.8mm', fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>
          <div>{config.badge_validity_text_fr}</div>
          <div style={{ opacity: 0.65, fontSize: '2.5mm', marginTop: '0.5mm' }}>{config.badge_validity_text_en}</div>
        </div>
        <div style={{ padding: '2mm 4mm', fontStyle: 'italic', fontSize: '3.2mm', color: '#374151', borderBottom: '0.3mm solid #e5e7eb' }}>
          Ce badge vous donne accès au salon pendant les 5 jours de l'évènement.
        </div>
        <div style={{ flex: 1, padding: '2mm 4mm', display: 'flex', flexDirection: 'column', gap: '2.5mm' }}>
          <InfoRow icon="📅" title="DATES DU SALON" value={config.dates_label || config.event_dates_display} />
          <InfoRow icon="🕐" title="HORAIRES D'OUVERTURE" value={config.opening_hours} />
          <InfoRow icon="📍" title="LIEU" value={config.location_address || config.event_location_detail || config.event_location} />
          <div style={{ display: 'flex', gap: '3mm', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <InfoRow icon="🧭" title="VENIR AU SALON" value={config.how_to_get_there} />
            </div>
            {config.location_qr_url && (
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ background: '#fff', border: '0.5mm solid #e5e7eb', borderRadius: '1.5mm', padding: '1mm', display: 'inline-block' }}>
                  <img src={config.location_qr_url} alt="Géolocalisation" style={{ width: '14mm', height: '14mm', display: 'block' }} />
                </div>
                <div style={{ fontSize: '2mm', color: '#9ca3af', marginTop: '0.5mm' }}>Scannez ici<br />pour la localisation</div>
              </div>
            )}
          </div>
          <InfoRow icon="📞" title="CONTACT" value={[config.contact_phone, config.contact_email, config.contact_website].filter(Boolean).join(' · ')} />
        </div>
      </div>
    );
  }
  // Option app_promo (défaut)
  if (config.app_promo_image_url) {
    return (
      <div style={{ ...faceStyle, padding: 0, overflow: 'hidden' }}>
        <img src={config.app_promo_image_url} alt="URBAEVENT"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
      </div>
    );
  }
  return (
    <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${primary} 0%, #0a1f3a 100%)` }}>
      <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `0.5mm solid ${secondary}` }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: '8mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
        <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_edition}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5mm 4mm', textAlign: 'center' }}>
        <div style={{ color: secondary, fontWeight: 900, fontSize: '9mm', lineHeight: 1.1, marginBottom: '3mm' }}>
          URBA<span style={{ color: '#fff' }}>EVENT</span>
        </div>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: '3.8mm', marginBottom: '2mm', lineHeight: 1.4, maxWidth: '80%' }}>{config.app_promo_title}</div>
        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '3mm', marginBottom: '6mm' }}>{config.app_promo_subtitle}</div>
        <div style={{ display: 'flex', gap: '6mm', justifyContent: 'center' }}>
          {qrAppStore && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '1.5mm', padding: '1.5mm', display: 'inline-block', marginBottom: '1mm' }}>
                <img src={qrAppStore} alt="App Store" style={{ width: '18mm', height: '18mm', display: 'block' }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '2.5mm', fontWeight: 600 }}>App Store</div>
            </div>
          )}
          {qrPlayStore && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#fff', borderRadius: '1.5mm', padding: '1.5mm', display: 'inline-block', marginBottom: '1mm' }}>
                <img src={qrPlayStore} alt="Google Play" style={{ width: '18mm', height: '18mm', display: 'block' }} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '2.5mm', fontWeight: 600 }}>Google Play</div>
            </div>
          )}
        </div>
      </div>
      <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2mm 4mm', textAlign: 'center' }}>
        <div style={{ color: secondary, fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
      </div>
    </div>
  );
}

const COMPACT_STYLES: Record<string, { pad: string; dayFs: string; sesFs: string; timeW: string; dayMb: string; sesMb: string; padDay: string; maxTitle: number; maxSes: number }> = {
  false: { pad: '3mm 4mm', dayFs: '3mm',   sesFs: '2.8mm', timeW: '14mm', dayMb: '2.5mm', sesMb: '0.8mm', padDay: '0.8mm 2mm',   maxTitle: 45, maxSes: 3 },
  small: { pad: '2mm 3mm', dayFs: '2.6mm', sesFs: '2.3mm', timeW: '12mm', dayMb: '1.5mm', sesMb: '0.5mm', padDay: '0.5mm 1.5mm', maxTitle: 40, maxSes: 999 },
  mini:  { pad: '1.5mm 3mm', dayFs: '2.2mm', sesFs: '1.9mm', timeW: '11mm', dayMb: '1mm',   sesMb: '0.3mm', padDay: '0.3mm 1.5mm', maxTitle: 35, maxSes: 999 },
};

function ProgramBlock({ config, primary, secondary }: Readonly<{ config: BadgeConfig; primary: string; secondary: string }>) {
  const mode = COMPACT_STYLES[config.program_compact_mode] ?? COMPACT_STYLES.false;
  return (
    <div style={{ flex: 1, overflow: 'hidden', padding: mode.pad }}>
      {config.program_compact_mode === 'false' && (
        <div style={{ fontWeight: 800, color: primary, fontSize: '4mm', marginBottom: '2mm', fontStyle: 'italic' }}>
          Programme {config.event_name}
        </div>
      )}
      {config.program_days.map((day) => (
        <div key={day.id} style={{ marginBottom: mode.dayMb }}>
          <div style={{ background: secondary, color: '#fff', padding: mode.padDay, borderRadius: '1mm', fontWeight: 700, fontSize: mode.dayFs, marginBottom: mode.sesMb, display: 'inline-block' }}>
            {day.label}
          </div>
          {day.sessions.slice(0, mode.maxSes).map((s, i) => (
            <div key={`${day.id}-s${i}`} style={{ fontSize: mode.sesFs, color: '#333', paddingLeft: '2mm', marginBottom: mode.sesMb, display: 'flex', gap: '1mm' }}>
              <span style={{ color: SESSION_COLORS[s.type] ?? primary, fontWeight: 600, whiteSpace: 'nowrap', minWidth: mode.timeW }}>{s.time}</span>
              <span style={{ color: '#222', lineHeight: 1.2 }}>{s.title.length > mode.maxTitle ? `${s.title.slice(0, mode.maxTitle)}…` : s.title}</span>
            </div>
          ))}
          {mode.maxSes === 3 && day.sessions.length > 3 && (
            <div style={{ fontSize: '2.5mm', color: '#999', paddingLeft: '2mm' }}>{`+${day.sessions.length - 3} sessions`}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function Face2({ faceStyle, config, primary, secondary, qrAppStore, qrPlayStore }: Readonly<Face1Props>) {
  // Option carte de visite
  if (config.face2_content === 'carte_de_visite') {
    return (
      <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {config.logo_main_url
            ? <img src={config.logo_main_url} alt="logo" style={{ height: '10mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
          <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_name} · {config.event_edition}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6mm 8mm', textAlign: 'center', gap: '4mm' }}>
          <div style={{ border: `1.5mm solid ${primary}`, borderRadius: '2mm', padding: '8mm 10mm', textAlign: 'center', width: '90%' }}>
            <div style={{ fontWeight: 800, fontSize: '4mm', color: primary, lineHeight: 1.4, marginBottom: '3mm' }}>
              Insérez votre carte de visite<br />dans le porte-badge
            </div>
            <div style={{ fontWeight: 600, fontSize: '3.5mm', color: '#374151', lineHeight: 1.4, fontStyle: 'italic' }}>
              Insert your business card<br />in the badge holder
            </div>
          </div>
        </div>
        <div style={{ background: primary, color: '#fff', padding: '2mm 4mm', textAlign: 'center', marginTop: 'auto' }}>
          <div style={{ fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
          <div style={{ opacity: 0.7, fontSize: '2.5mm' }}>{config.event_location_detail}</div>
        </div>
      </div>
    );
  }
  // Option app_promo
  if (config.face2_content === 'app_promo') {
    return (
      <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${primary} 0%, #0a1f3a 100%)` }}>
        <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `0.5mm solid ${secondary}` }}>
          {config.logo_main_url
            ? <img src={config.logo_main_url} alt="logo" style={{ height: '8mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
            : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
          <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_edition}</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5mm 4mm', textAlign: 'center' }}>
          <div style={{ color: secondary, fontWeight: 900, fontSize: '9mm', lineHeight: 1.1, marginBottom: '3mm' }}>URBA<span style={{ color: '#fff' }}>EVENT</span></div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '3.8mm', marginBottom: '2mm', lineHeight: 1.4, maxWidth: '80%' }}>{config.app_promo_title}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '3mm', marginBottom: '6mm' }}>{config.app_promo_subtitle}</div>
          <div style={{ display: 'flex', gap: '6mm', justifyContent: 'center' }}>
            {qrAppStore && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fff', borderRadius: '1.5mm', padding: '1.5mm', display: 'inline-block', marginBottom: '1mm' }}>
                  <img src={qrAppStore} alt="App Store" style={{ width: '18mm', height: '18mm', display: 'block' }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '2.5mm', fontWeight: 600 }}>App Store</div>
              </div>
            )}
            {qrPlayStore && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#fff', borderRadius: '1.5mm', padding: '1.5mm', display: 'inline-block', marginBottom: '1mm' }}>
                  <img src={qrPlayStore} alt="Google Play" style={{ width: '18mm', height: '18mm', display: 'block' }} />
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '2.5mm', fontWeight: 600 }}>Google Play</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '2mm 4mm', textAlign: 'center' }}>
          <div style={{ color: secondary, fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
        </div>
      </div>
    );
  }
  // Option programme (défaut)
  return (
    <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: '10mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
        <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_name} · {config.event_edition}</span>
      </div>
      <div style={{ background: '#111', color: '#fff', padding: '2.5mm 4mm', fontSize: '3mm', fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>
        <div>{config.badge_validity_text_fr}</div>
        <div style={{ opacity: 0.65, fontSize: '2.8mm', marginTop: '0.5mm' }}>{config.badge_validity_text_en}</div>
      </div>
      {config.show_program_on_badge === 'true' && config.program_days.length > 0 && (
        <ProgramBlock config={config} primary={primary} secondary={secondary} />
      )}
      <div style={{ background: primary, color: '#fff', padding: '2mm 4mm', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7, fontSize: '2.5mm' }}>{config.event_location_detail}</div>
      </div>
    </div>
  );
}

function Face3({ faceStyle, badge, config, primary, secondary, accessColor, accessLabel, qrParticipant, qrAppStore, qrPlayStore }: Readonly<Face3Props & { qrAppStore: string; qrPlayStore: string }>) {
  // Option programme
  if (config.face3_content === 'programme') {
    return <Face2 faceStyle={faceStyle} config={{ ...config, face2_content: 'programme' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option app_promo
  if (config.face3_content === 'app_promo') {
    return <Face1 faceStyle={faceStyle} config={{ ...config, face1_content: 'app_promo' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option carte_de_visite
  if (config.face3_content === 'carte_de_visite') {
    return <Face2 faceStyle={faceStyle} config={{ ...config, face2_content: 'carte_de_visite' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option identite_participant (défaut)
  return (
    <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: '10mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
        <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_name}</span>
      </div>
      <div style={{ background: '#111', color: '#fff', padding: '2mm 4mm', fontSize: '2.8mm', fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>
        <div>{config.badge_validity_text_fr}</div>
        <div style={{ opacity: 0.65, fontSize: '2.5mm', marginTop: '0.5mm' }}>{config.badge_validity_text_en}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4mm', textAlign: 'center' }}>
        {badge.avatarUrl
          ? <img src={badge.avatarUrl} alt="avatar" style={{ width: '22mm', height: '22mm', borderRadius: '50%', objectFit: 'cover', border: `0.5mm solid ${secondary}`, marginBottom: '3mm' }} />
          : <div style={{ width: '22mm', height: '22mm', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10mm', marginBottom: '3mm', border: `0.5mm solid ${secondary}` }}>👤</div>}
        <div style={{ fontWeight: 800, fontSize: '5.5mm', color: config.text_dark, marginBottom: '1mm', lineHeight: 1.2 }}>{badge.fullName}</div>
        <div style={{ fontSize: '3.5mm', color: '#6b7280', marginBottom: '2mm' }}>{badge.companyName ?? ''}</div>
        <div style={{ background: accessColor, color: '#fff', borderRadius: '10mm', padding: '1mm 4mm', fontSize: '3mm', fontWeight: 700, marginBottom: '4mm', textTransform: 'uppercase' }}>
          {accessLabel}
        </div>
        {/* Logo société pour exposants */}
        {badge.userType === 'exhibitor' && badge.companyLogoUrl && (
          <div style={{ margin: '0 auto 4mm', padding: '2mm 4mm', background: '#fff', border: `0.5mm solid ${secondary}`, borderRadius: '1.5mm', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={badge.companyLogoUrl} alt="logo société" style={{ maxHeight: '15mm', maxWidth: '35mm', objectFit: 'contain' }} />
          </div>
        )}
        {qrParticipant && (
          <div style={{ background: '#fff', border: `0.5mm solid ${secondary}`, borderRadius: '2mm', padding: '2mm', display: 'inline-block', marginBottom: '1.5mm' }}>
            <img src={qrParticipant} alt="QR badge" style={{ width: '24mm', height: '24mm', display: 'block' }} />
          </div>
        )}
        <div style={{ fontSize: '2.5mm', color: '#9ca3af', fontFamily: 'monospace' }}>{badge.badgeCode}</div>
        {badge.standNumber && (
          <div style={{ fontSize: '2.8mm', color: accessColor, fontWeight: 700, marginTop: '1mm' }}>Stand {badge.standNumber}</div>
        )}
      </div>
      <div style={{ background: primary, color: '#fff', padding: '2mm 4mm', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7, fontSize: '2.5mm' }}>{config.event_location_detail}</div>
      </div>
    </div>
  );
}

function Face4({ faceStyle, config, primary, secondary, qrAppStore, qrPlayStore }: Readonly<FaceBaseProps & { qrAppStore: string; qrPlayStore: string }>) {
  // Option programme
  if (config.face4_content === 'programme') {
    return <Face2 faceStyle={faceStyle} config={{ ...config, face2_content: 'programme' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option infos_pratiques
  if (config.face4_content === 'infos_pratiques') {
    return <Face1 faceStyle={faceStyle} config={{ ...config, face1_content: 'infos_pratiques' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option app_promo
  if (config.face4_content === 'app_promo') {
    return <Face1 faceStyle={faceStyle} config={{ ...config, face1_content: 'app_promo' }} primary={primary} secondary={secondary} qrAppStore={qrAppStore} qrPlayStore={qrPlayStore} />;
  }
  // Option partenaires (défaut) — utilise featured_sponsors si disponibles, sinon fallback logos statiques
  const sponsors: FeaturedSponsor[] = (config.featured_sponsors ?? []).slice().sort((a, b) => a.order - b.order);
  const hasSponsors = sponsors.length > 0;
  return (
    <div style={{ ...faceStyle, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: primary, padding: '3mm 4mm', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {config.logo_main_url
          ? <img src={config.logo_main_url} alt="logo" style={{ height: '10mm', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
          : <span style={{ color: secondary, fontWeight: 900, fontSize: '5mm' }}>{config.event_name}</span>}
        <span style={{ color: secondary, fontWeight: 700, fontSize: '3.5mm' }}>{config.event_edition}</span>
      </div>
      {hasSponsors ? (
        /* Affichage dynamique depuis featured_sponsors */
        <div style={{ flex: 1, padding: '3mm 4mm', display: 'flex', flexDirection: 'column', gap: '2mm' }}>
          {config.partners_section_title && (
            <div style={{ textAlign: 'center', fontSize: '2.5mm', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5mm', marginBottom: '1mm' }}>
              {config.partners_section_title}
            </div>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3mm', justifyContent: 'center', alignItems: 'center' }}>
            {sponsors.map(sp => (
              <div key={sp.id} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8mm' }}>
                {sp.logo_url
                  ? <img src={sp.logo_url} alt={sp.name} style={{ maxHeight: '13mm', maxWidth: '30mm', objectFit: 'contain' }} />
                  : <div style={{ height: '11mm', width: '28mm', background: '#f3f4f6', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5mm', color: '#9ca3af', fontWeight: 600 }}>{sp.name}</div>}
                <div style={{ fontSize: '2mm', color: '#6b7280', fontWeight: 600 }}>{sp.role}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Fallback logos statiques */
        <div style={{ flex: 1, padding: '3mm 4mm', display: 'flex', flexDirection: 'column', gap: '2.5mm', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <div style={{ fontSize: '2.5mm', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5mm', marginBottom: '1.5mm' }}>{config.logo_aegis_label || "Sous l'égide de"}</div>
            {config.logo_aegis_url
              ? <img src={config.logo_aegis_url} alt={config.logo_aegis_label} style={{ maxHeight: '14mm', maxWidth: '50mm', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
              : <div style={{ height: '10mm', width: '40mm', background: '#f3f4f6', borderRadius: '1mm', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5mm', color: '#9ca3af' }}>Logo</div>}
          </div>
          <hr style={{ border: 'none', borderTop: '0.3mm solid #e5e7eb', width: '90%', margin: '0' }} />
          <div style={{ display: 'flex', gap: '4mm', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { url: config.logo_organizer_url, label: config.logo_organizer_label },
              { url: config.logo_delegate_url, label: config.logo_delegate_label },
            ].map(({ url, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                {url
                  ? <img src={url} alt={label} style={{ height: '12mm', maxWidth: '28mm', objectFit: 'contain' }} />
                  : <div style={{ height: '10mm', width: '26mm', background: '#f3f4f6', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5mm', color: '#9ca3af' }}>{label}</div>}
              </div>
            ))}
          </div>
          <hr style={{ border: 'none', borderTop: '0.3mm solid #e5e7eb', width: '90%', margin: '0' }} />
          <div style={{ display: 'flex', gap: '3mm', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {([1, 2, 3] as const).map(n => {
              const sUrl = config[`logo_sponsor_${n}_url` as keyof BadgeConfig] as string;
              const sLbl = config[`logo_sponsor_${n}_label` as keyof BadgeConfig] as string;
              return (
                <div key={n} style={{ textAlign: 'center' }}>
                  {sUrl
                    ? <img src={sUrl} alt={sLbl} style={{ height: '10mm', maxWidth: '24mm', objectFit: 'contain' }} />
                    : <div style={{ height: '9mm', width: '22mm', background: '#f3f4f6', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2mm', color: '#9ca3af' }}>{sLbl}</div>}
                </div>
              );
            })}
          </div>
          <hr style={{ border: 'none', borderTop: '0.3mm solid #e5e7eb', width: '90%', margin: '0' }} />
          <div style={{ display: 'flex', gap: '3mm', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            {(['badging', 'digital', 'media'] as const).map(type => {
              const pUrl = config[`logo_${type}_url` as keyof BadgeConfig] as string;
              const pLbl = config[`logo_${type}_label` as keyof BadgeConfig] as string;
              return (
                <div key={type} style={{ textAlign: 'center' }}>
                  {pUrl
                    ? <img src={pUrl} alt={pLbl} style={{ height: '9mm', maxWidth: '22mm', objectFit: 'contain' }} />
                    : <div style={{ height: '8mm', width: '20mm', background: '#f3f4f6', borderRadius: '1mm', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2mm', color: '#9ca3af' }}>{pLbl}</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ background: primary, color: '#fff', padding: '2mm 4mm', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '3mm' }}>{config.event_dates_display} · {config.event_location}</div>
        <div style={{ opacity: 0.7, fontSize: '2.5mm' }}>{config.event_location_detail}</div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Props â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PrintableBadgeA4Props {
  badge: UserBadge;
  /** Config passÃ©e en prop (ex: depuis AdminBadgeConfigPage pour aperÃ§u) */
  config?: BadgeConfig;
  /** Si true, charge la config depuis Supabase */
  loadConfig?: boolean;
}

// â”€â”€â”€ Composant principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function PrintableBadgeA4({
  badge,
  config: configProp,
  loadConfig = true,
}: Readonly<PrintableBadgeA4Props>) {
  const [config, setConfig] = useState<BadgeConfig>(configProp ?? DEFAULT_CONFIG);
  const [qrParticipant, setQrParticipant] = useState('');
  const [qrAppStore, setQrAppStore] = useState('');
  const [qrPlayStore, setQrPlayStore] = useState('');

  useEffect(() => {
    if (configProp) { setConfig(configProp); return; }
    if (!loadConfig) { return; }
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'badge_config_v1')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value as string) as BadgeConfig;
            setConfig({ ...DEFAULT_CONFIG, ...parsed });
          } catch { /* keep defaults */ }
        }
      });
  }, [configProp, loadConfig]);

  useEffect(() => {
    const payload = JSON.stringify({
      code: badge.badgeCode, userId: badge.userId,
      type: badge.userType, level: badge.accessLevel, name: badge.fullName,
    });
    QRCode.toDataURL(payload, { width: 300, margin: 1, errorCorrectionLevel: 'H' })
      .then(setQrParticipant).catch(console.error);
  }, [badge]);

  useEffect(() => {
    if (!config.app_store_url) { return; }
    QRCode.toDataURL(config.app_store_url, { width: 200, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrAppStore).catch(console.error);
  }, [config.app_store_url]);

  useEffect(() => {
    if (!config.google_play_url) { return; }
    QRCode.toDataURL(config.google_play_url, { width: 200, margin: 1, errorCorrectionLevel: 'M' })
      .then(setQrPlayStore).catch(console.error);
  }, [config.google_play_url]);

  const accessColor = getBadgeColor(badge.accessLevel || badge.userType);
  const accessLabel = getAccessLevelLabel(badge.accessLevel || badge.userType);
  const primary = config.primary_color;
  const secondary = config.secondary_color;
  const faceStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    boxSizing: 'border-box',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: 'relative',
    backgroundColor: '#ffffff',
  };

  return (
    <div
      id="printable-badge-a4"
      style={{
        display: 'block',
        width: '210mm',
        height: '297mm',
        margin: 0,
        padding: 0,
      }}
    >
      {/* A4 portrait — 4 quadrants égaux 2×2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        width: '100%',
        height: '100%',
        background: '#fff',
        position: 'relative',
      }}>
        {/* Trait de coupe vertical */}
        <div style={{ position: 'absolute', left: '50%', top: 0, width: 0, height: '100%', borderLeft: '0.3mm dashed #bbb', pointerEvents: 'none', zIndex: 10 }} />
        {/* Trait de coupe horizontal */}
        <div style={{ position: 'absolute', left: 0, top: '50%', width: '100%', height: 0, borderTop: '0.3mm dashed #bbb', pointerEvents: 'none', zIndex: 10 }} />
        {(() => {
          function renderSlot(content: FaceContent) {
            const base = { faceStyle, primary, secondary, qrAppStore, qrPlayStore };
            switch (content) {
              case 'programme':
                return <Face2 {...base} config={{ ...config, face2_content: 'programme' }} />;
              case 'carte_de_visite':
                return <Face2 {...base} config={{ ...config, face2_content: 'carte_de_visite' }} />;
              case 'infos_pratiques':
                return <Face1 {...base} config={{ ...config, face1_content: 'infos_pratiques' }} />;
              case 'image_pleine':
                return <Face1 {...base} config={{ ...config, face1_content: 'image_pleine' }} />;
              case 'partenaires':
                return <Face4 {...base} config={{ ...config, face4_content: 'partenaires' }} />;
              case 'identite_participant':
                return <Face3 {...base} badge={badge} config={{ ...config, face3_content: 'identite_participant' }} accessColor={accessColor} accessLabel={accessLabel} qrParticipant={qrParticipant} />;
              case 'app_promo':
              default:
                return <Face1 {...base} config={{ ...config, face1_content: 'app_promo' }} />;
            }
          }
          return (
            <>
              {renderSlot(config.face4_content)}
              {renderSlot(config.face1_content)}
              {renderSlot(config.face2_content)}
              {renderSlot(config.face3_content)}
            </>
          );
        })()}
      </div>
    </div>
  );
}
