import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('accueil');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Scroll spy simplifié
      const sections = ['accueil', 'services', 'apropos', 'galerie', 'contact'];
      const scrollPosition = window.scrollY + 100;
      
      let newActiveSection = 'accueil';
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const elementTop = element.offsetTop;
          if (scrollPosition >= elementTop - 50) {
            newActiveSection = sections[i];
            break;
          }
        }
      }
      
      setActiveSection(newActiveSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    const navbarHeight = 80;
    const elementPosition = element.offsetTop - navbarHeight;
    
    window.scrollTo({
      top: Math.max(0, elementPosition),
      behavior: 'smooth'
    });
    
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'services', label: 'Services' },
    { id: 'apropos', label: 'À Propos' },
    { id: 'galerie', label: 'Galerie' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled 
        ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-peach-100" 
        : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => scrollToSection('accueil')}
          >
            <div className="relative group-hover:scale-110 transition-transform duration-300">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-peach-300 to-coral-400 shadow-md relative">
                <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/50 rounded-full blur-[1px]"></div>
              </div>
              
              <div className="absolute -top-1 right-2 w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 shadow-md">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/50 rounded-full blur-[1px]"></div>
              </div>
              
              <div className="absolute top-3 right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-md">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/50 rounded-full blur-[1px]"></div>
              </div>
              
              <div className="absolute top-1 -left-2 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-gradient-to-br from-green-200 to-green-300 shadow-md">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/50 rounded-full blur-[1px]"></div>
              </div>
              
              <div className="absolute -top-2 left-1 w-3 h-3 lg:w-4 lg:h-4 rounded-full bg-gradient-to-br from-purple-200 to-purple-300 shadow-md opacity-80">
                <div className="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white/50 rounded-full"></div>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="flex flex-col">
                <h1 className="text-2xl lg:text-3xl italic tracking-wide group-hover:scale-105 transition-transform duration-300"
                    style={{
                      fontFamily: 'Dancing Script, Brush Script MT, cursive',
                      background: 'linear-gradient(145deg, #DAA520 0%, #B8860B 50%, #CD853F 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      textShadow: '2px 2px 4px rgba(184, 134, 11, 0.3)',
                      filter: 'drop-shadow(1px 1px 2px rgba(184, 134, 11, 0.2))',
                      fontWeight: '400',
                      letterSpacing: '0.02em'
                    }}>
                  RomEden
                </h1>
                
                <p className="text-xs lg:text-sm tracking-[0.4em] -mt-1"
                   style={{
                     fontFamily: 'Inter, Arial, sans-serif',
                     background: 'linear-gradient(145deg, #DAA520 0%, #B8860B 50%, #CD853F 100%)',
                     WebkitBackgroundClip: 'text',
                     WebkitTextFillColor: 'transparent',
                     backgroundClip: 'text',
                     textShadow: '1px 1px 2px rgba(184, 134, 11, 0.3)',
                     fontWeight: '500',
                     letterSpacing: '0.4em',
                     fontSize: '0.75rem'
                   }}>
                  EVENTS
                </p>
              </div>
            </div>

            <div className="sm:hidden">
              <h1 className="text-lg italic"
                  style={{
                    fontFamily: 'Dancing Script, cursive',
                    background: 'linear-gradient(145deg, #DAA520, #B8860B)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '400'
                  }}>
                RomEden
              </h1>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "relative px-3 py-2 text-sm font-medium transition-all duration-200",
                  activeSection === item.id 
                    ? "text-amber-600 font-semibold" 
                    : "text-gray-700 hover:text-amber-600"
                )}
              >
                {item.label}
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden lg:block">
            <button
              onClick={() => scrollToSection('contact')}
              className="bg-gradient-to-r from-peach-400 to-coral-500 text-white px-6 py-2.5 rounded-full font-medium text-sm hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md"
            >
              Demander un devis
            </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className={cn(
                "h-0.5 bg-gray-600 transition-all duration-300",
                isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
              )} />
              <div className={cn(
                "h-0.5 bg-gray-600 transition-all duration-300",
                isMobileMenuOpen ? "opacity-0" : ""
              )} />
              <div className={cn(
                "h-0.5 bg-gray-600 transition-all duration-300",
                isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
              )} />
            </div>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white/95 backdrop-blur-md z-40">
          <div className="px-4 py-6 space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  "block w-full text-left px-4 py-3 text-lg font-medium rounded-lg transition-colors duration-300",
                  activeSection === item.id 
                    ? "bg-amber-50 text-amber-600 border-l-4 border-amber-400" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => scrollToSection('contact')}
                className="w-full bg-gradient-to-r from-peach-400 to-coral-500 text-white px-6 py-3 rounded-full font-medium text-lg hover:shadow-lg transition-all duration-300"
              >
                Demander un devis
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
