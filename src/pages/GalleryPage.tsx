import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { X, ChevronLeft, ChevronRight, Search, Grid, List, ArrowLeft } from 'lucide-react';
import { useGallery, GalleryImage } from "../hooks/useGallery";

const GalleryPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>('tous');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage] = useState(12);
  
  // Utiliser useGallery pour récupérer les images depuis Supabase
  const { images: galleryImages, loading, error, getImagesByCategory } = useGallery();

  // Mettre à jour les images filtrées avec recherche
  useEffect(() => {
    let filtered = activeFilter === 'tous' 
      ? galleryImages 
      : getImagesByCategory(activeFilter);
    
    // Appliquer la recherche
    if (searchTerm.trim()) {
      filtered = filtered.filter(image => 
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.alt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredImages(filtered);
    setCurrentPage(1); // Reset à la page 1 lors du filtrage
    
    // Animation d'entrée
    setTimeout(() => {
      gsap.fromTo('.gallery-item', 
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05 }
      );
    }, 50);
  }, [activeFilter, galleryImages, getImagesByCategory, searchTerm]);

  const categories = [
    { id: 'tous', label: 'Tous', icon: '🎨', count: galleryImages.length },
    { id: 'anniversaires', label: 'Anniversaires', icon: '🎉', count: getImagesByCategory('anniversaires').length },
    { id: 'baby-showers', label: 'Baby Showers', icon: '👶', count: getImagesByCategory('baby-showers').length },
    { id: 'baptemes', label: 'Baptêmes', icon: '👼', count: getImagesByCategory('baptemes').length },
    { id: 'gender-reveals', label: 'Gender Reveals', icon: '🎈', count: getImagesByCategory('gender-reveals').length },
    { id: 'mariages', label: 'Mariages', icon: '💒', count: getImagesByCategory('mariages').length }
  ];

  // Pagination
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = filteredImages.slice(startIndex, startIndex + imagesPerPage);

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
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Galerie Complète</h1>
            <div className="text-6xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600">Chargement des images...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Galerie Complète</h1>
            <p className="text-red-600 mb-12">Erreur lors du chargement des images</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Accueil</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Galerie Complète</h1>
                <p className="text-gray-600">
                  {filteredImages.length} image{filteredImages.length > 1 ? 's' : ''} 
                  {searchTerm && ` pour "${searchTerm}"`}
                  {activeFilter !== 'tous' && ` dans ${categories.find(c => c.id === activeFilter)?.label}`}
                </p>
              </div>
            </div>

            {/* Mode d'affichage */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('masonry')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'masonry' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveFilter(category.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                  activeFilter === category.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
                <span className="text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {currentImages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl opacity-30 mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune image trouvée</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `Aucun résultat pour "${searchTerm}"`
                : `Aucune image dans "${categories.find(c => c.id === activeFilter)?.label}"`
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Effacer la recherche
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grille d'images */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {currentImages.map((image) => (
                <div
                  key={image.id}
                  className="gallery-item group cursor-pointer overflow-hidden rounded-xl shadow-lg bg-white hover:shadow-xl transition-all duration-300"
                  onClick={() => openLightbox(image)}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === 'masonry' ? 'aspect-auto' : 'aspect-square'
                  }`}>
                    <img
                      src={image.src}
                      alt={image.title}
                      className={`w-full object-cover transition-transform duration-500 group-hover:scale-110 ${
                        viewMode === 'masonry' ? 'h-auto' : 'h-full'
                      }`}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {image.is_portfolio && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                          ⭐ Portfolio
                        </div>
                      )}
                      <div className="bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                        {categories.find(c => c.id === image.category)?.icon}
                      </div>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                        <h3 className="text-lg font-bold mb-2">{image.title}</h3>
                        <p className="text-sm uppercase tracking-wide mb-2">
                          {image.category.replace('-', ' ')}
                        </p>
                        {image.tags && image.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {image.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-white/20 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info card */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">{image.title}</h3>
                    <p className="text-sm text-gray-500 capitalize flex items-center mt-1">
                      <span className="mr-1">
                        {categories.find(c => c.id === image.category)?.icon}
                      </span>
                      {image.category.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(image.date_ajout).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              Page {currentPage} sur {totalPages} • {filteredImages.length} image{filteredImages.length > 1 ? 's' : ''} au total
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="lightbox fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-6xl max-h-full p-4">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
            >
              <ChevronLeft size={32} />
            </button>
            
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 p-2 rounded-full"
            >
              <ChevronRight size={32} />
            </button>

            <div className="text-center">
              <img
                src={selectedImage.src}
                alt={selectedImage.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-white max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-2">
                  <h3 className="text-2xl font-bold">{selectedImage.title}</h3>
                  {selectedImage.is_portfolio && (
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Portfolio
                    </div>
                  )}
                </div>
                <p className="text-gray-300 uppercase tracking-wide mb-2">
                  {categories.find(c => c.id === selectedImage.category)?.icon} {selectedImage.category.replace('-', ' ')}
                </p>
                {selectedImage.alt && (
                  <p className="text-gray-300 mb-3">{selectedImage.alt}</p>
                )}
                {selectedImage.tags && selectedImage.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedImage.tags.map(tag => (
                      <span key={tag} className="text-xs bg-white/20 text-white px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3">
                  {new Date(selectedImage.date_ajout).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;