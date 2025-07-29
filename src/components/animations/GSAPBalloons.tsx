import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PremiumTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    console.log('✨ EFFET PREMIUM SANS BALLONS chargé !');

    const ctx = gsap.context(() => {
      
      const createPremiumParticles = () => {
        if (!containerRef.current) return;
        
        console.log('🌟 Création particules premium...');
        
        // Nettoyer
        containerRef.current.innerHTML = '';
        particlesRef.current = [];
        
        // 30 particules dorées premium
        for (let i = 0; i < 30; i++) {
          const particle = document.createElement('div');
          
          const size = 3 + Math.random() * 4;
          const opacity = 0.4 + Math.random() * 0.4;
          
          particle.innerHTML = `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: radial-gradient(circle, #FFD700, #FFA500);
              border-radius: 50%;
              box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.5);
              opacity: ${opacity};
            "></div>
          `;
          
          // Position initiale hors écran
          particle.style.position = 'fixed';
          particle.style.left = `${Math.random() * 100}vw`;
          particle.style.top = '110vh';
          particle.style.pointerEvents = 'none';
          particle.style.zIndex = '60';
          
          containerRef.current.appendChild(particle);
          particlesRef.current.push(particle);
        }
        
        console.log('✅ 30 particules premium créées');
      };

      const setupPremiumEffect = () => {
        const heroSection = document.querySelector('#accueil') as HTMLElement;
        const servicesSection = document.querySelector('#services') as HTMLElement;
        
        if (!heroSection || !servicesSection) {
          setTimeout(setupPremiumEffect, 500);
          return;
        }

        console.log('🎯 Configuration effet premium...');

        // PARALLAX PREMIUM sur Hero
        ScrollTrigger.create({
          trigger: heroSection,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            
            // Parallax du contenu Hero
            gsap.set(heroSection.querySelector('.container'), {
              y: progress * -100,
              opacity: 1 - progress * 0.8,
            });
            
            // Zoom subtil du background
            gsap.set(heroSection, {
              scale: 1 + progress * 0.1,
            });
          }
        });

        // EFFET DE TRANSITION PRINCIPAL
        ScrollTrigger.create({
          trigger: heroSection,
          start: "bottom 85%",
          once: true,
          onEnter: () => {
            console.log('🚀 DÉCLENCHEMENT TRANSITION PREMIUM !');
            executeRemiumTransition(servicesSection);
          }
        });

        // PARALLAX sur Services
        ScrollTrigger.create({
          trigger: servicesSection,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
          onUpdate: (self) => {
            const progress = self.progress;
            
            // Effet de "remontée" douce
            gsap.set(servicesSection, {
              y: -progress * 50,
            });
          }
        });
      };

      const executeRemiumTransition = (servicesSection: HTMLElement) => {
        console.log('🎬 Exécution transition premium');
        
        const timeline = gsap.timeline();
        
        // 1. LANCEMENT DES PARTICULES (effet magique)
        particlesRef.current.forEach((particle, i) => {
          const delay = i * 0.05;
          const targetY = -window.innerHeight - 100;
          const drift = (Math.random() - 0.5) * 200;
          
          timeline.to(particle, {
            y: targetY,
            x: `+=${drift}`,
            rotation: Math.random() * 360,
            scale: 0.5 + Math.random() * 0.8,
            duration: 4 + Math.random() * 2,
            ease: "power1.out",
            delay: delay
          }, 0);
          
          // Scintillement
          timeline.to(particle.firstElementChild, {
            opacity: 0.1,
            duration: 0.2,
            ease: "power2.inOut",
            yoyo: true,
            repeat: -1,
            delay: delay
          }, 0);
        });
        
        // 2. SCROLL AUTOMATIQUE FLUIDE
        timeline.call(() => {
          console.log('📜 Scroll automatique premium');
          servicesSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
          });
        }, [], 0.8);
        
        // 3. EFFET DE "RÉVÉLATION" sur Services
        timeline.fromTo(servicesSection, {
          opacity: 0.7,
          scale: 0.95,
          y: 50
        }, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out"
        }, 1.5);
        
        // 4. ANIMATION DU CONTENU Services
        const serviceCards = servicesSection.querySelectorAll('.bg-gray-50');
        if (serviceCards.length > 0) {
          timeline.fromTo(serviceCards, {
            opacity: 0,
            y: 30,
            scale: 0.9
          }, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
          }, 2);
        }
        
        // 5. CLEANUP des particules
        timeline.call(() => {
          console.log('🧹 Nettoyage particules');
          particlesRef.current.forEach(particle => {
            gsap.to(particle, {
              opacity: 0,
              duration: 1,
              onComplete: () => particle.remove()
            });
          });
        }, [], 6);
      };

      // INITIALISATION
      createPremiumParticles();
      setupPremiumEffect();

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 60 }}
    />
  );
};

export default PremiumTransition;
