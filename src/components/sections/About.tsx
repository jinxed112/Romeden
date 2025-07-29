import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const balloonsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const balloons = balloonsRef.current;
    const text = textRef.current;

    if (!section || !balloons || !text) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(text, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    );

    const balloonElements = balloons.querySelectorAll('.balloon');
    tl.fromTo(balloonElements,
      { opacity: 0, scale: 0, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' },
      '-=0.5'
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-gradient-to-br from-neutral-50 via-stone-50 to-amber-50/30 relative overflow-hidden min-h-screen flex items-center"
    >
      {/* Étoiles en arrière-plan */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-1 h-1 bg-amber-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-amber-300/40 rounded-full animate-pulse"></div>
        <div className="absolute top-64 left-1/4 w-1 h-1 bg-amber-500/50 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 right-10 w-1 h-1 bg-amber-400/60 rounded-full animate-pulse"></div>
        <div className="absolute bottom-48 left-16 w-1 h-1 bg-amber-300/40 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* Colonne Texte */}
          <div ref={textRef} className="lg:order-1 space-y-8">
            
            {/* Titre */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl leading-tight font-light text-slate-700">
                Bienvenue chez
              </h2>
              <div 
                className="text-3xl lg:text-4xl text-amber-600"
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontWeight: '400',
                  letterSpacing: '0.02em'
                }}
              >
                RomEden Events !
              </div>
              <div className="w-12 h-px bg-gradient-to-r from-amber-400 to-orange-400"></div>
            </div>

            {/* Texte principal */}
            <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
              <p>
                <span className="text-amber-700 font-medium">Je suis Mélissa</span>, 
                maman passionnée de décoration, et je crée avec amour des ambiances magiques 
                pour célébrer les plus beaux moments de la vie.
              </p>
              
              <p className="text-base">
                Spécialisée dans les <span className="text-rose-500 font-medium">anniversaires</span>, 
                <span className="text-pink-500 font-medium"> baby showers</span>, 
                <span className="text-purple-400 font-medium"> baptêmes</span> et 
                <span className="text-coral-500 font-medium"> reveals gender</span>, 
                chaque création est unique et pensée pour transformer vos rêves en réalité.
              </p>

              <p className="text-base text-slate-500 italic border-l-2 border-amber-200 pl-4">
                "Cette petite touche de magie qui rend vos événements inoubliables."
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-12 pt-8 border-t border-slate-100">
              <div>
                <div className="text-3xl font-light text-amber-600">50+</div>
                <div className="text-sm text-slate-500 uppercase tracking-wide">Événements</div>
              </div>
              <div>
                <div className="text-3xl font-light text-rose-500">100%</div>
                <div className="text-sm text-slate-500 uppercase tracking-wide">Satisfaction</div>
              </div>
              <div>
                <div className="text-3xl font-light text-slate-600">2021</div>
                <div className="text-sm text-slate-500 uppercase tracking-wide">Depuis</div>
              </div>
            </div>
          </div>

          {/* Colonne Visuelle */}
          <div className="lg:order-2 relative">
            
            {/* Anges */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-8 left-12 text-xl opacity-40">👼</div>
              <div className="absolute top-16 right-16 text-lg opacity-30">👼</div>
            </div>

            {/* Arche de ballons */}
            <div ref={balloonsRef} className="relative h-80 lg:h-96 flex items-center justify-center">
              
              {/* Ballons côté gauche */}
              <div className="balloon absolute bottom-8 left-12 w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-rose-300 shadow-xl">
                <div className="absolute top-2 left-2 w-2 h-2 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              <div className="balloon absolute bottom-16 left-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 shadow-lg">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              <div className="balloon absolute bottom-28 left-16 w-16 h-16 rounded-full bg-gradient-to-br from-peach-300 to-coral-400 shadow-2xl">
                <div className="absolute top-2 left-2 w-3 h-3 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              {/* Ballon central */}
              <div className="balloon absolute bottom-32 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-pink-300 to-rose-400 shadow-2xl">
                <div className="absolute top-3 left-3 w-4 h-4 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              {/* Ballons côté droit */}
              <div className="balloon absolute bottom-28 right-16 w-16 h-16 rounded-full bg-gradient-to-br from-purple-300 to-purple-400 shadow-2xl">
                <div className="absolute top-2 left-2 w-3 h-3 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              <div className="balloon absolute bottom-16 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 shadow-lg">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white/60 rounded-full blur-sm"></div>
              </div>
              
              <div className="balloon absolute bottom-8 right-12 w-14 h-14 rounded-full bg-gradient-to-br from-green-200 to-emerald-300 shadow-xl">
                <div className="absolute top-2 left-2 w-2 h-2 bg-white/60 rounded-full blur-sm"></div>
              </div>

              {/* Éléments décoratifs */}
              <div className="absolute bottom-12 left-24 text-lg opacity-50">🌸</div>
              <div className="absolute bottom-14 right-24 text-base opacity-40">✨</div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-sm opacity-30">⭐</div>
            </div>

            {/* Photo Mélissa */}
            <div className="absolute bottom-4 right-12 w-24 h-24 rounded-full border-2 border-amber-200 bg-gradient-to-br from-rose-50 to-amber-50 flex items-center justify-center shadow-xl">
              <div className="text-2xl">👩‍🎨</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
