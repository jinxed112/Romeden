import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Logo et description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-peach-300 to-coral-400 shadow-md relative">
                  <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/50 rounded-full blur-[1px]"></div>
                </div>
                <div className="absolute -top-1 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-pink-200 to-pink-300 shadow-md">
                  <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white/50 rounded-full blur-[1px]"></div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl italic"
                    style={{
                      fontFamily: 'Dancing Script, cursive',
                      background: 'linear-gradient(145deg, #DAA520, #B8860B)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: '400'
                    }}>
                  RomEden
                </h3>
                <p className="text-xs text-slate-600 uppercase tracking-wide">Events</p>
              </div>
            </div>
            
            <p className="text-slate-600 leading-relaxed mb-6 max-w-md">
              Créatrice passionnée, je transforme vos rêves en réalité pour célébrer 
              chaque moment précieux avec amour et créativité.
            </p>
            
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <span className="text-rose-500 text-lg">📷</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <span className="text-blue-500 text-lg">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                <span className="text-purple-500 text-lg">📌</span>
              </a>
            </div>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Contact</h4>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-center space-x-3">
                <span className="text-amber-500">📧</span>
                <span className="text-sm">hello@romeden-events.fr</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-500">📱</span>
                <span className="text-sm">06 XX XX XX XX</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-500">📍</span>
                <span className="text-sm">Région Parisienne</span>
              </div>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Services</h4>
            <div className="space-y-2 text-slate-600">
              <div className="text-sm hover:text-amber-600 transition-colors cursor-pointer">Anniversaires</div>
              <div className="text-sm hover:text-amber-600 transition-colors cursor-pointer">Baby Showers</div>
              <div className="text-sm hover:text-amber-600 transition-colors cursor-pointer">Baptêmes</div>
              <div className="text-sm hover:text-amber-600 transition-colors cursor-pointer">Reveals Gender</div>
            </div>
          </div>
        </div>
        
        {/* Séparateur */}
        <div className="border-t border-slate-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-slate-500">
              © 2024 RomEden Events - Créations magiques pour moments inoubliables
            </p>
            <div className="flex items-center space-x-6 text-sm text-slate-500">
              <span className="hover:text-amber-600 transition-colors cursor-pointer">Mentions légales</span>
              <span className="hover:text-amber-600 transition-colors cursor-pointer">CGV</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
