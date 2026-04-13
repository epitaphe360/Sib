import React from 'react';
import { MoroccanPattern } from '../ui/MoroccanDecor';

const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=com.urbavent';
const APP_STORE_URL = 'https://apps.apple.com/ma/app/urbaevent/id6470919049?l=fr-FR';

export const AppBanner: React.FC = () => {
  return (
    <section className="w-full">
      <div
        className="flex items-stretch bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 relative overflow-hidden"
        style={{ minHeight: 90 }}
      >
        {/* Motif Zellige en fond */}
        <MoroccanPattern className="opacity-[0.08] text-white" scale={1.2} />
        {/* Bloc gauche accent */}
        <div className="flex-shrink-0 flex flex-col justify-center px-8 py-5 bg-blue-800 relative z-10" style={{ minWidth: 210 }}>
          <p className="text-white font-black text-lg leading-none tracking-wide">URBAEVENT</p>
          <p className="text-white font-black text-2xl leading-none mt-0.5">
            Mobile <span className="italic">App</span>
          </p>
          <p className="text-white/70 text-xs mt-2 italic leading-tight" style={{ maxWidth: 175 }}>
            "The Directory of Related Events<br />in Building and Urban Planning"
          </p>
        </div>

        {/* Centre : fond tech + texte */}
        <div
          className="flex-1 flex items-center justify-center gap-8 px-8 relative z-10"
        >
          {/* Texte principal */}
          <div className="text-center relative z-10">
            <p className="text-white font-bold text-xl leading-snug">
              Développez votre réseau<br />
              <span className="font-extrabold text-2xl">Professionnel</span> avec
            </p>
            <p className="text-yellow-300 font-black text-2xl tracking-widest mt-1 uppercase">
              UrbaEvent
            </p>
          </div>
        </div>

        {/* Droite : QR codes + badges stores */}
        <div className="flex-shrink-0 flex items-center gap-5 px-8 py-4 relative z-10">

          {/* Google Play */}
          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="flex items-center gap-1.5 bg-black text-white rounded-lg px-3 py-1.5 w-32">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.18 23.5a2 2 0 0 1-1-.27A2 2 0 0 1 1.22 21.5V2.5a2 2 0 0 1 .96-1.73 2 2 0 0 1 2 0l17.26 9.5a2 2 0 0 1 0 3.46L4.18 23.23a2 2 0 0 1-1 .27z"/>
              </svg>
              <div>
                <p className="text-[8px] leading-none opacity-80">GET IT ON</p>
                <p className="text-[11px] font-bold leading-tight">Google Play</p>
              </div>
            </div>
            <div className="bg-white p-1 rounded group-hover:shadow-lg transition-shadow">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(GOOGLE_PLAY_URL)}&bgcolor=ffffff&color=000000&margin=2`}
                alt="QR Google Play"
                className="w-[72px] h-[72px]"
              />
            </div>
          </a>

          {/* App Store */}
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1.5 group"
          >
            <div className="flex items-center gap-1.5 bg-black text-white rounded-lg px-3 py-1.5 w-32">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div>
                <p className="text-[8px] leading-none opacity-80">Download on the</p>
                <p className="text-[11px] font-bold leading-tight">App Store</p>
              </div>
            </div>
            <div className="bg-white p-1 rounded group-hover:shadow-lg transition-shadow">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(APP_STORE_URL)}&bgcolor=ffffff&color=000000&margin=2`}
                alt="QR App Store"
                className="w-[72px] h-[72px]"
              />
            </div>
          </a>

          {/* Mockup téléphone */}
          <div className="hidden xl:flex items-center ml-2">
            <div className="relative w-14 h-24 bg-gray-900 rounded-2xl border-2 border-gray-700 shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-5 h-1 bg-gray-700 rounded-full" />
              <div className="w-10 h-18 flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-blue-500">
                  <span className="text-white text-[7px] font-black text-center leading-tight">U<br/>E</span>
                </div>
                <span className="text-white text-[6px] font-bold mt-1">UrbaEvent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

