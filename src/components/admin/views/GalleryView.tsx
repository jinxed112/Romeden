import React, { useState, useRef } from 'react';
import { useGallery, GalleryImage } from '../../../hooks/useGallery';

const GalleryView: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('tous');
  const [uploadModal, setUploadModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const {
    images,
    loading,
    error,
    stats,
    uploadImage,
    addImage,
    updateImage,
    deleteImage,
    togglePortfolio,
    getImagesByCategory
  } = useGallery();

  const categories = [
    { id: 'tous', label: 'Tous', icon: '🎨' },
    { id: 'anniversaires', label: 'Anniversaires', icon: '🎉' },
    { id: 'baby-showers', label: 'Baby Showers', icon: '👶' },
    { id: 'baptemes', label: 'Baptêmes', icon: '👼' },
    { id: 'gender-reveals', label: 'Gender Reveals', icon: '🎈' },
    { id: 'mariages', label: 'Mariages', icon: '💒' }
  ];

  // Traitement des fichiers uploadés
  const handleFileUpload = async (files: FileList) => {
    setUploading(true);
    
    const uploadPromises = Array.from(files).map(async (file) => {
      const publicUrl = await uploadImage(file);
      if (!publicUrl) return null;

      const imageData: Omit<GalleryImage, 'id'> = {
        src: publicUrl,
        title: file.name.replace(/\.[^/.]+$/, ""),
        category: 'anniversaires',
        alt: file.name,
        date_ajout: new Date().toISOString(),
        order_num: images.length,
        is_portfolio: false,
        tags: [],
        filename: file.name
      };

      return await addImage(imageData);
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successCount = results.filter(r => r !== null).length;
      console.log(`✅ ${successCount}/${files.length} images uploadées`);
      setUploadModal(false);
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  // Event handlers pour drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Modifier une image
  const handleUpdateImage = async (updatedImage: GalleryImage) => {
    const success = await updateImage(updatedImage.id, {
      title: updatedImage.title,
      category: updatedImage.category,
      alt: updatedImage.alt,
      is_portfolio: updatedImage.is_portfolio,
      tags: updatedImage.tags,
      order_num: updatedImage.order_num
    });

    if (success) {
      setEditModal(false);
      setEditingImage(null);
    }
  };

  // Supprimer une image
  const handleDeleteImage = async (image: GalleryImage) => {
    if (!window.confirm('Supprimer cette image définitivement ?')) return;
    await deleteImage(image.id, image.filename);
  };

  const filteredImages = getImagesByCategory(activeFilter);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec stats */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-rose-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📸 Galerie Admin</h1>
            <p className="text-gray-600">Gérez toutes vos photos avec Supabase</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-rose-600">{stats.total}</div>
            <div className="text-sm text-gray-500">photos au total</div>
            <div className="text-xs text-green-600 mt-1">
              {stats.portfolio} en portfolio
            </div>
          </div>
        </div>

        {/* Stats par catégorie */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {categories.slice(1).map(cat => {
            const count = stats.byCategory[cat.id as keyof typeof stats.byCategory] || 0;
            const portfolioCount = images.filter(img => img.category === cat.id && img.is_portfolio).length;
            return (
              <div key={cat.id} className="text-center p-4 bg-white/80 rounded-2xl">
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-lg font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-500">{cat.label}</div>
                {portfolioCount > 0 && (
                  <div className="text-xs text-green-600 font-medium">
                    {portfolioCount} ⭐
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Zone de drop */}
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setUploadModal(true)}
          className={`w-full p-6 border-2 border-dashed rounded-2xl transition-all group cursor-pointer ${
            dragOver 
              ? 'border-green-400 bg-green-50' 
              : 'border-rose-300 bg-rose-50 hover:bg-rose-100'
          }`}
        >
          <div className="text-center">
            <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform ${
              dragOver ? 'animate-bounce' : ''
            }`}>
              {dragOver ? '📥' : '📸'}
            </div>
            <div className="text-lg font-medium text-gray-800 mb-1">
              {dragOver ? 'Déposez vos images ici' : 'Ajouter des photos'}
            </div>
            <div className="text-sm text-gray-600">
              {dragOver ? 'Relâchez pour uploader' : 'Cliquez ou glissez vos images ici'}
            </div>
            {uploading && (
              <div className="mt-3 text-blue-600 font-medium">
                📤 Upload en cours...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-6 border border-rose-100">
        <div className="flex flex-wrap gap-3">
          {categories.map(cat => {
            const count = cat.id === 'tous' ? stats.total : (stats.byCategory[cat.id as keyof typeof stats.byCategory] || 0);
            const portfolioCount = cat.id === 'tous' 
              ? stats.portfolio
              : images.filter(img => img.category === cat.id && img.is_portfolio).length;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-6 py-3 rounded-2xl font-medium transition-all ${
                  activeFilter === cat.id
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
                <span className="ml-2 text-xs opacity-75">
                  ({count}{portfolioCount > 0 && `, ${portfolioCount}⭐`})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des images */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-rose-100">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4 animate-spin">⏳</div>
            <p className="text-gray-600">Chargement des images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl opacity-30 mb-4">📷</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Aucune image</h3>
            <p className="text-gray-600">
              {activeFilter === 'tous' 
                ? 'Commencez par ajouter vos premières photos'
                : `Aucune image dans "${categories.find(c => c.id === activeFilter)?.label}"`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map(image => (
              <div key={image.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                
                {/* Image avec badges */}
                <div className="aspect-square relative">
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedImage(image);
                      setLightboxOpen(true);
                    }}
                  />
                  
                  {/* Badge Portfolio */}
                  {image.is_portfolio && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ⭐ Portfolio
                    </div>
                  )}
                  
                  {/* Badge ordre */}
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                    #{image.order_num}
                  </div>
                </div>
                
                {/* Infos et boutons */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-800 truncate">{image.title}</h3>
                    <p className="text-sm text-gray-500 capitalize flex items-center">
                      <span className="mr-1">
                        {categories.find(c => c.id === image.category)?.icon}
                      </span>
                      {image.category.replace('-', ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(image.date_ajout).toLocaleDateString('fr-FR')}
                    </p>
                    
                    {/* Tags */}
                    {image.tags && image.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.tags.map(tag => (
                          <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => togglePortfolio(image.id, image.is_portfolio)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors font-medium ${
                        image.is_portfolio
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {image.is_portfolio ? '⭐ Portfolio' : '☆ Portfolio'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingImage({...image});
                        setEditModal(true);
                      }}
                      className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteImage(image)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📸 Ajouter des photos</h2>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleInputChange}
              className="w-full p-4 border-2 border-dashed border-rose-300 rounded-2xl bg-rose-50"
            />
            
            <div className="mt-4 text-sm text-gray-600">
              <p>• Images acceptées: JPG, PNG, WebP</p>
              <p>• Taille max recommandée: 5MB par image</p>
              <p>• Upload automatique vers Supabase Storage</p>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setUploadModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {editModal && editingImage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">✏️ Modifier l'image</h2>
            
            {/* Preview */}
            <div className="aspect-video w-full mb-6 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={editingImage.src}
                alt={editingImage.alt}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Formulaire */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={editingImage.title}
                  onChange={(e) => setEditingImage({...editingImage, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  placeholder="Titre de l'image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Catégorie</label>
                <select
                  value={editingImage.category}
                  onChange={(e) => setEditingImage({...editingImage, category: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all text-base"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <input
                  type="text"
                  value={editingImage.alt}
                  onChange={(e) => setEditingImage({...editingImage, alt: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  placeholder="Description de l'image"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">⭐ Portfolio Hero</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_portfolio"
                    checked={editingImage.is_portfolio}
                    onChange={(e) => setEditingImage({...editingImage, is_portfolio: e.target.checked})}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="is_portfolio" className="text-gray-700">
                    Afficher dans le carousel du Hero
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🏷️ Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={editingImage.tags?.join(', ') || ''}
                  onChange={(e) => setEditingImage({
                    ...editingImage, 
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                  })}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  placeholder="ex: premium, featured, tendance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📊 Ordre d'affichage</label>
                <input
                  type="number"
                  value={editingImage.order_num}
                  onChange={(e) => setEditingImage({...editingImage, order_num: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-2xl border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition-all"
                  min="0"
                />
              </div>
            </div>
            
            {/* Boutons */}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditingImage(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => editingImage && handleUpdateImage(editingImage)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-2xl hover:from-green-500 hover:to-emerald-500 transition-all font-medium"
              >
                💾 Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors text-xl"
            >
              ✕
            </button>
            <div className="absolute bottom-4 left-4 right-4 bg-white/90 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800">{selectedImage.title}</h3>
                  <p className="text-gray-600 capitalize flex items-center">
                    <span className="mr-1">
                      {categories.find(c => c.id === selectedImage.category)?.icon}
                    </span>
                    {selectedImage.category.replace('-', ' ')}
                  </p>
                  {selectedImage.tags && selectedImage.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedImage.tags.map(tag => (
                        <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {selectedImage.is_portfolio && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    ⭐ Portfolio
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryView;
