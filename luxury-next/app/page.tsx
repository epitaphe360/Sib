import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ProjectGallery from '@/components/ProjectGallery'
import Heritage from '@/components/Heritage'

export default function HomePage() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <ProjectGallery />
      <Heritage />

      {/* Footer minimal */}
      <footer className="border-t border-[#EEE] py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="font-cormorant text-xl font-light tracking-[-0.02em] text-[#4A4A4A]">
              Lumière
            </span>
            <span className="font-inter text-[9px] tracking-[0.3em] text-[#E7D192] uppercase mt-0.5">
              Architecture
            </span>
          </div>

          <p className="font-inter text-[11px] font-light text-[#4A4A4A]/40 tracking-[0.05em] text-center">
            © {new Date().getFullYear()} Lumière Architecture. Tous droits réservés.
          </p>

          <div className="flex items-center gap-8">
            {['Instagram', 'LinkedIn', 'Pinterest'].map((social) => (
              <a
                key={social}
                href="#"
                className="font-inter text-[10px] tracking-[0.15em] text-[#4A4A4A]/40 uppercase hover:text-[#E7D192] transition-colors duration-300"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  )
}
