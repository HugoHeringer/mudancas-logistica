import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { useTenantTheme } from '../../theme/TenantProvider';
import { AnimatedSection } from '../luxury/AnimatedSection';
import { SectionDivider } from '../luxury/SectionDivider';
import { cn } from '../../lib/utils';

const defaultImages = [
  'https://images.unsplash.com/photo-1600518464441-9154a4dea847?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80',
  'https://images.unsplash.com/photo-1600573472591-ee6981cf81d0?w=600&q=80',
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80',
];

export function GallerySection() {
  const { brand } = useTenantTheme();
  const images = brand.galeriaUrls?.length ? brand.galeriaUrls : defaultImages;
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <section
      id="galeria"
      className="py-24"
      style={{ backgroundColor: 'var(--brand-surface)' }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedSection>
          <div className="text-center mb-16">
            <span className="section-label">Galeria</span>
            <h2
              className="section-title"
              style={{ color: 'var(--brand-on-surface)' }}
            >
              Os nossos trabalhos
            </h2>
          </div>
        </AnimatedSection>

        <SectionDivider className="mb-16" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((src, i) => (
            <AnimatedSection key={i} delay={i * 100}>
              <div
                className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setLightbox(src)}
              >
                <img
                  src={src}
                  alt={`Galeria ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center"
                  style={{ background: 'transparent' }}
                >
                  <ZoomIn
                    className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ color: 'var(--brand-on-surface-dark)' }}
                  />
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] backdrop-blur-sm flex items-center justify-center p-6"
          style={{ backgroundColor: 'color-mix(in srgb, var(--brand-surface-dark) 90%, transparent)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 transition-colors"
            style={{ color: 'var(--brand-on-surface-dark)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-accent)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-on-surface-dark)')}
            onClick={() => setLightbox(null)}
          >
            <X size={32} />
          </button>
          <img
            src={lightbox}
            alt="Galeria"
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  );
}
