import React, { useEffect, useState } from 'react';

interface BalloonCluster {
  id: string;
  side: 'left' | 'right';
  x: number;
  y: number;
  balloons: Array<{
    offsetX: number;
    offsetY: number;
    size: number;
    color: string;
    opacity: number;
  }>;
}

const FloatingBalloons: React.FC = () => {
  const [clusters, setClusters] = useState<BalloonCluster[]>([]);
  const [isLifting, setIsLifting] = useState(false);

  const balloonColors = [
    '#FFB6C1', '#FF69B4', '#FFE4E6', // Roses
    '#DDA0DD', '#9370DB', '#E6E6FA', // Violets  
    '#FFC0CB', '#FF1493', '#FFF0F5', // Pinks
    '#D8BFD8', '#BA55D3', '#F8F8FF'  // Lavandes
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const triggerPoint = 100;
      
      if (scrollY > triggerPoint && !isLifting) {
        setIsLifting(true);
        createBalloonClusters();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLifting]);

  const createBalloonClusters = () => {
    const newClusters: BalloonCluster[] = [];
    
    // Grappe gauche
    const leftCluster: BalloonCluster = {
      id: 'left-cluster',
      side: 'left',
      x: 15, // 15% from left
      y: 100, // Start below viewport
      balloons: []
    };

    // Créer 25 ballons pour la grappe gauche
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 30 + Math.random() * 60;
      leftCluster.balloons.push({
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius,
        size: 40 + Math.random() * 30,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        opacity: 0.8 + Math.random() * 0.2
      });
    }

    // Grappe droite
    const rightCluster: BalloonCluster = {
      id: 'right-cluster', 
      side: 'right',
      x: 85, // 85% from left
      y: 100,
      balloons: []
    };

    // Créer 25 ballons pour la grappe droite
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 30 + Math.random() * 60;
      rightCluster.balloons.push({
        offsetX: Math.cos(angle) * radius,
        offsetY: Math.sin(angle) * radius,
        size: 40 + Math.random() * 30,
        color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
        opacity: 0.8 + Math.random() * 0.2
      });
    }

    setClusters([leftCluster, rightCluster]);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {clusters.map((cluster) => (
        <BalloonClusterComponent key={cluster.id} cluster={cluster} />
      ))}
    </div>
  );
};

const BalloonClusterComponent: React.FC<{ cluster: BalloonCluster }> = ({ cluster }) => {
  const [position, setPosition] = useState({ x: cluster.x, y: cluster.y });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Animation d'apparition puis de montée
    setTimeout(() => {
      setOpacity(1);
      
      const liftAnimation = () => {
        const startTime = Date.now();
        const duration = 4000; // 4 secondes pour l'effet de "tirage"
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = elapsed / duration;
          
          if (progress >= 1) {
            // Animation terminée, faire disparaître
            setOpacity(0);
            return;
          }
          
          // Courbe d'easing pour effet naturel
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          
          // Mouvement vers le haut avec effet de "tirage"
          const newY = cluster.y - (easeOutQuart * 120); // Monte de 120vh
          
          // Léger mouvement horizontal pour effet naturel
          const swayX = Math.sin(progress * Math.PI * 2) * 5;
          const newX = cluster.x + swayX;
          
          setPosition({ x: newX, y: newY });
          
          requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
      };
      
      // Démarrer l'animation de montée après un court délai
      setTimeout(liftAnimation, 500);
      
    }, 300);
  }, [cluster]);

  return (
    <div
      className="absolute transition-opacity duration-1000"
      style={{
        left: `${position.x}%`,
        top: `${position.y}vh`,
        opacity,
        transform: 'translate(-50%, -50%)',
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))'
      }}
    >
      {/* Ficelles qui attachent les ballons */}
      <svg 
        width="200" 
        height="200" 
        viewBox="-100 -100 200 200"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ zIndex: 1 }}
      >
        {cluster.balloons.map((balloon, index) => (
          <line
            key={`string-${index}`}
            x1="0"
            y1="0"
            x2={balloon.offsetX}
            y2={balloon.offsetY}
            stroke="rgba(139, 69, 19, 0.6)"
            strokeWidth="1"
            opacity="0.7"
          />
        ))}
      </svg>
      
      {/* Les ballons de la grappe */}
      {cluster.balloons.map((balloon, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${balloon.offsetX}px`,
            top: `${balloon.offsetY}px`,
            transform: 'translate(-50%, -50%)',
            zIndex: 2
          }}
        >
          <svg width={balloon.size} height={balloon.size * 1.2} viewBox="0 0 100 120">
            <defs>
              <radialGradient id={`gradient-${cluster.id}-${index}`} cx="0.3" cy="0.3" r="0.7">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="50%" stopColor={balloon.color} />
                <stop offset="100%" stopColor={balloon.color} stopOpacity="0.8" />
              </radialGradient>
            </defs>
            
            {/* Ballon principal */}
            <ellipse
              cx="50"
              cy="45"
              rx="35"
              ry="45"
              fill={`url(#gradient-${cluster.id}-${index})`}
              opacity={balloon.opacity}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            
            {/* Reflet brillant */}
            <ellipse
              cx="40"
              cy="35"
              rx="8"
              ry="12"
              fill="rgba(255,255,255,0.7)"
              opacity="0.8"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default FloatingBalloons;
