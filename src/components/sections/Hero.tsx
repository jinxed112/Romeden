import React, { useEffect, useRef, useState } from 'react';
import { Star, ArrowRight, Instagram, Music2 } from 'lucide-react';
import { gsap } from 'gsap';
import { useGallery, GalleryImage } from "../../hooks/useGallery";

const Hero: React.FC = () => {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // États pour le carousel
  const { getPortfolioImages, loading } = useGallery();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Charger les images portfolio depuis Supabase
  useEffect(() => {
    const loadPortfolioImages = async () => {
      if (!loading) {
        const portfolioImages = getPortfolioImages();
        setImages(portfolioImages);
      }
    };

    loadPortfolioImages();
  }, [getPortfolioImages, loading]);

  // Carousel automatique
  useEffect(() => {
    if (images.length === 0) return;

    const carouselInterval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }, 4000); // Change toutes les 4 secondes

    return () => clearInterval(carouselInterval);
  }, [images.length]);

  // Animation du changement d'image
  useEffect(() => {
    if (images.length > 0 && carouselRef.current) {
      gsap.fromTo(carouselRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentImageIndex]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Badge animation
      tl.fromTo(badgeRef.current, 
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 }
      );

      // Title words animation
      const titleWords = titleRef.current?.querySelectorAll('.word');
      if (titleWords) {
        tl.fromTo(titleWords,
          { opacity: 0, y: 50, rotateX: -90 },
          { 
            opacity: 1, 
            y: 0, 
            rotateX: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)"
          },
          "-=0.4"
        );
      }

      // Description
      tl.fromTo(descRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.3"
      );

      // Tags - Animation plus subtile et élégante
      const tags = tagsRef.current?.querySelectorAll('.tag');
      if (tags) {
        tl.fromTo(tags,
          { opacity: 0, y: 20, scale: 0.8 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power2.out"
          },
          "-=0.2"
        );
      }

      // Buttons
      const buttons = ctaRef.current?.querySelectorAll('button');
      if (buttons) {
        tl.fromTo(buttons,
          { opacity: 0, y: 30, scale: 0.9 },
          { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power2.out"
          },
          "-=0.4"
        );
      }

      // Visual container
      gsap.fromTo(visualRef.current,
        { opacity: 0, scale: 0.9, y: 20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0,
          duration: 1.0,
          ease: "power2.out",
          delay: 0.5
        }
      );

      // Cards flottantes - Animations plus élégantes
      gsap.fromTo(card1Ref.current,
        { opacity: 0, y: -30, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 1.0,
          ease: "power2.out",
          delay: 1.2
        }
      );

      gsap.fromTo(card2Ref.current,
        { opacity: 0, y: 30, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 1.0,
          ease: "power2.out",
          delay: 1.4
        }
      );

      gsap.fromTo(card3Ref.current,
        { opacity: 0, x: 30, scale: 0.8 },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1,
          duration: 1.0,
          ease: "power2.out",
          delay: 1.6
        }
      );

      // Scroll indicator
      gsap.fromTo(scrollRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0,
          duration: 0.8,
          delay: 2
        }
      );

      // Animation continue subtile pour les cards (plus élégante)
      gsap.to(card1Ref.current, {
        y: -8,
        duration: 3,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2
      });

      gsap.to(card2Ref.current, {
        y: 8,
        duration: 2.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.5
      });

      gsap.to(card3Ref.current, {
        y: -5,
        duration: 2.8,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 3
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const currentImage = images.length > 0 ? images[currentImageIndex] : null;

  const getCategoryIcon = (category: string) => {
    const icons = {
      'anniversaires': '🎉',
      'baby-showers': '👶',
      'baptemes': '👼',
      'gender-reveals': '🎈',
      'mariages': '💒'
    };
    return icons[category as keyof typeof icons] || '🎨';
  };

  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50"
    >
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-pink-200/20 to-transparent blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-yellow-200/20 to-transparent blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-orange-200/10 to-transparent blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 min-h-screen items-center py-20">
          
          <div className="lg:col-span-7 space-y-6">
            <div 
              ref={badgeRef}
              className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-yellow-200/50 rounded-full px-4 py-2 text-sm text-gray-700 shadow-lg"
            >
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
              <span className="font-medium">Créatrice passionnée</span>
              <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
              <span className="text-yellow-600 font-semibold">Depuis 2021</span>
            </div>

            <div ref={titleRef} className="space-y-2">
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block text-gray-900 word">Créations</span>
                <span className="block bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent word">magiques</span>
                <span className="block text-gray-600 text-3xl sm:text-4xl lg:text-5xl word">pour vos</span>
                <span className="block text-gray-900 word">moments</span>
                <span className="block bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent word">inoubliables</span>
              </h1>
            </div>

            <div ref={descRef} className="space-y-3 max-w-lg">
              <p className="text-lg text-gray-600">
                <span className="font-semibold text-yellow-600">Mélissa</span>, maman passionnée de décoration
              </p>
              <p className="text-gray-600">
                Je transforme vos rêves en réalité pour célébrer chaque moment précieux
              </p>
            </div>

            <div ref={tagsRef} className="flex flex-wrap gap-3">
              {['Anniversaires', 'Baby Showers', 'Baptêmes', 'Reveals'].map((service) => (
                <span 
                  key={service}
                  className="tag px-4 py-2 bg-white/60 backdrop-blur-sm text-gray-700 rounded-full text-sm font-medium border border-yellow-200/40 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  {service}
                </span>
              ))}
            </div>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => {
                  window.open('https://www.instagram.com/romeden_events/?igsh=N3lrNGxiODJvOWhw#', '_blank');
                }}
                className="btn-primary group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Instagram className="w-5 h-5" />
                <span>Découvrir mes créations</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => {
                  window.open('https://www.tiktok.com/@romeden.events?_t=ZG-8yPdr0plDlJ&_r=1', '_blank');
                }}
                className="btn-secondary inline-flex items-center justify-center gap-3 text-gray-700 hover:text-pink-600 px-6 py-4 font-medium transition-all duration-300 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 hover:border-pink-300 hover:bg-white/80 shadow-sm hover:shadow-md"
              >
                <Music2 className="w-4 h-4" />
                <span>Voir mes réalisations</span>
              </button>
            </div>
          </div>

          <div ref={visualRef} className="lg:col-span-5 relative">
            <div className="relative max-w-sm mx-auto">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden aspect-[3/4] border border-white/50">
                
                {/* Carousel d'images ou placeholder */}
                <div ref={carouselRef} className="absolute inset-0">
                  {currentImage ? (
                    // Image réelle du carousel
                    <div className="relative w-full h-full">
                      <img
                        src={currentImage.src}
                        alt={currentImage.alt}
                        className="w-full h-full object-cover"
                      />
                      {/* Overlay avec infos */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getCategoryIcon(currentImage.category)}</span>
                          <span className="text-sm font-medium capitalize">
                            {currentImage.category.replace('-', ' ')}
                          </span>
                          {/* Badge Portfolio */}
                          <div className="bg-green-500/90 text-white px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ Portfolio
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold truncate">{currentImage.title}</h3>
                        {currentImage.tags && currentImage.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {currentImage.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-white/20 text-white px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Indicateurs de progression */}
                      <div className="absolute top-4 left-4 right-4">
                        <div className="flex space-x-1">
                          {images.map((_, index) => (
                            <div
                              key={index}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                index === currentImageIndex 
                                  ? 'bg-white flex-1' 
                                  : 'bg-white/40 w-1'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Placeholder si pas d'images portfolio
                    <div className="bg-gradient-to-br from-pink-50 to-yellow-50 flex items-center justify-center h-full">
                      <div className="text-center space-y-4 p-6">
                        <div className="text-6xl opacity-60 animate-pulse">🎨</div>
                        <div className="text-lg font-medium text-gray-600">Portfolio</div>
                        <div className="text-sm text-gray-500 max-w-48">
                          {loading ? 'Chargement...' : 'Ajoutez vos créations dans l\'admin et cochez "Portfolio" ⭐'}
                        </div>
                        {!loading && (
                          <div className="text-xs text-gray-400 mt-2">
                            Admin → Galerie → Toggle Portfolio
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cards statistiques */}
              <div 
                ref={card1Ref}
                className="absolute -top-6 -right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
                    {images.length > 0 ? `${images.length}+` : '⭐'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {images.length > 0 ? 'Portfolio' : 'Premium'}
                  </div>
                </div>
              </div>

              <div 
                ref={card2Ref}
                className="absolute -bottom-4 -left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">100%</div>
                  <div className="text-xs text-gray-600">Satisfaction</div>
                </div>
              </div>

              <div 
                ref={card3Ref}
                className="absolute top-1/2 -right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/50"
              >
                <div className="text-center">
                  <div className="text-xl">🎉</div>
                  <div className="text-xs text-gray-600 whitespace-nowrap">Événements</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer group"
          onClick={() => {
            document.getElementById('galerie')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="flex flex-col items-center space-y-2 text-gray-500 hover:text-yellow-600 transition-colors">
            <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center pt-2">
              <div className="w-1 h-3 bg-current rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs font-medium uppercase tracking-wider">Découvrir</span>
            <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
              🎈 Mes créations magiques 🎈
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;