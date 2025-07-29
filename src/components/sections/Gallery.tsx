import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGallery, GalleryImage } from "../../hooks/useGallery";

const Gallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('tous');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  
  // Utiliser useGallery pour récupérer les images depuis Supabase
  const { images: galleryImages, loading, error, getImagesByCategory } = useGallery();

  // Limite pour l'aperçu sur la home page
  const PREVIEW_LIMIT = 6;

  // Mettre à jour les images filtrées (limitées pour l'aperçu)
  useEffect(() => {
    const filtered = activeFilter === 'tous' 
      ? galleryImages 
      : getImagesByCategory(activeFilter);
    
    // Limiter à PREVIEW_LIMIT images pour l'aperçu
    const limitedImages = filtered.slice(0, PREVIEW_LIMIT);
    setFilteredImages(limitedImages);
    
    // Animation d'entrée après la mise à jour
    setTimeout(() => {
      gsap.fromTo('.gallery-item', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.1 }
      );
    }, 50);
  }, [activeFilter, galleryImages, getImagesByCategory]);

  const categories = [
    { id: 'tous', label: 'Tous', count: galleryImages.length },
    { id: 'anniversaires', label: 'Anniversaires', count: getImagesByCategory('anniversaires').length },
    { id: 'baby-showers', label: 'Baby Showers', count: getImagesByCategory('baby-showers').length },
    { id: 'baptemes', label: 'Baptêmes', count: getImagesByCategory('baptemes').length },
    { id: 'gender-reveals', label: 'Gender Reveals', count: getImagesByCategory('gender-reveals').length },
    { id: 'mariages', label: 'Mariages', count: getImagesByCategory('mariages').length }
  ];

  const openLightbox = (image: GalleryImage) => {
    setSelectedImage(image);
    gsap.fromTo('.lightbox', 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.3 }
    );
  };

  const closeLightbox = () => {
    gsap.to('.lightbox', {
      opacity: 0,
      duration: 0.3,
      onComplete: () => setSelectedImage(null)
    });
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = filteredImages.findIndex(img => img.id === selectedImage.id);
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    
    setSelectedImage(filteredImages[newIndex]);
  };

  if (loading) {
    return (
      <section id="galerie" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Galerie</h2>
            <p className="text-gray-600 mb-12">Chargement des images...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="galerie" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Galerie</h2>
            <p className="text-red-600 mb-12">Erreur lors du chargement des images</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="galerie" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Galerie</h2>
          <p className="text-gray-600 mb-8">
            Découvrez nos réalisations à travers une sélection de nos plus beaux événements
          </p>
          
          {/* Filtres */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  activeFilter === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Grille d'images */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <div
              key={image.id}
              className="gallery-item group cursor-pointer overflow-hidden rounded-lg shadow-lg bg-white"
              onClick={() => openLightbox(image)}
            >
              <div className="aspect-w-16 aspect-h-12 overflow-hidden">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                    <p className="text-sm uppercase tracking-wide">{image.category}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Aucune image trouvée pour cette catégorie
            </p>
          </div>
        )}

        {/* Bouton Voir tout si il y a plus d'images */}
        {(() => {
          const totalImages = activeFilter === 'tous' 
            ? galleryImages.length 
            : getImagesByCategory(activeFilter).length;
          
          return totalImages > PREVIEW_LIMIT ? (
            <div className="text-center mt-12">
              <div className="mb-4">
                <p className="text-gray-600">
                  Aperçu de {PREVIEW_LIMIT} sur {totalImages} images
                </p>
              </div>
              <button
                onClick={() => window.location.href = '/galerie'}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Voir toute la galerie</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Découvrez toutes nos créations avec filtres et recherche
              </p>
            </div>
          ) : null;
        })()}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={32} />
            </button>
            
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronLeft size={40} />
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
            >
              <ChevronRight size={40} />
            </button>

            <div className="text-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-gray-300 uppercase tracking-wide">{selectedImage.category.replace('-', ' ')}</p>
                {selectedImage.alt && (
                  <p className="text-gray-300 mt-2">{selectedImage.alt}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;